import { Product, Category, ProductStatus } from '@/types';

/**
 * モックカテゴリーデータ
 */
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: '家電・PC',
    description: '家電製品とパソコン関連商品',
    slug: 'electronics',
    imageUrl: '/images/categories/electronics.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-2',
    name: 'ファッション',
    description: '衣類、靴、アクセサリー',
    slug: 'fashion',
    imageUrl: '/images/categories/fashion.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-3',
    name: '本・雑誌',
    description: '書籍、雑誌、電子書籍',
    slug: 'books',
    imageUrl: '/images/categories/books.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-4',
    name: 'ホーム・キッチン',
    description: '家具、キッチン用品、インテリア',
    slug: 'home',
    imageUrl: '/images/categories/home.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'cat-5',
    name: 'スポーツ・アウトドア',
    description: 'スポーツ用品、アウトドア用品',
    slug: 'sports',
    imageUrl: '/images/categories/sports.jpg',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

/**
 * モック商品データ
 */
export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'MacBook Pro 14インチ M3 Pro',
    description:
      'Apple M3 Proチップ搭載の高性能ノートパソコン。プロフェッショナルな作業に最適な性能と美しいRetinaディスプレイを搭載。',
    price: 298000,
    comparePrice: 320000,
    sku: 'MBP-14-M3PRO-001',
    stock: 15,
    status: ProductStatus.ACTIVE,
    weight: 1.6,
    dimensions: '31.26 x 22.12 x 1.55 cm',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-01'),
    categoryId: 'cat-1',
    category: mockCategories[0],
    images: [
      {
        id: 'img-1',
        url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop',
        alt: 'MacBook Pro 14インチ',
        order: 0,
        createdAt: new Date('2024-01-15'),
        productId: 'prod-1',
      },
    ],
    reviews: [],
    averageRating: 4.8,
    reviewCount: 127,
  },
  {
    id: 'prod-2',
    name: 'iPhone 15 Pro 128GB',
    description:
      '最新のA17 Proチップとチタニウム素材を採用したプレミアムスマートフォン。',
    price: 159800,
    sku: 'IPH15PRO-128-001',
    stock: 8,
    status: ProductStatus.ACTIVE,
    weight: 0.187,
    dimensions: '14.67 x 7.08 x 0.83 cm',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-06-01'),
    categoryId: 'cat-1',
    category: mockCategories[0],
    images: [
      {
        id: 'img-2',
        url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop',
        alt: 'iPhone 15 Pro',
        order: 0,
        createdAt: new Date('2024-02-01'),
        productId: 'prod-2',
      },
    ],
    reviews: [],
    averageRating: 4.6,
    reviewCount: 89,
  },
  {
    id: 'prod-3',
    name: 'ユニクロ ウルトラライトダウンジャケット',
    description:
      '軽量で暖かく、持ち運びに便利なダウンジャケット。様々なシーンで活躍します。',
    price: 5990,
    comparePrice: 7990,
    sku: 'UNI-ULD-001',
    stock: 25,
    status: ProductStatus.ACTIVE,
    weight: 0.3,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-06-01'),
    categoryId: 'cat-2',
    category: mockCategories[1],
    images: [
      {
        id: 'img-3',
        url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop',
        alt: 'ウルトラライトダウンジャケット',
        order: 0,
        createdAt: new Date('2024-03-01'),
        productId: 'prod-3',
      },
    ],
    reviews: [],
    averageRating: 4.3,
    reviewCount: 256,
  },
  {
    id: 'prod-4',
    name: 'ハリー・ポッターと賢者の石',
    description:
      'J.K.ローリング著の大人気ファンタジー小説第1巻。魔法界への扉が開かれる物語。',
    price: 1980,
    sku: 'HP-BOOK-001',
    stock: 12,
    status: ProductStatus.ACTIVE,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-06-01'),
    categoryId: 'cat-3',
    category: mockCategories[2],
    images: [
      {
        id: 'img-4',
        url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop',
        alt: 'ハリー・ポッターと賢者の石',
        order: 0,
        createdAt: new Date('2024-01-10'),
        productId: 'prod-4',
      },
    ],
    reviews: [],
    averageRating: 4.9,
    reviewCount: 1523,
  },
  {
    id: 'prod-5',
    name: 'バルミューダ トースター',
    description:
      '最高の香りと食感を実現するスチームテクノロジー搭載の高級トースター。',
    price: 27500,
    comparePrice: 30000,
    sku: 'BAL-TOAST-001',
    stock: 7,
    status: ProductStatus.ACTIVE,
    weight: 4.4,
    dimensions: '35.7 x 32.1 x 20.9 cm',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-06-01'),
    categoryId: 'cat-4',
    category: mockCategories[3],
    images: [
      {
        id: 'img-5',
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop',
        alt: 'バルミューダ トースター',
        order: 0,
        createdAt: new Date('2024-02-15'),
        productId: 'prod-5',
      },
    ],
    reviews: [],
    averageRating: 4.4,
    reviewCount: 78,
  },
  {
    id: 'prod-6',
    name: 'ナイキ エアマックス 270',
    description:
      '最大のエアユニットを搭載した革新的なランニングシューズ。快適性とスタイルを両立。',
    price: 17600,
    sku: 'NIKE-AM270-001',
    stock: 0,
    status: ProductStatus.ACTIVE,
    weight: 0.8,
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-06-01'),
    categoryId: 'cat-5',
    category: mockCategories[4],
    images: [
      {
        id: 'img-6',
        url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
        alt: 'ナイキ エアマックス 270',
        order: 0,
        createdAt: new Date('2024-03-20'),
        productId: 'prod-6',
      },
    ],
    reviews: [],
    averageRating: 4.2,
    reviewCount: 145,
  },
  {
    id: 'prod-7',
    name: 'ソニー ワイヤレスヘッドホン WH-1000XM5',
    description:
      '業界最高クラスのノイズキャンセリング機能を搭載したプレミアムヘッドホン。',
    price: 39600,
    comparePrice: 44000,
    sku: 'SONY-WH1000XM5-001',
    stock: 18,
    status: ProductStatus.ACTIVE,
    weight: 0.25,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-06-01'),
    categoryId: 'cat-1',
    category: mockCategories[0],
    images: [
      {
        id: 'img-7',
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
        alt: 'ソニー ワイヤレスヘッドホン',
        order: 0,
        createdAt: new Date('2024-01-25'),
        productId: 'prod-7',
      },
    ],
    reviews: [],
    averageRating: 4.7,
    reviewCount: 312,
  },
  {
    id: 'prod-8',
    name: 'リーバイス 501 オリジナル ジーンズ',
    description: 'アメリカンデニムの定番、リーバイス501の正統な後継モデル。',
    price: 12100,
    sku: 'LEVIS-501-001',
    stock: 30,
    status: ProductStatus.ACTIVE,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-06-01'),
    categoryId: 'cat-2',
    category: mockCategories[1],
    images: [
      {
        id: 'img-8',
        url: 'https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=500&h=500&fit=crop',
        alt: 'リーバイス 501 ジーンズ',
        order: 0,
        createdAt: new Date('2024-04-01'),
        productId: 'prod-8',
      },
    ],
    reviews: [],
    averageRating: 4.1,
    reviewCount: 67,
  },
];

/**
 * カテゴリーIDで商品をフィルタリング
 */
export function getProductsByCategory(categoryId: string): Product[] {
  return mockProducts.filter(product => product.categoryId === categoryId);
}

/**
 * 商品IDで商品を取得
 */
export function getProductById(productId: string): Product | undefined {
  return mockProducts.find(product => product.id === productId);
}

/**
 * 検索キーワードで商品をフィルタリング
 */
export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(
    product =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.category.name.toLowerCase().includes(lowercaseQuery)
  );
}
