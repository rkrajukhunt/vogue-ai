
import React, { useRef } from 'react';
import { ImageFile } from '../types';

interface ImageUploaderProps {
  label: string;
  onUpload: (files: ImageFile[]) => void;
  multiple?: boolean;
  currentImages?: ImageFile[];
  onRemove?: (id: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  onUpload, 
  multiple = false,
  currentImages = [],
  onRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Explicitly cast to File[] to avoid 'unknown' type errors when accessing properties like 'type' and 'name'.
    const loaders = (Array.from(files) as File[]).map((file) => {
      return new Promise<ImageFile>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve({
            id: Math.random().toString(36).substr(2, 9),
            data: event.target?.result as string,
            mimeType: file.type,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(loaders).then((newImages) => {
      onUpload(newImages);
      if (fileInputRef.current) fileInputRef.current.value = '';
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-400 uppercase tracking-widest">{label}</label>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="text-xs bg-white text-black px-4 py-1.5 rounded-full hover:bg-gray-200 transition-colors font-semibold"
        >
          {currentImages.length > 0 ? 'ADD MORE' : 'UPLOAD'}
        </button>
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        multiple={multiple}
      />

      {currentImages.length === 0 ? (
        <div 
          className="border-2 border-dashed border-gray-800 rounded-xl h-48 flex flex-col items-center justify-center text-gray-600 hover:border-gray-600 cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Select Image(s)</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {currentImages.map((img) => (
            <div key={img.id} className="relative group aspect-[3/4] rounded-lg overflow-hidden border border-gray-800">
              <img src={img.data} alt={img.name} className="w-full h-full object-cover" />
              {onRemove && (
                <button 
                  onClick={() => onRemove(img.id)}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
