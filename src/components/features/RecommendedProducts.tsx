'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Heart,
  ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { formatPrice } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  images: Array<{ url: string; alt?: string }>;
  category: { name: string };
  averageRating?: number;
  reviewCount?: number;
}

interface RecommendedProductsProps {
  title: string;
  type: 'general' | 'recent' | 'collaborative' | 'content-based';
  categoryId?: string;
  excludeProductIds?: string[];
  limit?: number;
  className?: string;
}

export const RecommendedProducts: React.FC<RecommendedProductsProps> = ({
  title,
  type,
  categoryId,
  excludeProductIds = [],
  limit = 8,
  className,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let sid = localStorage.getItem('sessionId');
      if (!sid) {
        sid = 'session_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('sessionId', sid);
      }
      return sid;
    }
    return null;
  });

  const itemsPerPage = 4;
  const maxIndex = Math.max(0, products.length - itemsPerPage);

  const fetchRecommendations = useCallback(async () => {
    // セッションIDが未定義の場合は実行しない（クライアントサイドでの初期化待ち）
    if (typeof window === 'undefined') return;
    if (!sessionId && !user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        limit: limit.toString(),
      });

      if (user?.id) {
        params.set('userId', user.id);
      } else if (sessionId) {
        params.set('sessionId', sessionId);
      }

      if (categoryId) {
        params.set('categoryId', categoryId);
      }

      if (excludeProductIds.length > 0) {
        params.set('excludeProductIds', excludeProductIds.join(','));
      }

      const response = await fetch(`/api/recommendations?${params.toString()}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch recommendations');
      }

      setProducts(result.data || []);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [
    type,
    limit,
    user?.id,
    sessionId,
    categoryId,
    excludeProductIds.join(','),
  ]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handlePrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + 1));
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    if (!user) return;

    try {
      if (isInWishlist(productId)) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    }
  };

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>

        {products.length > itemsPerPage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleProducts.map(product => (
          <Card
            key={product.id}
            className="group hover:shadow-lg transition-shadow"
          >
            <div className="relative aspect-square">
              {product.images.length > 0 ? (
                <Image
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.name}
                  fill
                  className="object-cover rounded-t-lg"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-t-lg">
                  <span className="text-gray-400">画像なし</span>
                </div>
              )}

              {/* ウィッシュリストボタン */}
              {user && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleToggleWishlist(product.id)}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isInWishlist(product.id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-600'
                    }`}
                  />
                </Button>
              )}

              {/* セール情報 */}
              {product.comparePrice && product.comparePrice > product.price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -
                  {Math.round(
                    ((product.comparePrice - product.price) /
                      product.comparePrice) *
                      100
                  )}
                  %
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-sm line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
              </Link>

              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  {product.category.name}
                </Badge>
              </div>

              {/* 評価 */}
              {product.averageRating && (
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(product.averageRating!)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">
                    ({product.reviewCount || 0})
                  </span>
                </div>
              )}

              {/* 価格 */}
              <div className="mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-red-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice &&
                    product.comparePrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.comparePrice)}
                      </span>
                    )}
                </div>
              </div>

              {/* カートに追加ボタン */}
              <Button
                onClick={() => handleAddToCart(product.id)}
                className="w-full"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                カートに追加
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
