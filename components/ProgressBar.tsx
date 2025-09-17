
import React from 'react';

const ProgressBar: React.FC = () => {
    return (
        <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-1/3 animate-indeterminate-progress"></div>
            <style>
                {`
                    @keyframes indeterminate-progress {
                        from {
                            transform: translateX(-100%);
                        }
                        to {
                            transform: translateX(300%);
                        }
                    }
                    .animate-indeterminate-progress {
                        animation: indeterminate-progress 2s ease-in-out infinite;
                    }
                `}
            </style>
        </div>
    );
};

export default ProgressBar;
