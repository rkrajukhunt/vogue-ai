
import React from 'react';
import { TryOnResult } from '../types';

interface ResultCardProps {
  result: TryOnResult;
}

const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const loadingMessages = [
    "Analyzing fabric textures...",
    "Aligning silhouettes...",
    "Applying realistic shadows...",
    "Perfecting the fit...",
    "Generating studio-quality finish..."
  ];

  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    if (result.status === 'processing') {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [result.status]);

  return (
    <div className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/5 transition-all hover:border-white/20">
      <div className="aspect-[3/4] relative bg-zinc-800">
        {result.status === 'processing' || result.status === 'pending' ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-400 font-medium animate-pulse">
              {loadingMessages[messageIndex]}
            </p>
          </div>
        ) : result.status === 'completed' ? (
          <img 
            src={result.imageUrl} 
            alt={result.clothingName} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-red-400">
            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs uppercase tracking-widest font-bold">Rendering Error</p>
            <p className="text-[10px] mt-1 opacity-70">{result.error || "Failed to process image."}</p>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-white/5">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          {result.clothingName}
        </h3>
        {result.status === 'completed' && (
          <button 
            onClick={() => {
                const link = document.createElement('a');
                link.href = result.imageUrl;
                link.download = `try-on-${result.clothingName.toLowerCase().replace(/\s+/g, '-')}.png`;
                link.click();
            }}
            className="text-[10px] text-white/50 hover:text-white transition-colors flex items-center"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            DOWNLOAD ASSET
          </button>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
