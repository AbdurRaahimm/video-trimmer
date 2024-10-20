import { useEffect, useState, useRef } from "react";
import { Upload, AlertCircle, Play, Pause } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { loadFFmpeg, convertToHHMMSS } from "./lib/utils";
import Loading from "./components/Loading";

declare global {
  interface Window {
    FFmpeg: any;
  }
}
let ffmpeg: any;

export default function App() {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [range, setRange] = useState<number[]>([0, 0]); // Default range for the slider
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    loadFFmpeg("https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.2/dist/ffmpeg.min.js")
      .then(() => {
        if (typeof window !== "undefined" && window.FFmpeg) {
          ffmpeg = window.FFmpeg.createFFmpeg({ log: true });
          ffmpeg.load().then(() => {
            setIsLoaded(true);
          });
        }
      })
      .catch((err: Error) => console.error("Error loading ffmpeg:", err));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video file.");
        return;
      }

      const blobUrl = URL.createObjectURL(file);
      setVideo(file);
      setVideoUrl(blobUrl);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying); // Toggle play/pause state
    }
  };

  const handleSliderChange = (value: number[]) => {
    setRange(value); // Update range state with slider value
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]; // Sync video start time with the slider
    }
  };

  // Ensure the metadata is loaded and the duration is set
  useEffect(() => {
    if (videoRef.current) {
      const currentVideo = videoRef.current;
      currentVideo.onloadedmetadata = () => {
        const duration = currentVideo.duration;
        setVideoDuration(duration);
        setRange([0, duration]); // Set range to cover full video duration initially
      };
    }
  }, [video]);


  const handleTrimVideo = async () => {
    if (isLoaded && video && videoRef && videoRef.current) {
      try {
        const { name } = video; // Get the video file name and type
        const outputFileName = "output.mp4"; // Name for the output file

        // Write the input video file to FFmpeg's virtual file system (FS)
        ffmpeg.FS("writeFile", name, await window.FFmpeg.fetchFile(video));

        // Run the trimming command with FFmpeg
        await ffmpeg.run(
          "-i", name,                     // Input file name
          "-ss", `${convertToHHMMSS(range[0])}`,  // Start time from slider
          "-to", `${convertToHHMMSS(range[1])}`,  // End time from slider
          "-acodec", "copy",              // Copy the audio codec
          "-vcodec", "copy",              // Copy the video codec
          outputFileName                  // Output file name
        );

        // Read the trimmed output file from the virtual file system
        const data = ffmpeg.FS("readFile", outputFileName);

        // Create a Blob from the output file data
        const blob = new Blob([data.buffer], { type: "video/mp4" });
        const url = URL.createObjectURL(blob);

        // Set the URL for the trimmed video to display it
        setTrimmedVideoUrl(url);

        console.log("Video trimming successful!");
      } catch (error) {
        console.error("Error trimming video:", error);
      }
    }
  };


  return (
    <>
      {isLoaded ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-pink-500 to-rose-500">
          <h1 className="text-4xl font-bold text-white text-center">
            Make a video trim with shorts
          </h1>

          {/* Show error */}
          {!file && !video && error && (
            <div className="bg-red-300 text-white p-2 rounded-md mt-2 flex items-center gap-2">
              <AlertCircle aria-hidden="true" className="size-4 text-red-800" />
              <p className="text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Only show upload or video editing section when trimmed video is not available */}
          {!trimmedVideoUrl && (
            <>
              {/* Show upload section */}
              {!file && !video && (
                <div className="mt-2 w-9/12 sm:w-1/2 flex justify-center rounded-lg border border-dashed border-white bg-white/40 mx-3 px-8 py-10">
                  <div className="text-center">
                    <Upload aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="video/*"
                          className="sr-only"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1"> or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">MP4, MOV, AVI up to 100MB</p>
                  </div>
                </div>
              )}

              {/* Video is selected section */}
              {video && videoUrl && (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className="size-96"
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setVideoDuration(videoRef.current.duration);
                        setRange([0, videoRef.current.duration]);
                      }
                    }}
                  />

                  <SliderPrimitive.Root
                    className="relative flex items-center select-none touch-none w-full sm:w-5/12 h-5 "
                    value={range}
                    onValueChange={handleSliderChange}
                    min={0}
                    max={videoDuration}
                    step={1}
                  >
                    <SliderPrimitive.Track className="bg-gray-700 relative grow rounded-full h-3">
                      <SliderPrimitive.Range className="absolute bg-green-500 rounded-full h-full" />
                    </SliderPrimitive.Track>
                    {range.map((value, index) => (
                      <SliderPrimitive.Thumb
                        key={index}
                        className="block w-5 h-5 bg-white rounded-full focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75"
                      >
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white text-xs">
                          {convertToHHMMSS(value)} {/* Display formatted time */}
                        </div>
                      </SliderPrimitive.Thumb>
                    ))}
                  </SliderPrimitive.Root>

                  <div className="flex items-center mt-8 space-x-4">
                    <button
                      onClick={handlePlayPause}
                      className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-1"
                    >
                      {isPlaying ? (
                        <Pause aria-hidden="true" className="size-4" />
                      ) : (
                        <Play aria-hidden="true" className="size-4" />
                      )}
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                    <p className="text-white font-bold">
                      ({convertToHHMMSS(range[0])} / {convertToHHMMSS(range[1])})
                    </p>
                    <button
                      onClick={handleTrimVideo}
                      className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                      Trim Video
                    </button>
                  </div>
                </>
              )}
            </>
          )}

         
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}
