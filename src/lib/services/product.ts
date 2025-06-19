import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export interface ProductFilters {
  category?: string;
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  search?: string;
  status?: ProductStatus;
  tags?: string[];
}

export interface ProductSort {
  field: 'name' | 'price' | 'createdAt' | 'rating' | 'popularity';
  direction: 'asc' | 'desc';
}

/**
 * 商品一覧を取得
 */
export async function getProducts(
  filters: ProductFilters = {},
  sort: ProductSort = { field: 'createdAt', direction: 'desc' },
  pagination: { page: number; limit: number } = { page: 1, limit: 20 }
) {
  const {
    category,
    categories,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    onSale,
    search,
    status,
  } = filters;
  const { page, limit } = pagination;

  const where: any = {
    status: status || 'ACTIVE',
  };

  // カテゴリフィルター（単一または複数）
  if (category) {
    where.category = {
      slug: category,
    };
  } else if (categories && categories.length > 0) {
    where.category = {
      slug: { in: categories },
    };
  }

  // 価格フィルター
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // セール商品フィルター
  if (onSale) {
    where.comparePrice = {
      not: null,
      gt: prisma.product.fields.price,
    };
  }

  // 在庫フィルター
  if (inStock) {
    where.stock = {
      gt: 0,
    };
  }

  // 検索フィルター
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  // ソート設定
  let orderBy: any;
  switch (sort.field) {
    case 'rating':
      // 評価でソートする場合は、レビュー数も考慮
      orderBy = [
        {
          reviews: {
            _count: sort.direction,
          },
        },
        {
          createdAt: 'desc',
        },
      ];
      break;
    case 'popularity':
      // 人気度は注文数とレビュー数で判断
      orderBy = [
        {
          orderItems: {
            _count: sort.direction,
          },
        },
        {
          reviews: {
            _count: sort.direction,
          },
        },
      ];
      break;
    default:
      orderBy = {
        [sort.field]: sort.direction,
      };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  // 評価フィルターを後処理で適用（Prismaの制限により）
  let filteredProducts = products;
  if (minRating !== undefined) {
    filteredProducts = products.filter(product => {
      if (product.reviews.length === 0) return minRating === 0;
      const avgRating =
        product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length;
      return avgRating >= minRating;
    });
  }

  // 評価情報を追加
  const productsWithRating = filteredProducts.map(product => ({
    ...product,
    averageRating:
      product.reviews.length > 0
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews.length
        : null,
    reviewCount: product.reviews.length,
    // reviewsフィールドを除去してレスポンスサイズを最適化
    reviews: undefined,
  }));

  return {
    products: productsWithRating,
    pagination: {
      page,
      limit,
      total: minRating !== undefined ? filteredProducts.length : total,
      pages: Math.ceil(
        (minRating !== undefined ? filteredProducts.length : total) / limit
      ),
    },
  };
}

/**
 * 商品詳細を取得
 */
export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
      },
      reviews: {
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          reviews: true,
        },
      },
    },
  });
}

/**
 * カテゴリ一覧を取得
 */
export async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: {
        select: {
          products: {
            where: {
              status: 'ACTIVE',
            },
          },
        },
      },
    },
    orderBy: { name: 'asc' },
  });
}

/**
 * 商品の平均評価を計算
 */
export async function getProductRating(productId: string) {
  const result = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return {
    average: result._avg.rating || 0,
    count: result._count.rating,
  };
}

/**
 * 関連商品を取得
 */
export async function getRelatedProducts(productId: string, limit: number = 4) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true },
  });

  if (!product) return [];

  return prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: productId },
      status: 'ACTIVE',
    },
    include: {
      category: true,
      images: {
        orderBy: { order: 'asc' },
        take: 1,
      },
    },
    take: limit,
  });
}
