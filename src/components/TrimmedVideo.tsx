import { useToast } from "@/hooks/use-toast";


interface TrimmedVideoProps {
    trimmedVideoUrl: string | null;
    setTrimmedVideoUrl: (trimmedVideoUrl: string | null) => void;
}

export default function TrimmedVideo({ trimmedVideoUrl, setTrimmedVideoUrl }: TrimmedVideoProps) {
    const { toast } = useToast()
    return (
        <div className="mt-6">
            <h2 className="text-white font-bold">Trimmed Video:</h2>
            <video {...(trimmedVideoUrl && { src: trimmedVideoUrl })} controls controlsList="nodownload" className="size-96" />
            <div className="flex items-center justify-between mt-8 space-x-4">
                <button
                    onClick={() => setTrimmedVideoUrl(null)} // Go back to the trimming UI
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                    Go back
                </button>
                <a 
                    onClick={() => {
                        toast({
                            title: "Downloading...",
                            description: "Downloading the trimmed video.",
                        });
                    }}
                    href={trimmedVideoUrl ?? undefined}
                    download={trimmedVideoUrl ?? undefined}
                    className="bg-green-500 text-white px-4 py-2 rounded-md mt-2"
                >
                    Download
                </a>
            </div>
        </div>
    )
}

