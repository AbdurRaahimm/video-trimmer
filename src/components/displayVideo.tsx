import React, { FC, useEffect, useState } from 'react';
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Play, Pause } from "lucide-react";
import { convertToHHMMSS } from '../lib/utils';

interface DisplayVideoProps {
    videoUrl: string;
    videoRef: React.RefObject<HTMLVideoElement>;
    isPlaying: boolean;
    setIsPlaying: (isPlaying: boolean) => void;
    ffmpeg: any;
    video: File;
    range: number[];
    setRange: (range: number[]) => void;
    isLoaded: boolean;
    videoDuration: number;
    setVideoDuration: (videoDuration: number) => void;
    setTrimmedVideoUrl: (trimmedVideoUrl: string) => void;
}

const DisplayVideo: FC<DisplayVideoProps> = ({
    videoUrl,
    videoRef,
    isPlaying,
    setIsPlaying,
    ffmpeg,
    video,
    range,
    setRange,
    isLoaded,
    videoDuration,
    setVideoDuration,
    setTrimmedVideoUrl
}) => {
    const [isTrimming, setIsTrimming] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSliderChange = (value: number[]) => {
        setRange(value); // Update range state with slider value
        if (videoRef.current) {
          videoRef.current.currentTime = value[0]; // Sync video start time with the slider
        }
      };

    const handleTrimVideo = async () => {
        if (isLoaded && video && videoRef.current) {
            setIsTrimming(true);
            try {
                const { name } = video;
                const outputFileName = "output.mp4";

                ffmpeg.FS("writeFile", name, await window.FFmpeg.fetchFile(video));

                await ffmpeg.run(
                    "-i", name,
                    "-ss", `${convertToHHMMSS(range[0])}`,
                    "-to", `${convertToHHMMSS(range[1])}`,
                    "-acodec", "copy",
                    "-vcodec", "copy",
                    outputFileName
                );

                const data = ffmpeg.FS("readFile", outputFileName);
                const blob = new Blob([data.buffer], { type: "video/mp4" });
                const url = URL.createObjectURL(blob);
                setTrimmedVideoUrl(url);
                console.log("Video trimming successful!");
                setErrorMessage(null);
            } catch (error) {
                console.error("Error trimming video:", error);
                setErrorMessage("Failed to trim the video. Please try again.");
            } finally {
                setIsTrimming(false);
            }
        }
    };

    useEffect(() => {
        if (videoRef.current && isLoaded) {
            setVideoDuration(videoRef.current.duration);
            setRange([0, videoRef.current.duration]);
        }
    }, [isLoaded, videoRef, setRange, setVideoDuration]);

    return (
        <>
            <div className="relative">
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
                    aria-label="Video player"
                />
                {errorMessage && (
                    <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
                )}
            </div>

            <SliderPrimitive.Root
                className="relative flex items-center select-none touch-none w-full sm:w-5/12 h-5 mt-4"
                value={range}
                onValueChange={handleSliderChange}
                min={0}
                max={videoDuration}
                step={1}
                aria-label="Trim video slider"
            >
                <SliderPrimitive.Track className="bg-gray-700 relative grow rounded-full h-3">
                    <SliderPrimitive.Range className="absolute bg-green-500 rounded-full h-full" />
                </SliderPrimitive.Track>
                {range.map((value, index) => (
                    <SliderPrimitive.Thumb
                        key={index}
                        className="block w-5 h-5 bg-white rounded-full focus:outline-none focus-visible:ring-3 focus-visible:ring-green-500 focus-visible:ring-opacity-75"
                        aria-label={`Thumb at ${convertToHHMMSS(value)}`}
                    >
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-white text-xs">
                            {convertToHHMMSS(value)}
                        </div>
                    </SliderPrimitive.Thumb>
                ))}
            </SliderPrimitive.Root>

            <div className="flex items-center mt-8 space-x-4">
                <button
                    onClick={handlePlayPause}
                    className="bg-white text-black px-4 py-2 rounded-md flex items-center gap-1"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
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
                    className={`bg-green-500 text-white px-4 py-2 rounded-md ${isTrimming ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={isTrimming}
                    aria-label="Trim video"
                >
                    {isTrimming ? "Trimming..." : "Trim Video"}
                </button>
            </div>
        </>
    );
};

export default DisplayVideo;
