import { useEffect, useState } from "react";
import { loadFFmpeg } from "./lib/utils";

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
          <div>
            <h1>FFmpeg is loaded</h1>
          </div>
        ) : (
          <p>Loading FFmpeg...</p>
        )
      }
    </>
  )
}
