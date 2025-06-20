'use client';

import React from 'react';
import { useInfiniteScroll, useLazyComponent } from '@/hooks/useLazyLoading';
import OptimizedImage from './OptimizedImage';
import LazyWrapper from './LazyWrapper';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: Array<{ url: string; alt: string }>;
  category: { name: string };
}

interface LazyProductListProps {
  fetchProducts: (
    page: number
  ) => Promise<{ data: Product[]; hasMore: boolean }>;
  className?: string;
}

/**
 * 遅延読み込み対応の商品リストコンポーネント
 */
export default function LazyProductList({
  fetchProducts,
  className = '',
}: LazyProductListProps) {
  const {
    data: products,
    loading,
    hasMore,
    error,
    ref,
  } = useInfiniteScroll(fetchProducts);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">エラー: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <LazyProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {/* 無限スクロール用のトリガー要素 */}
      {hasMore && (
        <div
          ref={ref as React.RefObject<HTMLDivElement>}
          className="flex justify-center py-8"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span>読み込み中...</span>
            </div>
          ) : (
            <div className="h-10" />
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          すべての商品を表示しました
        </div>
      )}
    </div>
  );
}

/**
 * 遅延読み込み対応の商品カードコンポーネント
 */
function LazyProductCard({
  product,
  index,
}: {
  product: Product;
  index: number;
}) {
  const { ref, shouldRender } = useLazyComponent();

  // 最初の数個は即座に表示し、それ以降は遅延読み込み
  const shouldLazyLoad = index > 8;

  if (shouldLazyLoad && !shouldRender) {
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className="bg-white rounded-lg shadow-md p-4 animate-pulse"
        style={{ height: '350px' }}
      >
        <div className="bg-gray-200 w-full h-48 rounded mb-4"></div>
        <div className="bg-gray-200 h-4 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
        <div className="bg-gray-200 h-6 rounded w-1/2"></div>
      </div>
    );
  }

  return (
    <LazyWrapper fallback={<ProductCardSkeleton />} height="350px">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <OptimizedImage
            src={product.images[0]?.url || '/placeholder-product.jpg'}
            alt={product.images[0]?.alt || product.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
            priority={index < 4} // 最初の4つの画像は優先読み込み
            lazy={index >= 4}
          />

          {product.comparePrice && product.comparePrice > product.price && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              SALE
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="text-sm text-gray-500 mb-1">
            {product.category.name}
          </div>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">
              ¥{product.price.toLocaleString()}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ¥{product.comparePrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </LazyWrapper>
  );
}

/**
 * 商品カードのスケルトンコンポーネント
 */
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="bg-gray-200 w-full h-48"></div>
      <div className="p-4">
        <div className="bg-gray-200 h-3 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded mb-2"></div>
        <div className="bg-gray-200 h-4 rounded w-3/4 mb-2"></div>
        <div className="bg-gray-200 h-6 rounded w-1/2"></div>
      </div>
    </div>
  );
}
