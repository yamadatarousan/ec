'use client';

import React, { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, Button, Badge } from '@/components/ui';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistItems, loading, error, fetchWishlist, removeFromWishlist } =
    useWishlist();
  const { addToCart } = useCart();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  const handleRemoveFromWishlist = async (productId: string) => {
    setRemovingId(productId);
    await removeFromWishlist(productId);
    setRemovingId(null);
  };

  const handleAddToCart = async (productId: string) => {
    setAddingToCartId(productId);
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCartId(null);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ウィッシュリストを見るにはログインが必要です
          </h1>
          <p className="text-gray-600 mb-6">
            お気に入りの商品を保存してあとで購入することができます。
          </p>
          <Link href="/auth/login">
            <Button size="lg">ログイン</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchWishlist}>再試行</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ウィッシュリスト
        </h1>
        <p className="text-gray-600">
          お気に入りに登録した商品（{wishlistItems.length}件）
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            ウィッシュリストは空です
          </h2>
          <p className="text-gray-600 mb-6">
            商品ページで♡ボタンをクリックして、お気に入りの商品を保存しましょう。
          </p>
          <Link href="/">
            <Button size="lg">商品を探す</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map(item => (
            <Card
              key={item.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <div className="relative aspect-square">
                {item.product.images.length > 0 ? (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.images[0].alt || item.product.name}
                    fill
                    className="object-cover rounded-t-lg"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-t-lg">
                    <span className="text-gray-400">画像なし</span>
                  </div>
                )}

                {/* 削除ボタン */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveFromWishlist(item.product.id)}
                  disabled={removingId === item.product.id}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-4 w-4 text-gray-600" />
                </Button>

                {/* 価格情報 */}
                {item.product.comparePrice &&
                  item.product.comparePrice > item.product.price && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -
                      {Math.round(
                        ((item.product.comparePrice - item.product.price) /
                          item.product.comparePrice) *
                          100
                      )}
                      %
                    </div>
                  )}
              </div>

              <CardContent className="p-4">
                <Link href={`/products/${item.product.id}`}>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
                    {item.product.name}
                  </h3>
                </Link>

                <div className="mb-2">
                  <Badge variant="outline" className="text-xs">
                    {item.product.category.name}
                  </Badge>
                </div>

                {/* 評価 */}
                {item.product.averageRating && (
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.round(item.product.averageRating!)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        >
                          ★
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-600">
                      ({item.product.reviewCount})
                    </span>
                  </div>
                )}

                {/* 価格 */}
                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(item.product.price)}
                    </span>
                    {item.product.comparePrice &&
                      item.product.comparePrice > item.product.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.product.comparePrice)}
                        </span>
                      )}
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item.product.id)}
                    disabled={addingToCartId === item.product.id}
                    className="flex-1"
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {addingToCartId === item.product.id
                      ? '追加中...'
                      : 'カートに追加'}
                  </Button>
                </div>

                {/* 追加日 */}
                <div className="mt-2 text-xs text-gray-500">
                  追加日: {new Date(item.addedAt).toLocaleDateString('ja-JP')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
