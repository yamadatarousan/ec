'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyLoadingOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
}

interface UseLazyLoadingReturn {
  ref: React.RefObject<HTMLElement>;
  isVisible: boolean;
  hasIntersected: boolean;
}

/**
 * 遅延読み込み用カスタムフック
 */
export function useLazyLoading(
  options: UseLazyLoadingOptions = {}
): UseLazyLoadingReturn {
  const { threshold = 0.1, rootMargin = '100px', once = true } = options;

  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasIntersected(true);

          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, once]);

  return { ref, isVisible, hasIntersected };
}

/**
 * 無限スクロール用カスタムフック
 */
export function useInfiniteScroll<T>(
  fetchData: (page: number) => Promise<{ data: T[]; hasMore: boolean }>,
  initialPage: number = 1
) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { ref, isVisible } = useLazyLoading({
    threshold: 0.5,
    rootMargin: '100px',
    once: false,
  });

  const loadData = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (loading) return;

      setLoading(true);
      setError(null);

      try {
        const result = await fetchData(pageNum);

        setData(prev => (reset ? result.data : [...prev, ...result.data]));
        setHasMore(result.hasMore);

        if (result.hasMore) {
          setPage(pageNum + 1);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'データの読み込みに失敗しました'
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchData, loading]
  );

  // 初回データ読み込み
  useEffect(() => {
    loadData(initialPage, true);
  }, []);

  // スクロール時の追加データ読み込み
  useEffect(() => {
    if (isVisible && hasMore && !loading) {
      loadData(page);
    }
  }, [isVisible, hasMore, loading, page, loadData]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    loadData(initialPage, true);
  }, [initialPage, loadData]);

  return {
    data,
    loading,
    hasMore,
    error,
    loadMore: () => hasMore && !loading && loadData(page),
    reset,
    ref,
  };
}

/**
 * 画像の遅延読み込み用カスタムフック
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { ref, isVisible } = useLazyLoading();

  useEffect(() => {
    if (isVisible && src) {
      const img = new Image();

      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };

      img.onerror = () => {
        setError(true);
      };

      img.src = src;
    }
  }, [isVisible, src]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    error,
    isVisible,
  };
}

/**
 * コンポーネントの遅延読み込み用カスタムフック
 */
export function useLazyComponent() {
  const [shouldRender, setShouldRender] = useState(false);
  const { ref, hasIntersected } = useLazyLoading();

  useEffect(() => {
    if (hasIntersected) {
      setShouldRender(true);
    }
  }, [hasIntersected]);

  return {
    ref,
    shouldRender,
  };
}

/**
 * データの遅延読み込み用カスタムフック
 */
export function useLazyData<T>(
  fetchData: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ref, hasIntersected } = useLazyLoading();

  useEffect(() => {
    if (hasIntersected && !data) {
      setLoading(true);
      setError(null);

      fetchData()
        .then(setData)
        .catch(err => {
          setError(
            err instanceof Error
              ? err.message
              : 'データの読み込みに失敗しました'
          );
        })
        .finally(() => setLoading(false));
    }
  }, [hasIntersected, data, fetchData, ...dependencies]);

  return {
    ref,
    data,
    loading,
    error,
    hasIntersected,
  };
}
