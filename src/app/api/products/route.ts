import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/services/product';
import { ProductStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // フィルター設定
    const filters = {
      category: searchParams.get('category') || undefined,
      minPrice: searchParams.get('minPrice')
        ? Number(searchParams.get('minPrice'))
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as ProductStatus) || 'ACTIVE',
    };

    // ソート設定
    const sortField =
      (searchParams.get('sortBy') as 'name' | 'price' | 'createdAt') ||
      'createdAt';
    const sortDirection =
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';
    const sort = { field: sortField, direction: sortDirection };

    // ページネーション設定
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get('limit')) || 20)
    );
    const pagination = { page, limit };

    const result = await getProducts(filters, sort, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error('商品取得エラー:', error);
    return NextResponse.json(
      { error: '商品の取得に失敗しました' },
      { status: 500 }
    );
  }
}
