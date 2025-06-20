import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      total,
      active,
      inactive,
      verified,
      unverified,
      newThisMonth,
      totalOrders,
      totalRevenue,
    ] = await Promise.all([
      // 総ユーザー数
      prisma.user.count(),

      // アクティブユーザー数
      prisma.user.count({
        where: { id: { not: undefined } }, // isActiveフィールドがないため、全てのユーザーを対象
      }),

      // 非アクティブユーザー数
      prisma.user.count({
        where: { id: { equals: null } }, // isActiveフィールドがないため、0とする
      }),

      // メール認証済みユーザー数
      prisma.user.count({
        where: { email: { not: null } }, // emailVerifiedフィールドがないため、emailがあるユーザーを対象
      }),

      // メール未認証ユーザー数
      prisma.user.count({
        where: { id: { equals: null } }, // emailVerifiedフィールドがないため、0とする
      }),

      // 今月の新規ユーザー数
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),

      // 総注文数
      prisma.order.count(),

      // 総売上（配達完了分のみ）
      prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const stats = {
      total,
      active,
      inactive,
      verified,
      unverified,
      newThisMonth,
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to get user stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user stats' },
      { status: 500 }
    );
  }
}
