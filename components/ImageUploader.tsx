
import React, { useRef, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
    onImageSelect: (file: File) => void;
    previewUrl: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, previewUrl }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageSelect(file);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            onImageSelect(file);
        }
    }, [onImageSelect]);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };


    return (
        <div 
            className="w-full aspect-square bg-gray-900/50 rounded-t-lg flex items-center justify-center text-gray-400 cursor-pointer hover:border-purple-500 hover:bg-gray-800 transition-all duration-300 relative overflow-hidden"
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
                <div className="text-center p-4">
                    <UploadIcon className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                    <p className="font-semibold">Drop an image here or click to upload</p>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
