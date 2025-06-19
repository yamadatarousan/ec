'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  useToast,
  useErrorHandler,
} from '@/components/ui';
import { Product } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { WishlistButton } from './WishlistButton';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  showQuickActions?: boolean;
}

/**
 * 商品カードコンポーネント
 * Amazon風の商品表示カードを提供
 * 商品画像、名前、価格、評価、アクションボタンを含む
 */
function ProductCard({
  product,
  variant = 'default',
  showQuickActions = true,
}: ProductCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { showSuccess } = useToast();
  const { handleError } = useErrorHandler();

  // メモ化された計算処理
  const primaryImage = useMemo(
    () => product.images.find(img => img.order === 0) || product.images[0],
    [product.images]
  );

  const discountInfo = useMemo(() => {
    const hasDiscount =
      product.comparePrice && product.comparePrice > product.price;
    const discountPercentage = hasDiscount
      ? Math.round(
          ((product.comparePrice! - product.price) / product.comparePrice!) *
            100
        )
      : 0;
    return { hasDiscount, discountPercentage };
  }, [product.price, product.comparePrice]);

  /**
   * カートに追加処理
   */
  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isAddingToCart) return;

      setIsAddingToCart(true);
      try {
        await addToCart(product.id, 1);
        showSuccess(
          'カートに追加しました',
          `${product.name}をカートに追加しました`
        );
      } catch (error) {
        handleError(error, 'カートへの追加に失敗しました');
      } finally {
        setIsAddingToCart(false);
      }
    },
    [
      isAddingToCart,
      addToCart,
      product.id,
      product.name,
      showSuccess,
      handleError,
    ]
  );

  /**
   * 評価星の表示
   */
  const renderStars = useCallback((rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-4 w-4',
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        )}
      />
    ));
  }, []);

  // スタイルクラスのメモ化
  const cardClasses = useMemo(
    () => ({
      default: 'h-full',
      compact: 'h-full',
      featured: 'h-full border-2 border-orange-200',
    }),
    []
  );

  const imageClasses = useMemo(
    () => ({
      default: 'aspect-square',
      compact: 'aspect-[4/3]',
      featured: 'aspect-[3/2]',
    }),
    []
  );

  return (
    <Link href={`/products/${product.id}`}>
      <Card
        className={cn(
          'group hover:shadow-lg transition-all duration-200 cursor-pointer',
          cardClasses[variant]
        )}
      >
        <div className="relative">
          {/* 商品画像 */}
          <div
            className={cn(
              'relative overflow-hidden bg-gray-100',
              imageClasses[variant]
            )}
          >
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className={cn(
                  'object-cover transition-all duration-300 group-hover:scale-105',
                  imageLoading ? 'blur-sm' : 'blur-0'
                )}
                onLoad={() => setImageLoading(false)}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                画像なし
              </div>
            )}

            {/* ディスカウントバッジ */}
            {discountInfo.hasDiscount && (
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountInfo.discountPercentage}%
              </div>
            )}

            {/* 在庫切れバッジ */}
            {product.stock === 0 && (
              <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                在庫切れ
              </div>
            )}

            {/* お気に入りボタン */}
            {showQuickActions && (
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <WishlistButton
                  productId={product.id}
                  size="sm"
                  variant="ghost"
                  className="bg-white/80 hover:bg-white shadow-md rounded-full p-2"
                />
              </div>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* カテゴリー */}
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category.name}
          </div>

          {/* 商品名 */}
          <h3
            className={cn(
              'font-medium text-gray-900 line-clamp-2 leading-tight',
              variant === 'compact' ? 'text-sm' : 'text-base'
            )}
          >
            {product.name}
          </h3>

          {/* 評価 */}
          {product.averageRating && (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(product.averageRating)}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* 価格 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span
                className={cn(
                  'font-bold text-gray-900',
                  variant === 'featured' ? 'text-xl' : 'text-lg'
                )}
              >
                {formatPrice(product.price)}
              </span>
              {discountInfo.hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.comparePrice!)}
                </span>
              )}
            </div>

            {/* 配送情報 */}
            <div className="text-xs text-green-600 font-medium">✓ 送料無料</div>
          </div>

          {/* アクションボタン */}
          {showQuickActions && variant !== 'compact' && (
            <div className="pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                className="w-full"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0
                  ? '在庫切れ'
                  : isAddingToCart
                    ? '追加中...'
                    : 'カートに追加'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// React.memoで最適化 - productのidが同じ場合は再レンダリングを回避
const MemoizedProductCard = React.memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.variant === nextProps.variant &&
    prevProps.showQuickActions === nextProps.showQuickActions &&
    prevProps.product.stock === nextProps.product.stock
  );
});

// メモ化されたコンポーネントをデフォルトとしてエクスポート
export { MemoizedProductCard as ProductCard };
