'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  lazy?: boolean;
  quality?: number;
  placeholder?: 'empty' | 'blur' | 'data:image/...';
  blurDataURL?: string;
  className?: string;
  sizes?: string;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * 最適化された画像コンポーネント
 * - WebP/AVIF形式の自動変換
 * - レスポンシブ画像
 * - 遅延読み込み
 * - プレースホルダー表示
 * - エラーハンドリング
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  lazy = true,
  quality = 80,
  placeholder = 'empty',
  blurDataURL,
  className = '',
  sizes,
  onError,
  onLoad,
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    const currentRef = imgRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    if (onError) onError();
  };

  // Generate blur data URL if not provided
  const generateBlurDataURL = (width: number = 10, height: number = 10) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, width, height);
    }
    return canvas.toDataURL();
  };

  // Default fallback image
  const fallbackSrc = '/images/placeholder.svg';

  // Responsive sizes if not provided
  const responsiveSizes =
    sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  if (imageError) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg
          className="w-12 h-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {isInView && (
        <>
          {isLoading && (
            <div
              className="absolute inset-0 bg-gray-200 animate-pulse rounded"
              style={{ width, height }}
            />
          )}

          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            priority={priority}
            quality={quality}
            sizes={responsiveSizes}
            placeholder={placeholder}
            blurDataURL={
              blurDataURL ||
              (placeholder === 'blur'
                ? generateBlurDataURL(width, height)
                : undefined)
            }
            className={`transition-opacity duration-300 ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleLoad}
            onError={handleError}
            style={{
              objectFit: 'cover',
              ...(width && height ? { width, height } : {}),
            }}
          />
        </>
      )}

      {!isInView && lazy && (
        <div
          className="bg-gray-100 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
    </div>
  );
}
