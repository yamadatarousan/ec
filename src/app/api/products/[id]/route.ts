import { NextRequest, NextResponse } from 'next/server';
import { getProductById, getRelatedProducts } from '@/lib/services/product';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [product, relatedProducts] = await Promise.all([
      getProductById(id),
      getRelatedProducts(id, 4),
    ]);

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error('商品詳細取得エラー:', error);
    return NextResponse.json(
      { error: '商品の取得に失敗しました' },
      { status: 500 }
    );
  }
}
