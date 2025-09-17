
import React, { useState, useCallback } from 'react';
import { generateInstagramCaption } from './services/geminiService';
import { type InstagramPost } from './types';
import ImageUploader from './components/ImageUploader';
import CaptionDisplay from './components/CaptionDisplay';
import Loader from './components/Loader';
import { CameraIcon } from './components/icons/CameraIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState<InstagramPost | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageChange = (file: File) => {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setCaption(null);
        setError(null);
    };

    const handleGenerateCaption = useCallback(async () => {
        if (!imageFile) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCaption(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            reader.onloadend = async () => {
                const base64String = (reader.result as string).split(',')[1];
                const mimeType = imageFile.type;
                
                const result = await generateInstagramCaption(base64String, mimeType);
                setCaption(result);
            };
            reader.onerror = () => {
                 setError("Failed to read the image file.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center gap-3">
                        <CameraIcon className="w-12 h-12" />
                        InstaCaption AI
                    </h1>
                    <p className="text-gray-300 mt-2 text-lg">Generate the perfect Instagram caption from your image.</p>
                </header>

                <main className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl shadow-purple-500/10 border border-purple-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col space-y-6">
                            <ImageUploader onImageSelect={handleImageChange} previewUrl={previewUrl} />
                            <button
                                onClick={handleGenerateCaption}
                                disabled={!imageFile || isLoading}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader />
                                        <span>Generating...</span>
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon className="w-5 h-5" />
                                        <span>Generate Caption</span>
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="flex flex-col justify-center">
                            {error && (
                                <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg text-center">
                                    <p className="font-semibold">Error</p>
                                    <p>{error}</p>
                                </div>
                            )}
                            {isLoading && !error && (
                                <div className="text-center text-gray-400">
                                    <p>AI is thinking... Give it a moment to craft the perfect caption for your amazing picture! ✨</p>
                                </div>
                            )}
                            {!isLoading && caption && (
                                <CaptionDisplay caption={caption} />
                            )}
                            {!isLoading && !caption && !error && (
                                 <div className="text-center text-gray-500 p-8 border-2 border-dashed border-gray-600 rounded-lg">
                                    <p>Your generated caption will appear here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
