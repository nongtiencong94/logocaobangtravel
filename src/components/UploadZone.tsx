import React, { useRef, useState } from 'react';
import { UploadCloud, FileImage } from 'lucide-react';

interface UploadZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
}

export default function UploadZone({ onFilesSelected }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 md:p-12 ${
        isDragActive
          ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner'
          : 'border-neutral-300 bg-white hover:border-indigo-400 hover:bg-neutral-50/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif, .heic, .heif"
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-transform duration-300 group-hover:scale-110 group-hover:bg-indigo-100 group-hover:text-indigo-600">
        <UploadCloud className="h-7 w-7" />
      </div>

      <h3 className="mt-4 font-sans text-base font-semibold text-neutral-800">
        Kéo thả nhiều hình ảnh vào đây
      </h3>
      <p className="mt-1 font-sans text-sm text-neutral-500">
        hoặc click để mở trình chọn tệp trên thiết bị
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <span className="flex items-center space-x-1 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600 font-mono">
          <FileImage className="h-3 w-3 text-neutral-400" />
          <span>PNG</span>
        </span>
        <span className="flex items-center space-x-1 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600 font-mono">
          <FileImage className="h-3 w-3 text-neutral-400" />
          <span>JPG / JPEG</span>
        </span>
        <span className="flex items-center space-x-1 rounded-md bg-indigo-50 px-2 py-1 text-xs text-indigo-600 font-mono font-bold border border-indigo-150/10">
          <FileImage className="h-3 w-3 text-indigo-400" />
          <span>HEIC / HEIF</span>
        </span>
        <span className="flex items-center space-x-1 rounded-md bg-neutral-100 px-2 py-1 text-xs text-neutral-600 font-mono">
          <FileImage className="h-3 w-3 text-neutral-400" />
          <span>WEBP</span>
        </span>
      </div>

      <p className="mt-3 font-sans text-[11px] text-neutral-400">
        Hỗ trợ tải lên nhiều tập tin tối đa lên tới 50MB cùng một lúc
      </p>
    </div>
  );
}
