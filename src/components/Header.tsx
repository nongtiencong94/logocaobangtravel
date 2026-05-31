import { Image, ShieldCheck } from 'lucide-react';

export default function Header() {
  const logoUrl = '/api/proxy-logo';

  return (
    <header className="border-b border-neutral-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <Image className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-sans text-xl font-bold tracking-tight text-neutral-900">
              Công Cụ Đóng Dấu Ảnh
            </h1>
            <p className="font-sans text-xs text-neutral-500">
              Tự động chèn logo thương hiệu & xuất file nén dưới dạng ZIP nhanh chóng
            </p>
          </div>
        </div>

        {/* Current Active Watermark Info */}
        <div className="hidden flex-row items-center space-x-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-2 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white">
            <img 
              src={logoUrl} 
              alt="Logo watermark" 
              className="max-h-8 max-w-8 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-left">
            <div className="flex items-center space-x-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="font-sans text-xs font-semibold text-neutral-700">Logo Đã Sẵn Sàng</span>
            </div>
            <span className="font-mono text-[10px] text-neutral-400">horizons-cdn.hostinger.com</span>
          </div>
        </div>
      </div>
    </header>
  );
}
