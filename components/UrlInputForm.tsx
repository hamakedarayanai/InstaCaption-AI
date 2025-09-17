
import React, { useState } from 'react';
import Loader from './Loader';

interface UrlInputFormProps {
    onUrlSubmit: (url: string) => Promise<void>;
    isLoading: boolean;
    error: string | null;
}

const UrlInputForm: React.FC<UrlInputFormProps> = ({ onUrlSubmit, isLoading, error }) => {
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl || isLoading) return;
        onUrlSubmit(imageUrl);
    };

    return (
        <div className="w-full space-y-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    aria-label="Image URL"
                />
                <button
                    type="submit"
                    disabled={isLoading || !imageUrl}
                    className="flex items-center justify-center bg-purple-500 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-purple-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 w-24"
                    aria-label="Load image from URL"
                >
                    {isLoading ? <Loader /> : 'Load'}
                </button>
            </form>
            {error && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-md text-center">
                    {error}
                </div>
            )}
        </div>
    );
};

export default UrlInputForm;
