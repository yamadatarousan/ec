import { prisma } from '@/lib/prisma';
import { ProductStatus } from '@prisma/client';

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: ProductStatus;
}

export interface ProductSort {
  field: 'name' | 'price' | 'createdAt';
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
  const { category, minPrice, maxPrice, search, status } = filters;
  const { page, limit } = pagination;

  const where: any = {
    status: status || 'ACTIVE',
  };

  // カテゴリフィルター
  if (category) {
    where.category = {
      slug: category,
    };
  }

  // 価格フィルター
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // 検索フィルター
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      orderBy: {
        [sort.field]: sort.direction,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
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
