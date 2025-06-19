'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { Product } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';

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
export function ProductCard({
  product,
  variant = 'default',
  showQuickActions = true,
}: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { addToCart, isLoading } = useCart();

  const primaryImage =
    product.images.find(img => img.order === 0) || product.images[0];
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  /**
   * お気に入りトグル処理
   */
  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
    // TODO: お気に入りAPI呼び出し
  };

  /**
   * カートに追加処理
   */
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error('カートに追加できませんでした:', error);
    }
  };

  /**
   * 評価星の表示
   */
  const renderStars = (rating: number) => {
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
  };

  const cardClasses = {
    default: 'h-full',
    compact: 'h-full',
    featured: 'h-full border-2 border-orange-200',
  };

  const imageClasses = {
    default: 'aspect-square',
    compact: 'aspect-[4/3]',
    featured: 'aspect-[3/2]',
  };

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
            {hasDiscount && (
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{discountPercentage}%
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
              <button
                onClick={handleFavoriteToggle}
                className={cn(
                  'absolute top-2 right-2 p-2 rounded-full transition-all duration-200',
                  'bg-white/80 hover:bg-white shadow-md',
                  'opacity-0 group-hover:opacity-100',
                  isFavorited && 'opacity-100'
                )}
              >
                <Heart
                  className={cn(
                    'h-4 w-4 transition-colors duration-200',
                    isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-600'
                  )}
                />
              </button>
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
              {hasDiscount && (
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
                disabled={product.stock === 0 || isLoading}
                className="w-full"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.stock === 0
                  ? '在庫切れ'
                  : isLoading
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
