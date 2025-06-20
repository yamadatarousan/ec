'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * カートページコンポーネント
 * カート内のアイテムを表示・管理
 */
export default function CartPage() {
  const { items, total, updateQuantity, removeFromCart, clearCart, isLoading } =
    useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  /**
   * 数量更新処理
   */
  const handleQuantityUpdate = async (
    productId: string,
    newQuantity: number
  ) => {
    if (newQuantity < 1) return;

    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await updateQuantity(productId, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  /**
   * チェックアウト処理
   */
  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  /**
   * アイテム削除処理
   */
  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems(prev => new Set(prev).add(productId));
    try {
      await removeFromCart(productId);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  /**
   * カートクリア処理
   */
  const handleClearCart = async () => {
    if (confirm('カート内のすべての商品を削除しますか？')) {
      await clearCart();
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              カートは空です
            </h1>
            <p className="text-gray-600">
              商品を追加して、ショッピングを始めましょう
            </p>
          </div>
          <Link href="/products">
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
              商品を見る
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/products">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>商品一覧に戻る</span>
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            ショッピングカート ({items.length}点)
          </h1>
        </div>
        <Button
          onClick={handleClearCart}
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={isLoading}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          すべて削除
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* カートアイテム */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const isUpdating = updatingItems.has(item.product.id);
            const primaryImage = item.product.images[0];

            return (
              <Card key={item.id} className={cn(isUpdating && 'opacity-50')}>
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    {/* 商品画像 */}
                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {primaryImage ? (
                        <Link href={`/products/${item.product.id}`}>
                          <Image
                            src={primaryImage.url}
                            alt={primaryImage.alt || item.product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                          />
                        </Link>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          画像なし
                        </div>
                      )}
                    </div>

                    {/* 商品情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {item.product.category.name}
                          </div>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="font-medium text-gray-900 hover:text-orange-600 transition-colors line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.product.id)}
                          disabled={isUpdating}
                          className="text-red-600 hover:text-red-700 p-1 rounded transition-colors"
                          title="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* 数量コントロール */}
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">数量:</span>
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() =>
                                handleQuantityUpdate(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                              disabled={item.quantity <= 1 || isUpdating}
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-3 py-1 min-w-[3rem] text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityUpdate(
                                  item.product.id,
                                  item.quantity + 1
                                )
                              }
                              disabled={
                                item.quantity >= item.product.stock ||
                                isUpdating
                              }
                              className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          {item.quantity >= item.product.stock && (
                            <Badge variant="warning" className="text-xs">
                              在庫上限
                            </Badge>
                          )}
                        </div>

                        {/* 価格 */}
                        <div className="text-right">
                          <div className="font-bold text-lg text-gray-900">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          <div className="text-sm text-gray-600">
                            単価: {formatPrice(item.product.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 注文サマリー */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">
                  注文サマリー
                </h2>

                <div className="space-y-3 py-4 border-t border-b border-gray-200">
                  <div className="flex justify-between">
                    <span>小計:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>送料:</span>
                    <span className="text-green-600 font-medium">無料</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>合計:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium py-3"
                    disabled={isLoading}
                  >
                    {isAuthenticated ? 'レジに進む' : 'ログインして注文'}
                  </Button>
                  <div className="text-xs text-gray-600 text-center">
                    ✓ 全商品送料無料
                    <br />✓ 30日間返品保証
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
