/**
 * Types and interfaces for the Watermark Tool application
 */

export interface ProcessedImage {
  id: string;
  name: string;
  originalSize: number;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  watermarkedUrl: string;
  watermarkedBlob?: Blob; // raw output blob for rapid packaging
  watermarkedSize?: number; // bytes of output blob
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMessage?: string;
}

export type LogoPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';

export interface WatermarkConfig {
  position: LogoPosition;
  sizeRatio: number; // 0.05 to 0.5 (relative size of logo width compared to image width)
  opacity: number;   // 0 to 1
  paddingRatio: number; // spacing relative to image size, or fixed pixel spacing
  format: 'png' | 'jpeg';
  quality: number; // 0 to 1
}
