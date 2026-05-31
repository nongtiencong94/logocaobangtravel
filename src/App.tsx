import { useState, useEffect } from 'react';
import { ProcessedImage, WatermarkConfig } from './types';
import { applyWatermark, loadImage } from './utils/watermark';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import ControlPanel from './components/ControlPanel';
import ImageGrid from './components/ImageGrid';
import ImageModal from './components/ImageModal';
import { ImagePlus, HelpCircle, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import JSZip from 'jszip';
// @ts-ignore
import heic2any from 'heic2any';

export default function App() {
  // Config state
  const [config, setConfig] = useState<WatermarkConfig>({
    position: 'bottom-right',
    sizeRatio: 0.18, // 18% of base image width
    opacity: 0.9,    // 90% opacity
    paddingRatio: 0.02, // 2% distance from the edge
    format: 'png',
    quality: 0.9,
  });

  // Files/Images state
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [zipName, setZipName] = useState<string>('anh_dong_dau');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [compareImage, setCompareImage] = useState<ProcessedImage | null>(null);

  // Auto-process all images when configurations change
  useEffect(() => {
    if (images.length === 0) return;

    let active = true;
    const reprocessAll = async () => {
      setIsProcessing(true);
      const logoUrl = '/api/proxy-logo';

      const promises = images.map(async (img) => {
        try {
          const res = await applyWatermark(img.originalUrl, logoUrl, config);
          if (!active) return;

          setImages((prev) =>
            prev.map((item) =>
              item.id === img.id
                ? {
                    ...item,
                    watermarkedUrl: res.dataUrl,
                    watermarkedBlob: res.blob,
                    watermarkedSize: res.blob.size,
                    status: 'done',
                  }
                : item
            )
          );
        } catch (err: any) {
          if (!active) return;
          console.error('Error applying watermark:', err);
          setImages((prev) =>
            prev.map((item) =>
              item.id === img.id
                ? {
                    ...item,
                    status: 'error',
                    errorMessage: err.message || 'Lỗi đóng dấu ảnh.',
                  }
                : item
            )
          );
        }
      });

      await Promise.all(promises);
      if (active) {
        setIsProcessing(false);
      }
    };

    reprocessAll();

    return () => {
      active = false;
    };
  }, [config]);

  // Handle addition of new files
  const handleFilesSelected = async (files: FileList | File[]) => {
    setIsProcessing(true);
    const logoUrl = '/api/proxy-logo';
    const newItems: ProcessedImage[] = [];

    // Map files to initial pending state objects
    const resolvedPromises = Array.from(files).map(async (file) => {
      const id = Math.random().toString(36).substring(7);
      
      let workingFile: File | Blob = file;
      let workingName = file.name;
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const isHeic = fileExt === 'heic' || fileExt === 'heif' || file.type === 'image/heic' || file.type === 'image/heif';

      if (isHeic) {
        try {
          // Convert heic/heif to jpeg blob using heic2any
          const conversionResult = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
          });
          const convertedBlob = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
          
          // Generate new filename with .jpg extension
          const lastDotIdx = file.name.lastIndexOf('.');
          const baseName = lastDotIdx !== -1 ? file.name.substring(0, lastDotIdx) : file.name;
          const newName = `${baseName}.jpg`;
          
          workingFile = new File([convertedBlob], newName, { type: 'image/jpeg' });
          workingName = newName;
        } catch (e: any) {
          console.error("Lỗi chuyển đổi HEIC sang JPEG:", e);
        }
      }

      const originalUrl = URL.createObjectURL(workingFile);

      let width = 0;
      let height = 0;
      try {
        const testImg = await loadImage(originalUrl);
        width = testImg.naturalWidth;
        height = testImg.naturalHeight;
      } catch (err) {
        console.error('Failed to get dimensions for:', workingName);
      }

      return {
        id,
        name: workingName,
        originalSize: workingFile.size,
        originalUrl,
        originalWidth: width,
        originalHeight: height,
        watermarkedUrl: '',
        status: 'processing' as const,
      };
    });

    const initialImages = await Promise.all(resolvedPromises);
    
    // Add to state immediately to show loaders
    setImages((prev) => [...prev, ...initialImages]);

    // Process each new image individually
    const processPromises = initialImages.map(async (img) => {
      try {
        const res = await applyWatermark(img.originalUrl, logoUrl, config);
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? {
                  ...item,
                  watermarkedUrl: res.dataUrl,
                  watermarkedBlob: res.blob,
                  watermarkedSize: res.blob.size,
                  status: 'done',
                }
              : item
          )
        );
      } catch (err: any) {
        console.error('Error watermarking file:', img.name, err);
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? {
                  ...item,
                  status: 'error',
                  errorMessage: err.message || 'Lỗi áp dụng đóng dấu.',
                }
              : item
          )
        );
      }
    });

    await Promise.all(processPromises);
    setIsProcessing(false);
  };

  // Remove individual file matching ID
  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.originalUrl);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  // Clear all loaded files
  const handleClearAll = () => {
    images.forEach((img) => {
      URL.revokeObjectURL(img.originalUrl);
    });
    setImages([]);
  };

  // Package all watermarked images and trigger single click ZIP download
  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    setIsDownloading(true);

    try {
      const zip = new JSZip();
      
      images.forEach((img) => {
        if (img.status === 'done' && img.watermarkedBlob) {
          const ext = config.format === 'jpeg' ? 'jpg' : 'png';
          // Clean file extension format
          const originalName = img.name;
          const lastDot = originalName.lastIndexOf('.');
          const namePrefix = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
          const outName = `${namePrefix}_watermark.${ext}`;
          
          zip.file(outName, img.watermarkedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      
      const cleanedZipName = zipName.trim()
        ? zipName.trim().endsWith('.zip')
          ? zipName.trim()
          : `${zipName.trim()}.zip`
        : 'anh_dong_dau.zip';

      link.download = cleanedZipName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup ObjectURL
      setTimeout(() => URL.revokeObjectURL(link.href), 100);
    } catch (err) {
      console.error('Failed to bundle ZIP:', err);
      alert('Không thể xuất tệp nén ZIP. Vui lòng kiểm tra lại thiết bị.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter counters
  const totalCount = images.length;
  const processedCount = images.filter((img) => img.status === 'done').length;

  return (
    <div className="min-h-screen bg-neutral-50/50 pb-16">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Intro Banner */}
        <div className="mb-8 rounded-2xl bg-indigo-900/5 p-6 border border-indigo-150/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-indigo-700">
              <Sparkles className="h-5 w-5" />
              <h2 className="font-sans text-base font-bold">Xử Lý Đóng Dấu Độc Quyền</h2>
            </div>
            <p className="font-sans text-xs text-neutral-600 max-w-2xl">
              Tải lên hình ảnh sản phẩm, ảnh chụp thực tế hoặc tài liệu thiết kế để tự động đồng bộ hóa watermark có logo bản quyền ngay góc dưới bên phải một cách nhanh gọn, tính bảo mật cao và tiện lợi.
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs text-neutral-500 font-sans border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-200">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-neutral-700">100% Bảo mật (Xử lý trên Trình duyệt)</span>
            </div>
          </div>
        </div>

        {/* Primary Screen Layout Grid: left/right layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* LEFT: Configuration Controllers */}
          <div className="space-y-6 lg:col-span-1">
            <ControlPanel
              config={config}
              onChangeConfig={setConfig}
              zipName={zipName}
              onChangeZipName={setZipName}
              onDownloadAll={handleDownloadAll}
              isProcessing={isProcessing || isDownloading}
              hasImages={totalCount > 0}
              totalImages={totalCount}
              processedCount={processedCount}
            />

            {/* Quick Tutorial Help Box */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
              <h3 className="flex items-center space-x-1.5 font-sans text-xs font-bold text-neutral-800">
                <HelpCircle className="h-4 w-4 text-indigo-500" />
                <span>Hướng Dẫn Sử Dụng Thao Tác</span>
              </h3>
              <ul className="mt-3 space-y-2 text-[11px] text-neutral-500 list-decimal pl-4 font-sans line-height-relaxed">
                <li>Kéo thả hoặc nhấn vào ô upload để tải lên một hoặc nhiều hình ảnh cùng lúc.</li>
                <li>Hệ thống ngay lập tức sẽ áp dụng logo đóng dấu vào <strong>góc dưới bên phải</strong> (vị trí mặc định) cho từng ảnh.</li>
                <li>Thay đổi tỉ lệ kích thước, dộ mờ hiển thị hoặc mực lề lợt cạnh bằng thanh trượt cấu hình ở trên để cập nhật tức thì.</li>
                <li>Nhấn nút <strong>"Tải Xuống Toàn Bộ (ZIP)"</strong> để tải trọn bộ ảnh đóng dấu chỉ với 1 click duy nhất.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: Main Actions Workspace */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Upload Box Zone */}
            <UploadZone onFilesSelected={handleFilesSelected} />

            {/* Images display workplace */}
            {images.length > 0 ? (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <ImageGrid
                  images={images}
                  onRemove={handleRemoveImage}
                  onClearAll={handleClearAll}
                  onSelectCompare={setCompareImage}
                />
              </div>
            ) : (
              /* Empty Workspace placeholder state */
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-white py-16 px-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-400">
                  <ImagePlus className="h-6 w-6" />
                </div>
                <h4 className="mt-4 font-sans text-sm font-semibold text-neutral-800">Chưa có hình ảnh nào được tải lên</h4>
                <p className="mt-1 font-sans text-xs text-neutral-500 max-w-sm">
                  Hãy bắt đầu tải lên một số hình ảnh để trải nghiệm các tính năng đóng dấu bản quyền sản phẩm tự động.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Comparison Slider Preview Modal */}
      {compareImage && (
        <ImageModal
          image={compareImage}
          onClose={() => setCompareImage(null)}
        />
      )}
    </div>
  );
}
