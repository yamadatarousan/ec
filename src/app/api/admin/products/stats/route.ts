import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const [total, active, inactive, draft, lowStock, totalValue] =
      await Promise.all([
        // 総商品数
        prisma.product.count(),

        // 公開中の商品数
        prisma.product.count({
          where: { status: 'ACTIVE' },
        }),

        // 非公開の商品数
        prisma.product.count({
          where: { status: 'INACTIVE' },
        }),

        // 下書きの商品数
        prisma.product.count({
          where: { status: 'DRAFT' },
        }),

        // 在庫少の商品数（10個以下）
        prisma.product.count({
          where: {
            status: 'ACTIVE',
            stock: {
              lte: 10,
            },
          },
        }),

        // 総在庫価値（アクティブな商品のみ）
        prisma.product.aggregate({
          where: { status: 'ACTIVE' },
          _sum: {
            price: true,
          },
        }),
      ]);

    const stats = {
      total,
      active,
      inactive,
      draft,
      lowStock,
      totalValue: Number(totalValue._sum.price || 0),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to get product stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get product stats' },
      { status: 500 }
    );
  }
}
