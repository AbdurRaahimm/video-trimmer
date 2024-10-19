import { useEffect, useState } from "react";
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

  return (
    <>
      {
        isLoaded ? (
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-pink-500 to-rose-500">
            <h1 className="text-4xl font-bold text-white" >Make a video trim with shorts</h1>
          </div>
        ) : (
          <Loading  />
        )
      }
    </>
  )
}
