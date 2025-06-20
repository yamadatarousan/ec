import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

/**
 * データベースクエリ最適化ユーティリティ
 */

// クエリキャッシュ（本番環境ではRedisなどを使用）
const queryCache = new Map<
  string,
  { data: any; timestamp: number; ttl: number }
>();

/**
 * キャッシュ付きクエリ実行
 */
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5分
): Promise<T> {
  const cached = queryCache.get(key);

  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }

  const data = await queryFn();
  queryCache.set(key, { data, timestamp: Date.now(), ttl });

  return data;
}

/**
 * 商品一覧取得の最適化クエリ
 */
export async function getOptimizedProducts(params: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'created_at';
  minPrice?: number;
  maxPrice?: number;
}) {
  const {
    page = 1,
    limit = 20,
    categoryId,
    search,
    sortBy = 'created_at',
    minPrice,
    maxPrice,
  } = params;
  const skip = (page - 1) * limit;

  const cacheKey = `products:${JSON.stringify(params)}`;

  return cachedQuery(
    cacheKey,
    async () => {
      const where: Prisma.ProductWhereInput = {
        status: 'ACTIVE',
        ...(categoryId && { categoryId }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...((minPrice || maxPrice) && {
          price: {
            ...(minPrice && { gte: minPrice }),
            ...(maxPrice && { lte: maxPrice }),
          },
        }),
      };

      const orderBy: Prisma.ProductOrderByWithRelationInput = {
        ...(sortBy === 'price_asc' && { price: 'asc' }),
        ...(sortBy === 'price_desc' && { price: 'desc' }),
        ...(sortBy === 'name' && { name: 'asc' }),
        ...(sortBy === 'created_at' && { createdAt: 'desc' }),
      };

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            price: true,
            comparePrice: true,
            sku: true,
            stock: true,
            createdAt: true,
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
            images: {
              select: {
                id: true,
                url: true,
                alt: true,
              },
              orderBy: { order: 'asc' },
              take: 1,
            },
            _count: {
              select: {
                reviews: true,
                favorites: true,
              },
            },
          },
        }),
        prisma.product.count({ where }),
      ]);

      return {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    2 * 60 * 1000
  ); // 2分キャッシュ
}

/**
 * 商品詳細取得の最適化クエリ
 */
export async function getOptimizedProductDetail(id: string) {
  const cacheKey = `product_detail:${id}`;

  return cachedQuery(
    cacheKey,
    async () => {
      return prisma.product.findUnique({
        where: { id, status: 'ACTIVE' },
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { order: 'asc' },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              reviews: true,
              favorites: true,
            },
          },
        },
      });
    },
    5 * 60 * 1000
  ); // 5分キャッシュ
}

/**
 * ユーザーの注文履歴取得の最適化クエリ
 */
export async function getOptimizedUserOrders(
  userId: string,
  page: number = 1,
  limit: number = 10
) {
  const skip = (page - 1) * limit;
  const cacheKey = `user_orders:${userId}:${page}:${limit}`;

  return cachedQuery(
    cacheKey,
    async () => {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: {
                      select: { url: true, alt: true },
                      take: 1,
                    },
                  },
                },
              },
            },
            address: true,
          },
        }),
        prisma.order.count({ where: { userId } }),
      ]);

      return {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    },
    30 * 1000
  ); // 30秒キャッシュ（注文は頻繁に更新される可能性があるため短め）
}

/**
 * カテゴリ一覧取得の最適化クエリ
 */
export async function getOptimizedCategories() {
  const cacheKey = 'categories_tree';

  return cachedQuery(
    cacheKey,
    async () => {
      return prisma.category.findMany({
        where: { parentId: null },
        include: {
          children: {
            include: {
              _count: {
                select: { products: true },
              },
            },
          },
          _count: {
            select: { products: true },
          },
        },
        orderBy: { name: 'asc' },
      });
    },
    10 * 60 * 1000
  ); // 10分キャッシュ
}

/**
 * 人気商品取得の最適化クエリ
 */
export async function getOptimizedPopularProducts(limit: number = 10) {
  const cacheKey = `popular_products:${limit}`;

  return cachedQuery(
    cacheKey,
    async () => {
      // 過去30日間のビュー数と購入数を基に人気商品を決定
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return prisma.$queryRaw`
      SELECT 
        p.id,
        p.name,
        p.price,
        p."comparePrice",
        p.stock,
        COUNT(DISTINCT pv.id) as view_count,
        COUNT(DISTINCT oi.id) as purchase_count,
        (COUNT(DISTINCT pv.id) * 0.3 + COUNT(DISTINCT oi.id) * 0.7) as popularity_score
      FROM products p
      LEFT JOIN product_views pv ON p.id = pv."productId" 
        AND pv."viewedAt" >= ${thirtyDaysAgo}
      LEFT JOIN order_items oi ON p.id = oi."productId"
      LEFT JOIN orders o ON oi."orderId" = o.id 
        AND o."createdAt" >= ${thirtyDaysAgo}
      WHERE p.status = 'ACTIVE'
      GROUP BY p.id, p.name, p.price, p."comparePrice", p.stock
      ORDER BY popularity_score DESC
      LIMIT ${limit}
    `;
    },
    15 * 60 * 1000
  ); // 15分キャッシュ
}

/**
 * 関連商品取得の最適化クエリ
 */
export async function getOptimizedRelatedProducts(
  productId: string,
  limit: number = 5
) {
  const cacheKey = `related_products:${productId}:${limit}`;

  return cachedQuery(
    cacheKey,
    async () => {
      // 同じカテゴリの商品を取得
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { categoryId: true },
      });

      if (!product) return [];

      return prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          status: 'ACTIVE',
          id: { not: productId },
        },
        select: {
          id: true,
          name: true,
          price: true,
          comparePrice: true,
          images: {
            select: { url: true, alt: true },
            take: 1,
          },
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      });
    },
    10 * 60 * 1000
  ); // 10分キャッシュ
}

/**
 * 検索候補取得の最適化クエリ
 */
export async function getOptimizedSearchSuggestions(
  query: string,
  limit: number = 5
) {
  if (!query || query.length < 2) return [];

  const cacheKey = `search_suggestions:${query}:${limit}`;

  return cachedQuery(
    cacheKey,
    async () => {
      return prisma.product.findMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
        },
        take: limit,
        orderBy: { name: 'asc' },
      });
    },
    5 * 60 * 1000
  ); // 5分キャッシュ
}

/**
 * キャッシュクリア
 */
export function clearCache(pattern?: string) {
  if (pattern) {
    for (const [key] of queryCache) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}

/**
 * 統計情報取得の最適化クエリ
 */
export async function getOptimizedStats() {
  const cacheKey = 'admin_stats';

  return cachedQuery(
    cacheKey,
    async () => {
      const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        recentOrders,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: { not: 'CANCELLED' } },
        }),
        prisma.order.count({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 過去24時間
            },
          },
        }),
      ]);

      return {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        recentOrders,
      };
    },
    5 * 60 * 1000
  ); // 5分キャッシュ
}

/**
 * バッチ更新用のヘルパー関数
 */
export async function batchUpdateProducts(
  updates: Array<{ id: string; data: Prisma.ProductUpdateInput }>
) {
  const batchSize = 100;
  const results = [];

  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const batchPromises = batch.map(({ id, data }) =>
      prisma.product.update({ where: { id }, data })
    );

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
