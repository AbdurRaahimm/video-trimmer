import React from 'react'
import { Upload } from 'lucide-react';

interface UploadVideoProps {
    handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function UploadVideo({ handleFileChange }: UploadVideoProps) {
    return (
        <div className="mt-2 w-full sm:w-9/12 md:w-8/12 lg:w-6/12 xl:w-5/12 flex items-center justify-center px-5">
            <label
                htmlFor="videoUpload"
                className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white/30 transition-colors duration-300 hover:bg-white/40"
            >
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Upload aria-hidden="true" className="mx-auto h-12 w-12 text-gray-300" />
                    <p className="mb-2 text-sm text-white">
                        <span className="font-bold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-white">MP4, MOV, AVI up to 100MB</p>
                </div>
                <input
                    className="sr-only"
                    name="videoUpload"
                    onChange={handleFileChange}
                    id="videoUpload"
                    accept="video/*"
                    type="file"
                />
            </label>
        </div>
    )
}
