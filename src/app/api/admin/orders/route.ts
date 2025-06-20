import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // パラメータ取得
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = (searchParams.get('status') as OrderStatus) || undefined;
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
        { orderNumber: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    if (status) {
      where.status = status;
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
    if (sortBy === 'orderNumber') {
      orderBy.orderNumber = sortOrder;
    } else if (sortBy === 'totalAmount') {
      orderBy.totalAmount = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // 注文取得
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // 数値型変換
    const ordersWithNumbers = orders.map(order => ({
      ...order,
      totalAmount: Number(order.totalAmount),
      shippingCost: Number(order.shippingCost),
      taxAmount: Number(order.taxAmount),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
      })),
    }));

    return NextResponse.json({
      success: true,
      orders: ordersWithNumbers,
      pagination: {
        page,
        limit,
        total: await prisma.order.count({ where }),
      },
    });
  } catch (error) {
    console.error('Failed to fetch admin orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
