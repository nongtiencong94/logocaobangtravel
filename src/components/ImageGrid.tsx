import { ProcessedImage } from '../types';
import { Download, Trash2, Eye, RefreshCw, FileWarning } from 'lucide-react';
import { motion } from 'motion/react';

interface ImageGridProps {
  images: ProcessedImage[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onSelectCompare: (image: ProcessedImage) => void;
}

export default function ImageGrid({
  images,
  onRemove,
  onClearAll,
  onSelectCompare,
}: ImageGridProps) {
  
  // Format file size in a human readable way
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Grid Toolbar Details */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center space-x-2">
          <span className="font-sans text-sm font-bold text-neutral-800">
            Danh sách tệp tin ({images.length})
          </span>
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-sans text-xs font-semibold text-indigo-600">
            {images.filter(img => img.status === 'done').length} / {images.length} đã xong
          </span>
        </div>
        <button
          onClick={onClearAll}
          className="flex items-center space-x-1 rounded-lg border border-red-200 px-3 py-1.5 font-sans text-xs font-semibold text-red-600 hover:bg-red-50/75 transition duration-150"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      {/* Grid of uploaded and processed files */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <motion.div
            key={img.id}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xs hover:border-neutral-300 hover:shadow-md transition-all duration-200"
          >
            {/* Header / Info layout */}
            <div className="relative aspect-video w-full overflow-hidden bg-neutral-900 border-b border-neutral-100 flex items-center justify-center">
              {img.status === 'done' ? (
                <>
                  <img
                    src={img.watermarkedUrl}
                    alt={img.name}
                    className="h-full w-full object-contain"
                  />
                  {/* Hover Quick actions Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 space-x-3">
                    <button
                      onClick={() => onSelectCompare(img)}
                      title="Xem so sánh ảnh gốc & đóng dấu"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-800 hover:bg-neutral-100 shadow transform scale-90 group-hover:scale-100 transition duration-150"
                    >
                      <Eye className="h-4.5 w-4.5" />
                    </button>
                    <a
                      href={img.watermarkedUrl}
                      download={`watermarked_${img.name}`}
                      title="Tải về ảnh này"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 hover:bg-indigo-50 shadow transform scale-90 group-hover:scale-100 transition duration-150"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </a>
                  </div>
                </>
              ) : img.status === 'processing' || img.status === 'pending' ? (
                <div className="flex flex-col items-center justify-center text-white space-y-2 p-4 text-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-indigo-400" />
                  <p className="font-sans text-xs text-neutral-300">Đang tự động đóng dấu...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-red-400 space-y-2 p-4 text-center">
                  <FileWarning className="h-8 w-8" />
                  <p className="font-sans text-xs font-semibold">Gặp lỗi xử lý</p>
                  <p className="font-sans text-[10px] text-neutral-500 line-clamp-1">{img.errorMessage}</p>
                </div>
              )}

              {/* Individual Trash action */}
              <button
                onClick={() => onRemove(img.id)}
                className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-neutral-500 hover:bg-red-50 hover:text-red-600 transition shadow-sm"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Bottom info section */}
            <div className="p-3 text-left">
              <h4 className="truncate font-sans text-xs font-bold text-neutral-800" title={img.name}>
                {img.name}
              </h4>
              <div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-neutral-500">
                <span>Kích thước gốc: {formatSize(img.originalSize)}</span>
                {img.status === 'done' && img.watermarkedSize && (
                  <span className="text-emerald-600 font-semibold">
                    Đã lưu: {formatSize(img.watermarkedSize)}
                  </span>
                )}
              </div>

              {/* Direct status description */}
              <div className="mt-2.5 flex items-center justify-between border-t border-neutral-50 pt-2 text-[10px]">
                {img.status === 'done' ? (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-sans font-semibold text-emerald-600">
                    Đã hoàn thành
                  </span>
                ) : img.status === 'processing' || img.status === 'pending' ? (
                  <span className="rounded-md bg-yellow-50 px-2 py-0.5 font-sans font-semibold text-yellow-600">
                    Đang xử lý
                  </span>
                ) : (
                  <span className="rounded-md bg-red-50 px-2 py-0.5 font-sans font-semibold text-red-600">
                    Bị lỗi
                  </span>
                )}

                {img.status === 'done' && (
                  <button
                    onClick={() => onSelectCompare(img)}
                    className="flex items-center space-x-0.5 font-sans font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Xem so sánh</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
