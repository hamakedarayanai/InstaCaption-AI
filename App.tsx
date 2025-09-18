import React, { useState, useCallback } from 'react';
import { generateInstagramCaption } from './services/geminiService';
import { type InstagramPost } from './types';
import ImageUploader from './components/ImageUploader';
import CaptionDisplay from './components/CaptionDisplay';
import Loader from './components/Loader';
import { AppLogoIcon } from './components/icons/AppLogoIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import ProgressBar from './components/ProgressBar';
import UrlInputForm from './components/UrlInputForm';
import { UploadIcon } from './components/icons/UploadIcon';
import { LinkIcon } from './components/icons/LinkIcon';

const TabButton: React.FC<{
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`w-1/2 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            active
                ? 'bg-gray-800 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
        }`}
    >
        {children}
    </button>
);

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState<InstagramPost | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [inputMethod, setInputMethod] = useState<'upload' | 'url'>('upload');
    const [isUrlLoading, setIsUrlLoading] = useState<boolean>(false);
    const [urlError, setUrlError] = useState<string | null>(null);

    const handleImageChange = (file: File) => {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setCaption(null);
        setError(null);
        setUrlError(null);
    };

    const handleUrlLoad = useCallback(async (url: string) => {
        setIsUrlLoading(true);
        setUrlError(null);
        setError(null);
        setCaption(null);

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch image. Server responded with ${response.status}.`);
            }
            const blob = await response.blob();
            if (!blob.type.startsWith('image/')) {
                throw new Error('The provided URL does not point to a valid image.');
            }

            const fileName = url.split('/').pop()?.split('?')[0] || 'image-from-url';
            const imageFile = new File([blob], fileName, { type: blob.type });
            handleImageChange(imageFile);

        } catch (err) {
            console.error("URL fetch error:", err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setUrlError(`${errorMessage} Note: Some images may not load due to server restrictions (CORS).`);
        } finally {
            setIsUrlLoading(false);
        }
    }, []);

    const handleGenerateCaption = useCallback(async () => {
        if (!imageFile) {
            setError("Please upload an image first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setCaption(null);

        try {
            const base64String = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(imageFile);
                reader.onload = () => {
                    if (typeof reader.result === 'string') {
                        resolve(reader.result.split(',')[1]);
                    } else {
                        reject(new Error("Failed to read file as a base64 string."));
                    }
                };
                reader.onerror = () => reject(new Error("Failed to read the image file."));
            });

            const mimeType = imageFile.type;
            const result = await generateInstagramCaption(base64String, mimeType);
            setCaption(result);
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
                        <AppLogoIcon className="w-12 h-12" />
                        InstaCaption AI
                    </h1>
                    <p className="text-gray-300 mt-2 text-lg">Generate the perfect Instagram caption from your image.</p>
                </header>

                <main className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl shadow-purple-500/10 border border-purple-500/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col space-y-6">
                             <div className="bg-gray-800 rounded-lg border border-gray-700">
                                <ImageUploader onImageSelect={handleImageChange} previewUrl={previewUrl} />
                                <div className="border-t border-gray-700">
                                    <div className="flex">
                                        <TabButton active={inputMethod === 'upload'} onClick={() => setInputMethod('upload')}>
                                            <UploadIcon className="w-5 h-5" />
                                            Upload File
                                        </TabButton>
                                        <TabButton active={inputMethod === 'url'} onClick={() => setInputMethod('url')}>
                                            <LinkIcon className="w-5 h-5" />
                                            From URL
                                        </TabButton>
                                    </div>
                                    <div className="p-4 min-h-[120px] flex items-center justify-center">
                                        {inputMethod === 'upload' && (
                                            <p className="text-center text-sm text-gray-400">
                                                Click or drag & drop an image into the area above.
                                                <br />
                                                PNG, JPG, or WEBP supported.
                                            </p>
                                        )}
                                        {inputMethod === 'url' && (
                                            <UrlInputForm 
                                                onUrlSubmit={handleUrlLoad}
                                                isLoading={isUrlLoading}
                                                error={urlError}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

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
                                <div className="space-y-4 text-center">
                                    <p className="text-gray-400">AI is thinking... Give it a moment to craft the perfect caption for your amazing picture! ✨</p>
                                    <ProgressBar />
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