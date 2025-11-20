import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelected(file);
    }
  }, [onImageSelected]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative group w-full min-h-[300px] rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out overflow-hidden flex flex-col items-center justify-center cursor-pointer
          ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-600 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'}
          ${previewUrl ? 'border-none bg-black' : ''}
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={onChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={isLoading}
        />

        {previewUrl ? (
          <div className="relative w-full h-full min-h-[300px]">
            <img
              src={previewUrl}
              alt="Uploaded inspiration"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <p className="text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Click or Drop to change image</p>
            </div>
          </div>
        ) : (
          <div className="text-center p-8 pointer-events-none">
            <div className="mx-auto h-16 w-16 text-slate-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-200 mb-2">Upload Inspiration Image</h3>
            <p className="text-slate-400 text-sm">Drag & drop or click to select</p>
            <p className="text-xs text-slate-500 mt-4">Supports JPG, PNG, WebP</p>
          </div>
        )}
      </div>
    </div>
  );
};