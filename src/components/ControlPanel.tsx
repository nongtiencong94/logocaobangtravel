import { WatermarkConfig, LogoPosition } from '../types';
import { Sliders, Download, Eye, Layers, Settings, FileArchive } from 'lucide-react';

interface ControlPanelProps {
  config: WatermarkConfig;
  onChangeConfig: (newConfig: WatermarkConfig) => void;
  zipName: string;
  onChangeZipName: (name: string) => void;
  onDownloadAll: () => void;
  isProcessing: boolean;
  hasImages: boolean;
  totalImages: number;
  processedCount: number;
}

export default function ControlPanel({
  config,
  onChangeConfig,
  zipName,
  onChangeZipName,
  onDownloadAll,
  isProcessing,
  hasImages,
  totalImages,
  processedCount,
}: ControlPanelProps) {
  const updateConfig = (key: keyof WatermarkConfig, value: any) => {
    onChangeConfig({
      ...config,
      [key]: value,
    });
  };

  const positions: Array<{ value: LogoPosition; label: string }> = [
    { value: 'bottom-right', label: 'Dưới bên phải (Mặc định)' },
    { value: 'bottom-left', label: 'Dưới bên trái' },
    { value: 'top-right', label: 'Trên bên phải' },
    { value: 'top-left', label: 'Trên bên trái' },
    { value: 'center', label: 'Ở giữa ảnh' },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center space-x-2 border-b border-neutral-100 pb-4">
        <Sliders className="h-5 w-5 text-indigo-600" />
        <h2 className="font-sans text-lg font-bold text-neutral-800">Cấu Hình Đóng Dấu</h2>
      </div>

      <div className="mt-5 space-y-6">
        {/* Position Choice */}
        <div>
          <label className="flex items-center space-x-1.5 font-sans text-xs font-semibold text-neutral-700">
            <Layers className="h-3.5 w-3.5 text-neutral-400" />
            <span>Vị Trí Đóng Dấu (Watermark Position)</span>
          </label>
          <div className="mt-2 text-xs text-neutral-500 mb-2">Chèn logo tự động vào vị trí bạn muốn:</div>
          <select
            value={config.position}
            onChange={(e) => updateConfig('position', e.target.value as LogoPosition)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 font-sans text-sm outline-none transition duration-150 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {positions.map((pos) => (
              <option key={pos.value} value={pos.value}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>

        {/* Size Slider */}
        <div>
          <div className="flex items-center justify-between font-sans text-xs font-semibold text-neutral-700">
            <span className="flex items-center space-x-1.5">
              <Settings className="h-3.5 w-3.5 text-neutral-400" />
              <span>Tỉ Lệ Kích Thước Logo</span>
            </span>
            <span className="font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
              {Math.round(config.sizeRatio * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.01"
            value={config.sizeRatio}
            onChange={(e) => updateConfig('sizeRatio', parseFloat(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer rounded-lg bg-neutral-200 accent-indigo-600 outline-none"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-neutral-400">
            <span>Rất nhỏ (5%)</span>
            <span>Rất lớn (50%)</span>
          </div>
        </div>

        {/* Opacity Slider */}
        <div>
          <div className="flex items-center justify-between font-sans text-xs font-semibold text-neutral-700">
            <span className="flex items-center space-x-1.5">
              <Eye className="h-3.5 w-3.5 text-neutral-400" />
              <span>Độ Trong Suốt (Opacity)</span>
            </span>
            <span className="font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
              {Math.round(config.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.opacity}
            onChange={(e) => updateConfig('opacity', parseFloat(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer rounded-lg bg-neutral-200 accent-indigo-600 outline-none"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-neutral-400">
            <span>Mờ nhạt (10%)</span>
            <span>Rõ nhất (100%)</span>
          </div>
        </div>

        {/* Spacing / Padding Slider */}
        <div>
          <div className="flex items-center justify-between font-sans text-xs font-semibold text-neutral-700">
            <span className="flex items-center space-x-1.5">
              <Layers className="h-3.5 w-3.5 text-neutral-400" />
              <span>Khoảng Cách Lợt Cạnh</span>
            </span>
            <span className="font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
              {Math.round(config.paddingRatio * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.1"
            step="0.005"
            value={config.paddingRatio}
            onChange={(e) => updateConfig('paddingRatio', parseFloat(e.target.value))}
            className="mt-3 h-1.5 w-full cursor-pointer rounded-lg bg-neutral-200 accent-indigo-600 outline-none"
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-neutral-400">
            <span>Sát lề (1%)</span>
            <span>Xa lề (10%)</span>
          </div>
        </div>

        {/* Output File Format */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-sans text-xs font-semibold text-neutral-700">Định dạng ảnh</label>
            <select
              value={config.format}
              onChange={(e) => updateConfig('format', e.target.value)}
              className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-2.5 py-2 font-sans text-xs outline-none focus:border-indigo-500"
            >
              <option value="png">PNG (Giữ nét sắc)</option>
              <option value="jpeg">JPEG (Tối ưu dung lượng)</option>
            </select>
          </div>
          <div>
            <label className="font-sans text-xs font-semibold text-neutral-700">Chất lượng ảnh ({Math.round(config.quality * 100)}%)</label>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={config.quality}
              disabled={config.format === 'png'}
              onChange={(e) => updateConfig('quality', parseFloat(e.target.value))}
              className="mt-3 h-1.5 w-full cursor-pointer rounded-lg bg-neutral-200 accent-indigo-600 outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* ZIP Name Input */}
        <div className="border-t border-neutral-100 pt-5">
          <label className="flex items-center space-x-1.5 font-sans text-xs font-semibold text-neutral-700">
            <FileArchive className="h-3.5 w-3.5 text-neutral-400" />
            <span>Tên Tệp Tin ZIP</span>
          </label>
          <div className="relative mt-2">
            <input
              type="text"
              value={zipName}
              onChange={(e) => onChangeZipName(e.target.value)}
              placeholder="VD: anh_dong_dau.zip"
              className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 pr-10 font-mono text-sm outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-neutral-400">.zip</span>
          </div>
        </div>

        {/* Execute Button */}
        <div className="border-t border-neutral-100 pt-5 text-center">
          <button
            type="button"
            disabled={!hasImages || isProcessing || processedCount < totalImages}
            onClick={onDownloadAll}
            className={`flex w-full items-center justify-center space-x-2 rounded-xl py-3.5 px-4 font-sans text-sm font-semibold text-white shadow-lg transition-all duration-300 ${
              !hasImages || isProcessing || processedCount < totalImages
                ? 'bg-neutral-300/80 text-neutral-500 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-100 active:scale-95'
            }`}
          >
            <Download className="h-4.5 w-4.5" />
            <span>
              {isProcessing
                ? 'Đang xử lý...'
                : processedCount < totalImages
                ? `Đang chuẩn bị (${processedCount}/${totalImages})`
                : 'Tải Xuống Toàn Bộ (ZIP)'}
            </span>
          </button>
          <div className="mt-2 text-[10px] text-neutral-400">
            Nén tất cả ảnh đã đóng dấu chất lượng cao vào một file .zip duy nhất
          </div>
        </div>
      </div>
    </div>
  );
}
