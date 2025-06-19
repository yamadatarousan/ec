import { prisma } from '@/lib/prisma';

export interface ViewHistory {
  id: string;
  userId?: string;
  productId: string;
  sessionId?: string;
  viewedAt: Date;
  product?: {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface RecommendationFilters {
  userId?: string;
  sessionId?: string;
  categoryId?: string;
  excludeProductIds?: string[];
  limit?: number;
}

/**
 * 商品閲覧履歴を記録
 */
export async function trackProductView(
  productId: string,
  userId?: string,
  sessionId?: string
) {
  try {
    // 既存の閲覧履歴があるかチェック（同一セッション内での重複を防ぐ）
    const existingView = await prisma.productView.findFirst({
      where: {
        productId,
        userId: userId || null,
        sessionId: sessionId || null,
        viewedAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // 30分以内
        },
      },
    });

    if (existingView) {
      // 既存の閲覧履歴を更新
      return await prisma.productView.update({
        where: { id: existingView.id },
        data: { viewedAt: new Date() },
      });
    }

    // 新しい閲覧履歴を作成
    return await prisma.productView.create({
      data: {
        productId,
        userId: userId || null,
        sessionId: sessionId || null,
        viewedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to track product view:', error);
    return null;
  }
}

/**
 * ユーザーの閲覧履歴を取得
 */
export async function getUserViewHistory(
  userId?: string,
  sessionId?: string,
  limit: number = 20
): Promise<ViewHistory[]> {
  try {
    const viewHistory = await prisma.productView.findMany({
      where: {
        userId: userId || null,
        sessionId: sessionId || null,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { viewedAt: 'desc' },
      take: limit,
    });

    return viewHistory.map(view => ({
      id: view.id,
      userId: view.userId || undefined,
      productId: view.productId,
      sessionId: view.sessionId || undefined,
      viewedAt: view.viewedAt,
      product: view.product
        ? {
            ...view.product,
            price: Number(view.product.price),
          }
        : undefined,
    }));
  } catch (error) {
    console.error('Failed to get user view history:', error);
    return [];
  }
}

/**
 * 協調フィルタリングによる商品推薦
 * 同じ商品を見たユーザーが他に見た商品を推薦
 */
export async function getCollaborativeRecommendations(
  filters: RecommendationFilters
): Promise<string[]> {
  try {
    const { userId, sessionId, excludeProductIds = [], limit = 10 } = filters;

    if (!userId && !sessionId) {
      return [];
    }

    // ユーザー/セッションの閲覧履歴を取得
    const userViews = await prisma.productView.findMany({
      where: {
        userId: userId || null,
        sessionId: sessionId || null,
      },
      select: { productId: true },
      take: 20, // 直近20件の閲覧履歴を使用
      orderBy: { viewedAt: 'desc' },
    });

    if (userViews.length === 0) {
      return [];
    }

    const viewedProductIds = userViews.map(view => view.productId);

    // 同じ商品を見た他のユーザー/セッションを取得
    const similarUsers = await prisma.productView.findMany({
      where: {
        productId: { in: viewedProductIds },
        NOT: {
          AND: [{ userId: userId || null }, { sessionId: sessionId || null }],
        },
      },
      select: { userId: true, sessionId: true },
      distinct: ['userId', 'sessionId'],
    });

    // 類似ユーザーが見た他の商品を取得
    const recommendedProducts = await prisma.productView.findMany({
      where: {
        OR: similarUsers.map(user => ({
          userId: user.userId,
          sessionId: user.sessionId,
        })),
        productId: {
          notIn: [...viewedProductIds, ...excludeProductIds],
        },
      },
      select: { productId: true },
      orderBy: { viewedAt: 'desc' },
    });

    // 商品IDの出現頻度でソート
    const productCounts = recommendedProducts.reduce(
      (acc, view) => {
        acc[view.productId] = (acc[view.productId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([productId]) => productId);
  } catch (error) {
    console.error('Failed to get collaborative recommendations:', error);
    return [];
  }
}

/**
 * コンテンツベースフィルタリングによる商品推薦
 * 閲覧した商品と同じカテゴリーの人気商品を推薦
 */
export async function getContentBasedRecommendations(
  filters: RecommendationFilters
): Promise<string[]> {
  try {
    const {
      userId,
      sessionId,
      categoryId,
      excludeProductIds = [],
      limit = 10,
    } = filters;

    let targetCategoryIds: string[] = [];

    if (categoryId) {
      targetCategoryIds = [categoryId];
    } else if (userId || sessionId) {
      // ユーザーの閲覧履歴からカテゴリを抽出
      const userViews = await prisma.productView.findMany({
        where: {
          userId: userId || null,
          sessionId: sessionId || null,
        },
        include: {
          product: {
            select: { categoryId: true },
          },
        },
        take: 10,
        orderBy: { viewedAt: 'desc' },
      });

      const categoryCounts = userViews.reduce(
        (acc, view) => {
          const categoryId = view.product.categoryId;
          acc[categoryId] = (acc[categoryId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      targetCategoryIds = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([categoryId]) => categoryId);
    }

    if (targetCategoryIds.length === 0) {
      return [];
    }

    // カテゴリ内の人気商品を取得（閲覧数とレビュー数で評価）
    const popularProducts = await prisma.product.findMany({
      where: {
        categoryId: { in: targetCategoryIds },
        id: { notIn: excludeProductIds },
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: {
            productViews: true,
            reviews: true,
            orderItems: true,
          },
        },
      },
      take: limit * 2, // 多めに取得してからフィルタリング
    });

    // 人気度スコアで並び替え
    const productsWithScore = popularProducts.map(product => ({
      productId: product.id,
      score:
        product._count.productViews * 1 +
        product._count.reviews * 3 +
        product._count.orderItems * 5,
    }));

    return productsWithScore
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.productId);
  } catch (error) {
    console.error('Failed to get content-based recommendations:', error);
    return [];
  }
}

/**
 * 統合推薦システム
 * 協調フィルタリングとコンテンツベースフィルタリングの結果を統合
 */
export async function getRecommendations(
  filters: RecommendationFilters
): Promise<string[]> {
  try {
    const { limit = 10 } = filters;

    const [collaborativeRecs, contentBasedRecs] = await Promise.all([
      getCollaborativeRecommendations({
        ...filters,
        limit: Math.ceil(limit * 0.6),
      }),
      getContentBasedRecommendations({
        ...filters,
        limit: Math.ceil(limit * 0.8),
      }),
    ]);

    // 推薦結果を統合（協調フィルタリングを優先）
    const combinedRecs = [...collaborativeRecs];

    for (const productId of contentBasedRecs) {
      if (!combinedRecs.includes(productId) && combinedRecs.length < limit) {
        combinedRecs.push(productId);
      }
    }

    return combinedRecs.slice(0, limit);
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return [];
  }
}

/**
 * 最近閲覧した商品を取得
 */
export async function getRecentlyViewedProducts(
  userId?: string,
  sessionId?: string,
  limit: number = 6
) {
  try {
    const viewHistory = await getUserViewHistory(userId, sessionId, limit);

    const productIds = viewHistory.map(view => view.productId);

    if (productIds.length === 0) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE',
      },
      include: {
        category: true,
        images: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    // 閲覧順序を保持してDecimal型をnumberに変換
    return productIds
      .map(id => {
        const product = products.find(p => p.id === id);
        return product
          ? {
              ...product,
              price: Number(product.price),
              comparePrice: product.comparePrice
                ? Number(product.comparePrice)
                : null,
              weight: product.weight ? Number(product.weight) : null,
            }
          : null;
      })
      .filter(Boolean);
  } catch (error) {
    console.error('Failed to get recently viewed products:', error);
    return [];
  }
}
