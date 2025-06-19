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
import { formatPrice, cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { ProductCard } from '@/components/features/ProductCard';
import { ReviewForm, ReviewStats } from '@/components/features/ReviewForm';
import { ReviewList } from '@/components/features/ReviewList';
import { ProductStatus } from '@/types/product';

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    sku: string;
    stock: number;
    weight?: number | null;
    dimensions?: string | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    images: {
      id: string;
      url: string;
      alt?: string | null;
    }[];
    reviews: {
      id: string;
      rating: number;
      title?: string | null;
      comment: string;
      user: {
        name?: string | null;
        avatar?: string | null;
      };
    }[];
    _count: {
      reviews: number;
    };
  };
  relatedProducts: {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    category: {
      name: string;
    };
    images: {
      url: string;
      alt?: string | null;
    }[];
  }[];
}

/**
 * 商品詳細ページのクライアントコンポーネント
 * 商品詳細情報、画像ギャラリー、購入ボタンなどを表示
 */
export function ProductDetailClient({
  product,
  relatedProducts,
}: ProductDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const { addToCart, isLoading } = useCart();

  const primaryImage = product.images[selectedImageIndex] || product.images[0];
  const price = product.price;
  const comparePrice = product.comparePrice;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((comparePrice! - price) / comparePrice!) * 100)
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
  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
    } catch (error) {
      console.error('カートに追加できませんでした:', error);
    }
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
            {product.reviews.length > 0 && (
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(
                    product.reviews.reduce(
                      (sum, review) => sum + review.rating,
                      0
                    ) / product.reviews.length
                  )}
                </div>
                <span className="text-lg font-medium">
                  {(
                    product.reviews.reduce(
                      (sum, review) => sum + review.rating,
                      0
                    ) / product.reviews.length
                  ).toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({product._count.reviews}件のレビュー)
                </span>
              </div>
            )}
          </div>

          {/* 価格 */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(comparePrice!)}
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
                  disabled={product.stock === 0 || isLoading}
                  className={cn(
                    'w-full py-3 px-6 rounded-md font-medium transition-colors flex items-center justify-center space-x-2',
                    product.stock === 0 || isLoading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
                  )}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>
                    {product.stock === 0
                      ? '在庫切れ'
                      : isLoading
                        ? '追加中...'
                        : 'カートに追加'}
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

      {/* 商品詳細・レビュータブ */}
      <div className="mt-16">
        <div className="border-t border-gray-200 pt-16">
          {/* タブナビゲーション */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('description')}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'description'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                商品説明
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                レビュー ({product._count.reviews})
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={cn(
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === 'specifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                仕様
              </button>
            </nav>
          </div>

          {/* タブコンテンツ */}
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-4">商品説明</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              {/* レビュー統計 */}
              <ReviewStats
                averageRating={
                  product.reviews.length > 0
                    ? product.reviews.reduce(
                        (sum, review) => sum + review.rating,
                        0
                      ) / product.reviews.length
                    : 0
                }
                totalReviews={product._count.reviews}
                ratingDistribution={product.reviews.reduce(
                  (acc, review) => {
                    acc[review.rating] = (acc[review.rating] || 0) + 1;
                    return acc;
                  },
                  {} as Record<number, number>
                )}
              />

              {/* レビュー投稿フォーム */}
              <ReviewForm
                productId={product.id}
                onReviewSubmitted={() =>
                  setReviewRefreshTrigger(prev => prev + 1)
                }
              />

              {/* レビュー一覧 */}
              <ReviewList
                productId={product.id}
                refreshTrigger={reviewRefreshTrigger}
              />
            </div>
          )}

          {activeTab === 'specifications' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">商品仕様</h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">SKU</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {product.sku}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      カテゴリ
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {product.category.name}
                    </dd>
                  </div>
                  {product.weight && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        重量
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {product.weight}g
                      </dd>
                    </div>
                  )}
                  {product.dimensions && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        サイズ
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {product.dimensions}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      在庫数
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {product.stock}個
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 関連商品 */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">関連商品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard
                key={relatedProduct.id}
                product={{
                  id: relatedProduct.id,
                  name: relatedProduct.name,
                  description: relatedProduct.description,
                  price: relatedProduct.price,
                  comparePrice: relatedProduct.comparePrice,
                  stock: 10, // 仮の在庫数
                  sku: `SKU-${relatedProduct.id}`,
                  averageRating: 4.5,
                  reviewCount: 25,
                  status: ProductStatus.ACTIVE,
                  weight: null,
                  dimensions: null,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  categoryId: 'category-' + relatedProduct.id,
                  category: {
                    id: 'category-' + relatedProduct.id,
                    name: relatedProduct.category.name,
                    slug: relatedProduct.category.name.toLowerCase(),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  },
                  images: relatedProduct.images.map((img, index) => ({
                    id: `${relatedProduct.id}-${index}`,
                    url: img.url,
                    alt: img.alt,
                    order: index,
                    createdAt: new Date(),
                    productId: relatedProduct.id,
                  })),
                  reviews: [],
                }}
                variant="compact"
                showQuickActions={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
