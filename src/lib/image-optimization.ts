/**
 * 画像最適化ユーティリティ
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Next.js Image Optimization用のURL生成
 */
export function generateOptimizedImageUrl(
  src: string,
  options: ImageOptimizationOptions = {}
): string {
  const { quality = 80, format, width, height, fit = 'cover' } = options;

  const params = new URLSearchParams();

  params.set('url', src);
  params.set('q', quality.toString());

  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (format) params.set('f', format);

  return `/_next/image?${params.toString()}`;
}

/**
 * レスポンシブ画像のsrcset生成
 */
export function generateSrcSet(
  src: string,
  widths: number[] = [640, 768, 1024, 1280, 1920],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  return widths
    .map(width => {
      const url = generateOptimizedImageUrl(src, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * 画像のメタデータを取得
 */
export async function getImageMetadata(src: string): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
} | null> {
  try {
    // 実際の実装では、画像ファイルを読み込んでメタデータを抽出
    // ここではモックデータを返す
    return {
      width: 1920,
      height: 1080,
      format: 'jpeg',
      size: 256000,
    };
  } catch (error) {
    console.error('Failed to get image metadata:', error);
    return null;
  }
}

/**
 * ブラウザの画像フォーマット対応チェック
 */
export function checkImageFormatSupport(): {
  webp: boolean;
  avif: boolean;
} {
  if (typeof window === 'undefined') {
    return { webp: false, avif: false };
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const webp = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  const avif = canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;

  return { webp, avif };
}

/**
 * 最適な画像フォーマットを選択
 */
export function getOptimalImageFormat(): 'avif' | 'webp' | 'jpeg' {
  const support = checkImageFormatSupport();

  if (support.avif) return 'avif';
  if (support.webp) return 'webp';
  return 'jpeg';
}

/**
 * 画像のブラー用データURLを生成
 */
export function generateBlurDataURL(
  width: number = 10,
  height: number = 10,
  color: string = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL();
}

/**
 * 画像の遅延読み込み用の設定
 */
export const LAZY_LOADING_CONFIG = {
  rootMargin: '50px',
  threshold: 0.1,
};

/**
 * レスポンシブ画像のブレークポイント
 */
export const RESPONSIVE_BREAKPOINTS = {
  xs: 480,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1920,
};

/**
 * デフォルトの画像品質設定
 */
export const IMAGE_QUALITY_SETTINGS = {
  high: 90,
  medium: 80,
  low: 60,
  thumbnail: 40,
};

/**
 * CDN用の画像URL変換
 */
export function convertToCDNUrl(src: string, cdnDomain?: string): string {
  if (!cdnDomain || src.startsWith('http')) {
    return src;
  }

  // CDNドメインが設定されている場合は変換
  return `${cdnDomain}${src.startsWith('/') ? '' : '/'}${src}`;
}

/**
 * 画像キャッシュの設定
 */
export const IMAGE_CACHE_CONFIG = {
  // Browser cache
  browserCache: {
    maxAge: 31536000, // 1年
    staleWhileRevalidate: 86400, // 1日
  },
  // CDN cache
  cdnCache: {
    maxAge: 31536000, // 1年
    swr: 86400, // 1日
  },
};
