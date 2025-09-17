
import React, { useState } from 'react';
import { type InstagramPost } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';

interface CaptionDisplayProps {
    caption: InstagramPost;
}

type CopiedState = 'title' | 'text' | 'hashtags' | null;

const CopyButton: React.FC<{ textToCopy: string, onCopy: () => void, isCopied: boolean }> = ({ textToCopy, onCopy, isCopied }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        onCopy();
    };

    return (
        <button
            onClick={handleCopy}
            className="p-2 rounded-md hover:bg-purple-500/20 text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Copy to clipboard"
        >
            {isCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5" />}
        </button>
    );
}

const CaptionDisplay: React.FC<CaptionDisplayProps> = ({ caption }) => {
    const [copied, setCopied] = useState<CopiedState>(null);

    const handleCopy = (section: CopiedState) => {
        setCopied(section);
        setTimeout(() => setCopied(null), 2000);
    };

    const hashtagString = caption.hashtags.map(h => `#${h}`).join(' ');

    return (
        <div className="space-y-6 bg-gray-900/50 p-6 rounded-lg border border-gray-700 animate-fade-in">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Title</h3>
                    <CopyButton textToCopy={caption.title} onCopy={() => handleCopy('title')} isCopied={copied === 'title'} />
                </div>
                <p className="text-lg font-semibold text-white">{caption.title}</p>
            </div>

            <div className="border-t border-gray-700"></div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Caption</h3>
                     <CopyButton textToCopy={caption.text} onCopy={() => handleCopy('text')} isCopied={copied === 'text'} />
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{caption.text}</p>
            </div>
            
            <div className="border-t border-gray-700"></div>

            <div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-purple-400">Hashtags</h3>
                    <CopyButton textToCopy={hashtagString} onCopy={() => handleCopy('hashtags')} isCopied={copied === 'hashtags'} />
                </div>
                <p className="text-gray-400 leading-relaxed">{hashtagString}</p>
            </div>
        </div>
    );
};

export default CaptionDisplay;
