'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  height?: number | string;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  className?: string;
  onIntersect?: () => void;
}

/**
 * 遅延読み込みラッパーコンポーネント
 * Intersection Observer APIを使用してコンテンツを遅延読み込み
 */
export default function LazyWrapper({
  children,
  fallback,
  height = 'auto',
  threshold = 0.1,
  rootMargin = '100px',
  once = true,
  className = '',
  onIntersect,
}: LazyWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasIntersected(true);
          onIntersect?.();

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin, once, onIntersect]);

  const shouldRender = once ? hasIntersected : isVisible;

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        height: shouldRender ? 'auto' : height,
        minHeight: shouldRender ? 'auto' : height,
      }}
    >
      {shouldRender ? children : fallback}
    </div>
  );
}
