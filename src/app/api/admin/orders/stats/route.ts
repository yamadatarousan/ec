import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const [
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      totalRevenue,
      averageOrderValue,
    ] = await Promise.all([
      // 総注文数
      prisma.order.count(),

      // 処理中の注文数
      prisma.order.count({
        where: { status: 'PENDING' },
      }),

      // 確認済みの注文数
      prisma.order.count({
        where: { status: 'CONFIRMED' },
      }),

      // 発送済みの注文数
      prisma.order.count({
        where: { status: 'SHIPPED' },
      }),

      // 配達完了の注文数
      prisma.order.count({
        where: { status: 'DELIVERED' },
      }),

      // キャンセルされた注文数
      prisma.order.count({
        where: { status: 'CANCELLED' },
      }),

      // 総売上（配達完了分のみ）
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: {
          totalAmount: true,
        },
      }),

      // 平均注文額（配達完了分のみ）
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _avg: {
          totalAmount: true,
        },
      }),
    ]);

    const stats = {
      total,
      pending,
      confirmed,
      shipped,
      delivered,
      cancelled,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      averageOrderValue: Number(averageOrderValue._avg.totalAmount || 0),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to get order stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get order stats' },
      { status: 500 }
    );
  }
}
