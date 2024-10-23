import { useEffect, useState, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { loadFFmpeg } from "./lib/utils";
import Loading from "./components/Loading";
import UploadVideo from "./components/UploadVideo";
import DisplayVideo from "./components/displayVideo";
import TrimmedVideo from "./components/TrimmedVideo";

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
                <UploadVideo handleFileChange={handleFileChange} />
              )}

              {/* Video is selected section */}
              {video && videoUrl && (
                <DisplayVideo
                  videoUrl={videoUrl}
                  videoRef={videoRef}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                  ffmpeg={ffmpeg}
                  video={video}
                  range={range}
                  setRange={setRange}
                  isLoaded={isLoaded}
                  videoDuration={videoDuration}
                  setVideoDuration={setVideoDuration}
                  setTrimmedVideoUrl={setTrimmedVideoUrl}
                />
              )}
            </>
          )}

          {/* Show trimmed video section when available */}
          {trimmedVideoUrl && (
            <TrimmedVideo
              trimmedVideoUrl={trimmedVideoUrl}
              setTrimmedVideoUrl={setTrimmedVideoUrl}
              
            />
          )}
        </div>
      ) : (
        <Loading />
      )}
    </>
  );
}
