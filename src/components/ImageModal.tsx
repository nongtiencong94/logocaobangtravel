import { useState, ChangeEvent } from 'react';
import { ProcessedImage } from '../types';
import { X, ArrowLeftRight, HelpCircle, Eye, EyeOff } from 'lucide-react';

interface ImageModalProps {
  image: ProcessedImage | null;
  onClose: () => void;
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  if (!image) return null;

  const [sliderPos, setSliderPos] = useState<number>(50);
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider');

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSliderPos(parseFloat(e.target.value));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      {/* Modal Card Layout */}
      <div 
        className="relative flex flex-col w-full max-w-5xl rounded-2xl bg-white shadow-2xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <div>
            <h3 className="font-sans text-base font-bold text-neutral-900">
              So Sánh Chi Tiết Đóng Dấu
            </h3>
            <p className="font-mono text-xs text-neutral-400 mt-0.5 max-w-[200px] truncate sm:max-w-md">
              {image.name}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Switching Tab */}
            <div className="flex space-x-1 rounded-lg bg-neutral-100 p-1">
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center space-x-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === 'slider'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <ArrowLeftRight className="h-3 w-3" />
                <span>Trượt so sánh</span>
              </button>
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`flex items-center space-x-1 rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                  viewMode === 'side-by-side'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <span>Song Song</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center min-h-[300px]">
          {viewMode === 'slider' ? (
            /* Interactive Slider Comparative Mode */
            <div className="w-full max-w-3xl flex flex-col items-center">
              <div className="relative w-full aspect-video select-none overflow-hidden rounded-xl border border-neutral-300 bg-neutral-850 flex items-center justify-center overflow-hidden">
                
                {/* Background (Original Image BEFORE) */}
                <img
                  src={image.originalUrl}
                  alt="Original"
                  className="h-full w-full object-contain pointer-events-none"
                />
                
                <div className="absolute top-3 left-3 z-15 flex items-center space-x-1 rounded bg-black/60 px-2 py-0.5 text-[10px] text-white">
                  <EyeOff className="h-3 w-3" />
                  <span>Ảnh Gốc (Trước)</span>
                </div>

                {/* Foreground (Watermarked Image AFTER - Clip-width based on Slider) */}
                <div
                  className="absolute inset-0 z-10 overflow-hidden"
                  style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                >
                  <img
                    src={image.watermarkedUrl}
                    alt="Watermarked"
                    className="h-full w-full object-contain pointer-events-none"
                  />
                  <div className="absolute top-3 right-3 z-15 flex items-center space-x-1 rounded bg-indigo-600 px-2 py-0.5 text-[10px] text-white">
                    <Eye className="h-3 w-3" />
                    <span>Đã Đóng Dấu (Sau)</span>
                  </div>
                </div>

                {/* Slider divider line element */}
                <div
                  className="absolute bottom-0 top-0 z-20 w-0.5 bg-white shadow-md pointer-events-none"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow border-2 border-white">
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Interactive Overlay Input Trigger */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={handleSliderChange}
                  className="absolute inset-0 z-30 w-full h-full cursor-col-resize opacity-0"
                />
              </div>

              <p className="mt-4 flex items-center justify-center space-x-1 text-center font-sans text-xs text-neutral-500">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Di chuột hoặc vuốt thanh trượt sang trái/phải để so sánh kết quả đóng dấu watermark.</span>
              </p>
            </div>
          ) : (
            /* Parallel Side-by-Side Comparison Grid */
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 w-full">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                  <span>Ảnh Gốc ban đầu</span>
                  <span className="font-mono text-neutral-400">{formatSize(image.originalSize)}</span>
                </div>
                <div className="relative aspect-video rounded-xl border border-neutral-200 bg-neutral-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={image.originalUrl}
                    alt="Original side"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                  <span className="text-indigo-600">Ảnh đóng dấu watermark</span>
                  {image.watermarkedSize && (
                    <span className="font-mono text-emerald-600">{formatSize(image.watermarkedSize)}</span>
                  )}
                </div>
                <div className="relative aspect-video rounded-xl border border-neutral-200 bg-neutral-900 overflow-hidden flex items-center justify-center">
                  <img
                    src={image.watermarkedUrl}
                    alt="Watermarked side"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Info block */}
        <div className="border-t border-neutral-100 bg-neutral-50 px-6 py-4 rounded-b-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex space-x-6 text-[11px] text-neutral-500 font-mono">
              <div>
                <span className="text-neutral-400">Độ phân giải:</span> {image.originalWidth} × {image.originalHeight} px
              </div>
              <div>
                <span className="text-neutral-400">Tỷ lệ:</span> {(image.originalWidth / image.originalHeight).toFixed(2)}:1
              </div>
            </div>
            
            <a
              href={image.watermarkedUrl}
              download={`watermarked_${image.name}`}
              className="rounded-xl bg-indigo-600 px-4 py-2 font-sans text-xs font-semibold text-white shadow-sm hover:bg-indigo-750 transition"
            >
              Tải ảnh này về máy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
