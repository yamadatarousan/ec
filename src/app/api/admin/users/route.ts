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
    const verified = searchParams.get('verified') || '';
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
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.isActive = status === 'active';
    }

    if (verified) {
      where.emailVerified = verified === 'verified';
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
    if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else if (sortBy === 'email') {
      orderBy.email = sortOrder;
    } else if (sortBy === 'orders') {
      orderBy.orders = {
        _count: sortOrder,
      };
    } else {
      orderBy.createdAt = sortOrder;
    }

    // ユーザー取得
    const users = await prisma.user.findMany({
      where,
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
        orders: {
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // 数値型変換
    const usersWithNumbers = users.map(user => ({
      ...user,
      orders: user.orders.map(order => ({
        ...order,
        totalAmount: Number(order.totalAmount),
      })),
    }));

    return NextResponse.json({
      success: true,
      users: usersWithNumbers,
      pagination: {
        page,
        limit,
        total: await prisma.user.count({ where }),
      },
    });
  } catch (error) {
    console.error('Failed to fetch admin users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
