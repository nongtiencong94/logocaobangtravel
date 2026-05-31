import { WatermarkConfig } from '../types';

/**
 * Loads an image from a URL and returns a Promise
 */
export function loadImage(url: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Không thể tải ảnh.'));
    img.src = url;
  });
}

/**
 * Applies a watermark logo to an image and returns a blob or data URL
 */
export async function applyWatermark(
  imageSourceUrl: string,
  logoSourceUrl: string,
  config: WatermarkConfig
): Promise<{ dataUrl: string; blob: Blob; width: number; height: number }> {
  // Load both images
  const [baseImg, logoImg] = await Promise.all([
    loadImage(imageSourceUrl),
    loadImage(logoSourceUrl, 'anonymous'), // Proxy logo has CORS headers
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = baseImg.naturalWidth;
  canvas.height = baseImg.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Không thể khởi tạo môi trường vẽ 2D.');
  }

  // Draw base image
  ctx.drawImage(baseImg, 0, 0);

  // Calculate watermark dimensions based on scaling configuration
  // Width will be a percentage of the base image width
  const logoWidth = baseImg.naturalWidth * config.sizeRatio;
  const logoHeight = logoWidth * (logoImg.naturalHeight / logoImg.naturalWidth);

  // Set padding relative to the dimensions of the base image
  const padding = baseImg.naturalWidth * config.paddingRatio;

  // Calculate coordinates based on selected position
  let x = 0;
  let y = 0;

  switch (config.position) {
    case 'top-left':
      x = padding;
      y = padding;
      break;
    case 'top-right':
      x = baseImg.naturalWidth - logoWidth - padding;
      y = padding;
      break;
    case 'bottom-left':
      x = padding;
      y = baseImg.naturalHeight - logoHeight - padding;
      break;
    case 'bottom-right':
    default:
      x = baseImg.naturalWidth - logoWidth - padding;
      y = baseImg.naturalHeight - logoHeight - padding;
      break;
    case 'center':
      x = (baseImg.naturalWidth - logoWidth) / 2;
      y = (baseImg.naturalHeight - logoHeight) / 2;
      break;
  }

  // Draw logo with opacity configurations
  ctx.save();
  ctx.globalAlpha = config.opacity;
  ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
  ctx.restore();

  // Export as Data URL and Blob
  const mimeType = config.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const quality = config.quality;
  const dataUrl = canvas.toDataURL(mimeType, quality);

  // Convert to Blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Lỗi chuyển đổi ảnh thành dữ liệu nhị phân.'));
      },
      mimeType,
      quality
    );
  });

  return {
    dataUrl,
    blob,
    width: baseImg.naturalWidth,
    height: baseImg.naturalHeight,
  };
}
