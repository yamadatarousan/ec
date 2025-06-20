import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;

    // レビューの存在確認
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // 報告ステータス更新
    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        // 報告機能は今回は簡略化
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            images: {
              take: 1,
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      review: updatedReview,
    });
  } catch (error) {
    console.error('Failed to report review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to report review' },
      { status: 500 }
    );
  }
}
