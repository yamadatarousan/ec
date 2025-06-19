import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import jwt from 'jsonwebtoken';

/**
 * 商品のレビュー一覧を取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // URLパラメータの取得
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const rating = searchParams.get('rating'); // 特定の評価でフィルター
    const sortBy = searchParams.get('sortBy') || 'createdAt'; // createdAt, rating, helpful
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 商品の存在確認
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // レビューの条件構築
    const where: any = {
      productId,
    };

    // 評価フィルター
    if (rating) {
      where.rating = parseInt(rating);
    }

    // ソート条件
    const orderBy: any = {};
    if (sortBy === 'helpful') {
      // 将来的にhelpfulCountフィールドを追加予定
      orderBy.createdAt = sortOrder;
    } else {
      orderBy[sortBy] = sortOrder;
    }

    // レビューの取得
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // 評価分布の計算
    const ratingDistribution = await prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: {
        rating: true,
      },
    });

    // 平均評価の計算
    const averageRating = await prisma.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      statistics: {
        averageRating: averageRating._avg.rating || 0,
        totalReviews: averageRating._count.rating,
        ratingDistribution: ratingDistribution.reduce(
          (acc, curr) => {
            acc[curr.rating] = curr._count.rating;
            return acc;
          },
          {} as Record<number, number>
        ),
      },
    });
  } catch (error) {
    console.error('レビュー取得エラー:', error);
    return NextResponse.json(
      { error: 'レビューの取得に失敗しました' },
      { status: 500 }
    );
  }
}

/**
 * 商品にレビューを投稿
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const token = getTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // JWTトークンの検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    const body = await request.json();
    const { rating, title, comment } = body;

    // バリデーション
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: '評価は1から5の間で入力してください' },
        { status: 400 }
      );
    }

    if (!comment || comment.trim().length < 10) {
      return NextResponse.json(
        { error: 'コメントは10文字以上で入力してください' },
        { status: 400 }
      );
    }

    // 商品の存在確認
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: '商品が見つかりません' },
        { status: 404 }
      );
    }

    // 既存レビューの確認（1商品につき1ユーザー1レビュー）
    const existingReview = await prisma.review.findFirst({
      where: {
        productId,
        userId: decoded.userId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'この商品には既にレビューを投稿済みです' },
        { status: 409 }
      );
    }

    // レビューの作成
    const review = await prisma.review.create({
      data: {
        productId,
        userId: decoded.userId,
        rating: parseInt(rating),
        title: title?.trim() || null,
        comment: comment.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'レビューを投稿しました',
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('レビュー投稿エラー:', error);
    return NextResponse.json(
      { error: 'レビューの投稿に失敗しました' },
      { status: 500 }
    );
  }
}
