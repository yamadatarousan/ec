'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { ProductCard } from '@/components/features/ProductCard';
import { ProductStatus } from '@/types/product';

// 仮のお気に入り商品データ
const mockFavorites = [
  {
    id: '1',
    name: 'ワイヤレスヘッドホン Premium',
    description: '高音質ワイヤレスヘッドホン',
    price: 15800,
    comparePrice: 19800,
    stock: 15,
    sku: 'WH-001',
    averageRating: 4.5,
    reviewCount: 128,
    status: ProductStatus.ACTIVE,
    weight: 0.3,
    dimensions: '20x18x8cm',
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: 'category-1',
    category: {
      id: 'category-1',
      name: '家電・PC',
      slug: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    images: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        alt: 'ワイヤレスヘッドホン',
        order: 0,
        createdAt: new Date(),
        productId: '1',
      },
    ],
    reviews: [],
  },
  {
    id: '2',
    name: 'スマートウォッチ Series X',
    description: '最新のスマートウォッチ',
    price: 42000,
    comparePrice: null,
    stock: 8,
    sku: 'SW-002',
    averageRating: 4.8,
    reviewCount: 89,
    status: ProductStatus.ACTIVE,
    weight: 0.05,
    dimensions: '4.5x3.8x1.2cm',
    createdAt: new Date(),
    updatedAt: new Date(),
    categoryId: 'category-1',
    category: {
      id: 'category-1',
      name: '家電・PC',
      slug: 'electronics',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    images: [
      {
        id: 'img-2',
        url: 'https://images.unsplash.com/photo-1544117519-31a4b719223d?w=500&h=500&fit=crop',
        alt: 'スマートウォッチ',
        order: 0,
        createdAt: new Date(),
        productId: '2',
      },
    ],
    reviews: [],
  },
];

/**
 * お気に入りページコンポーネント
 * ユーザーがお気に入りに追加した商品一覧を表示
 */
export default function FavoritesPage() {
  const [favorites, setFavorites] = useState(mockFavorites);

  /**
   * お気に入りから削除
   */
  const handleRemoveFromFavorites = (productId: string) => {
    setFavorites(prev => prev.filter(item => item.id !== productId));
  };

  if (favorites.length === 0) {
    return (
      <div className="container-custom py-12">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <Heart className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              お気に入りは空です
            </h1>
            <p className="text-gray-600">
              商品をお気に入りに追加して、後で簡単にアクセスしましょう
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
            お気に入り ({favorites.length}点)
          </h1>
        </div>
      </div>

      {/* お気に入り商品一覧 */}
      <div className="space-y-6">
        {/* グリッド表示 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map(product => (
            <div key={product.id} className="relative">
              <ProductCard
                product={product}
                variant="default"
                showQuickActions={true}
              />
              {/* お気に入り削除ボタン */}
              <button
                onClick={() => handleRemoveFromFavorites(product.id)}
                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 z-10"
                title="お気に入りから削除"
              >
                <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              </button>
            </div>
          ))}
        </div>

        {/* アクションエリア */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  すべてカートに追加
                </h3>
                <p className="text-sm text-gray-600">
                  お気に入りの商品をまとめてカートに追加できます
                </p>
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white px-8"
                disabled={favorites.length === 0}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                すべてカートに追加
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
