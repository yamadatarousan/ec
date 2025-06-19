import { NextRequest, NextResponse } from 'next/server';
import {
  getRecommendations,
  getRecentlyViewedProducts,
} from '@/lib/services/recommendation';
import { getProducts } from '@/lib/services/product';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'general'; // general, collaborative, content-based, recent
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const categoryId = searchParams.get('categoryId');
    const excludeProductIds =
      searchParams.get('excludeProductIds')?.split(',') || [];
    const limit = parseInt(searchParams.get('limit') || '10');

    let productIds: string[] = [];

    switch (type) {
      case 'recent':
        const recentProducts = await getRecentlyViewedProducts(
          userId || undefined,
          sessionId || undefined,
          limit
        );
        return NextResponse.json({
          success: true,
          data: recentProducts,
        });

      case 'general':
      default:
        productIds = await getRecommendations({
          userId: userId || undefined,
          sessionId: sessionId || undefined,
          categoryId: categoryId || undefined,
          excludeProductIds,
          limit,
        });
        break;
    }

    if (productIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // 推薦された商品の詳細情報を取得
    const { products } = await getProducts(
      {
        status: 'ACTIVE',
      },
      { field: 'createdAt', direction: 'desc' },
      { page: 1, limit: 100 }
    );

    // 推薦順序を保持して商品情報を返す
    const recommendedProducts = productIds
      .map(id => products.find(p => p.id === id))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: recommendedProducts,
    });
  } catch (error) {
    console.error('Failed to get recommendations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
