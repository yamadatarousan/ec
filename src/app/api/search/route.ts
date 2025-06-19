import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/services/product';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          pages: 0,
        },
        query: '',
      });
    }

    // 検索フィルターを設定
    const filters = {
      search: query.trim(),
    };

    // ソート設定（関連度順 - 現在は作成日順で代用）
    const sort = {
      field: 'createdAt' as const,
      direction: 'desc' as const,
    };

    // ページネーション設定
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(
      20,
      Math.max(1, Number(searchParams.get('limit')) || 10)
    );
    const pagination = { page, limit };

    const result = await getProducts(filters, sort, pagination);

    return NextResponse.json({
      ...result,
      query: query.trim(),
    });
  } catch (error) {
    console.error('検索エラー:', error);
    return NextResponse.json({ error: '検索に失敗しました' }, { status: 500 });
  }
}
