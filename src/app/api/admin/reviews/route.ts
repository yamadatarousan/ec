import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const rating = searchParams.get('rating') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder =
      (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const skip = (page - 1) * limit;

    // フィルター条件構築
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        {
          product: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
        {
          user: {
            name: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    if (status) {
      switch (status) {
        case 'pending':
          where.isApproved = false;
          where.isReported = false;
          break;
        case 'approved':
          where.isApproved = true;
          break;
        case 'reported':
          where.isReported = true;
          break;
      }
    }

    if (rating) {
      where.rating = parseInt(rating);
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // ソート条件構築
    const orderBy: any = {};
    if (sortBy === 'rating') {
      orderBy.rating = sortOrder;
    } else if (sortBy === 'helpful') {
      orderBy.helpfulCount = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // レビュー取得
    const reviews = await prisma.review.findMany({
      where,
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
      orderBy,
      skip,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total: await prisma.review.count({ where }),
      },
    });
  } catch (error) {
    console.error('Failed to fetch admin reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
