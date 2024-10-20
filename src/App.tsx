import { useEffect, useState, useRef } from "react";
import { Upload, AlertCircle, Play, Pause } from "lucide-react";
import { loadFFmpeg } from "./lib/utils";
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
    // only video files valid show error
    if (file) {
      if (!file.type.startsWith("video/")) {
        setError("Please select a valid video file.");
        return;
      }
    }

    if (file) {
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

  return (
    <>
      {
        isLoaded ? (
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-pink-500 to-rose-500">
            <h1 className="text-4xl font-bold text-white text-center" >Make a video trim with shorts</h1>
            {/* show error */}
            {!file && !video && error && (
              <div className="bg-red-300 text-white p-2 rounded-md mt-2 flex items-center gap-2">
                <AlertCircle aria-hidden="true" className="size-4 text-red-800" />
                <p className="text-red-800 text-center">{error}</p>

              </div>
            )}
            {/* show upload section */}
            {
              !file && !video && (
                <div className="mt-2 w-9/12 sm:w-1/2 flex justify-center rounded-lg border border-dashed border-white bg-white/40 mx-3 px-8 py-10">
                  <div className="text-center">
                    {/* <Video aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" /> */}
                    <Upload aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600 word-break whitespace-nowrap">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md  font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" accept=".mp4,.mov,.avi" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1 word-break"> or drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-gray-600">MP4, MOV, AVI up to 100MB</p>

                  </div>
                </div>
              )
            }
            {/* file is selected */}
            {
              !file && video && (
                <>
                  {
                    videoUrl ? (
                      <>
                        <video ref={videoRef} src={videoUrl} className="size-96" />
                        <div className="flex items-center mt-4 space-x-4">
                          <button onClick={() => handlePlayPause()} className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-1">
                            {isPlaying ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
                            {isPlaying ? "Pause" : "Play"}
                          </button>
                          <p className="text-white font-bold">00:00 / 00:00</p>
                        </div>
                      </>
                    ) : (
                      <p>Loading...</p>
                    )
                  }

                </>
              )
              // show loading

            }

            {/* show trim section */}
          </div>
        ) : (
          <Loading />
        )
      }
    </>
  )
}
