'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import { Button, Badge, Card, CardContent } from '@/components/ui';
import { Product } from '@/types';
import { formatPrice, cn } from '@/lib/utils';

interface ProductDetailClientProps {
  product: Product;
}

/**
 * 商品詳細ページのクライアントコンポーネント
 * 商品詳細情報、画像ギャラリー、購入ボタンなどを表示
 */
export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  const primaryImage = product.images[selectedImageIndex] || product.images[0];
  const hasDiscount =
    product.comparePrice && product.comparePrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.comparePrice! - product.price) / product.comparePrice!) * 100
      )
    : 0;

  /**
   * 評価星の表示
   */
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'h-5 w-5',
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        )}
      />
    ));
  };

  /**
   * カートに追加処理
   */
  const handleAddToCart = () => {
    // TODO: カートAPI呼び出し
    console.log('カートに追加:', product.id, 'quantity:', quantity);
  };

  /**
   * お気に入りトグル処理
   */
  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
    // TODO: お気に入りAPI呼び出し
  };

  return (
    <div className="container-custom py-6">
      {/* パンくずリスト */}
      <nav className="text-sm text-gray-600 mb-6">
        <span>ホーム</span>
        <span className="mx-2">/</span>
        <span>{product.category.name}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* 商品画像 */}
        <div className="space-y-4">
          {/* メイン画像 */}
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                画像なし
              </div>
            )}
            {hasDiscount && (
              <Badge variant="error" className="absolute top-4 left-4">
                -{discountPercentage}%
              </Badge>
            )}
          </div>

          {/* サムネイル画像 */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    'aspect-square relative bg-gray-100 rounded border-2 overflow-hidden',
                    selectedImageIndex === index
                      ? 'border-orange-500'
                      : 'border-gray-200'
                  )}
                >
                  <Image
                    src={image.url}
                    alt={image.alt || `${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 商品情報 */}
        <div className="space-y-6">
          {/* 商品名とカテゴリー */}
          <div>
            <div className="text-sm text-gray-500 uppercase tracking-wide mb-2">
              {product.category.name}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* 評価 */}
            {product.averageRating && (
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(product.averageRating)}
                </div>
                <span className="text-lg font-medium">
                  {product.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({product.reviewCount}件のレビュー)
                </span>
              </div>
            )}
          </div>

          {/* 価格 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.comparePrice!)}
                </span>
              )}
            </div>
            <div className="text-sm text-green-600 font-medium">送料無料</div>
          </div>

          {/* 商品説明 */}
          <div>
            <h3 className="text-lg font-medium mb-2">商品説明</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* 購入オプション */}
          <Card>
            <CardContent className="p-6 space-y-4">
              {/* 在庫状況 */}
              <div className="flex items-center justify-between">
                <span className="font-medium">在庫状況:</span>
                <span
                  className={cn(
                    'font-medium',
                    product.stock > 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {product.stock > 0
                    ? `在庫あり (${product.stock}点)`
                    : '在庫切れ'}
                </span>
              </div>

              {/* 数量選択 */}
              {product.stock > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="font-medium">数量:</span>
                  <select
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {Array.from(
                      { length: Math.min(product.stock, 10) },
                      (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* アクションボタン */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={cn(
                    'w-full py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center space-x-2',
                    product.stock === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {product.stock === 0 ? '在庫切れ' : 'カートに追加'}
                  </span>
                </button>

                <button
                  onClick={handleFavoriteToggle}
                  className="w-full py-3 px-6 border border-gray-300 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Heart
                    className={cn(
                      'h-5 w-5',
                      isFavorited
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600'
                    )}
                  />
                  <span>
                    {isFavorited ? 'お気に入りから削除' : 'お気に入りに追加'}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 配送・保証情報 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-green-600" />
              <span className="text-sm">明日お届け可能（対象地域）</span>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              <span className="text-sm">30日間返品・交換保証</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="text-sm">1年間メーカー保証</span>
            </div>
          </div>
        </div>
      </div>

      {/* 商品詳細情報 */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">商品仕様</h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-gray-600">商品番号:</dt>
                <dd className="font-medium">{product.sku}</dd>
              </div>
              {product.weight && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">重量:</dt>
                  <dd className="font-medium">{product.weight}kg</dd>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between">
                  <dt className="text-gray-600">サイズ:</dt>
                  <dd className="font-medium">{product.dimensions}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-gray-600">カテゴリー:</dt>
                <dd className="font-medium">{product.category.name}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">配送・返品について</h3>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>配送料:</strong> 全国一律送料無料
              </p>
              <p>
                <strong>お届け日:</strong> 注文から1-2営業日でお届け
              </p>
              <p>
                <strong>返品・交換:</strong>{' '}
                商品到着後30日以内であれば返品・交換可能
              </p>
              <p>
                <strong>保証:</strong> メーカー保証1年間
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
