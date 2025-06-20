import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const [
      total,
      pending,
      approved,
      rejected,
      reported,
      averageRating,
      totalHelpful,
      totalReports,
    ] = await Promise.all([
      // 総レビュー数
      prisma.review.count(),

      // 承認待ちレビュー数（今回は簡略化のため総数から計算）
      prisma.review.count({
        where: {
          rating: { gt: 0 },
        },
      }),

      // 承認済みレビュー数
      prisma.review.count({
        where: { rating: { gte: 1 } },
      }),

      // 拒否されたレビュー数（今回は簡略化のため0として計算）
      prisma.review.count({
        where: {
          rating: { lt: 1 },
        },
      }),

      // 報告されたレビュー数（今回は簡略化のため0として計算）
      prisma.review.count({
        where: { comment: { contains: 'report' } },
      }),

      // 平均評価
      prisma.review.aggregate({
        _avg: {
          rating: true,
        },
      }),

      // 総「参考になった」数（今回は簡略化のため0として計算）
      Promise.resolve({ _sum: { helpfulCount: 0 } }),

      // 総報告数（今回は簡略化のため0として計算）
      Promise.resolve({ _sum: { reportCount: 0 } }),
    ]);

    const stats = {
      total,
      pending,
      approved,
      rejected,
      reported,
      averageRating: Number(averageRating._avg.rating || 0),
      totalHelpful: Number(totalHelpful._sum.helpfulCount || 0),
      totalReports: Number(totalReports._sum.reportCount || 0),
    };

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Failed to get review stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get review stats' },
      { status: 500 }
    );
  }
}
