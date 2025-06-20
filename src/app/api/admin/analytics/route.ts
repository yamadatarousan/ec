import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '30d';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // 期間設定
    let dateFilter: any = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        gte: new Date(startDate),
        lte: new Date(endDate + 'T23:59:59.999Z'),
      };
    } else {
      let daysAgo: number;
      switch (range) {
        case '7d':
          daysAgo = 7;
          break;
        case '90d':
          daysAgo = 90;
          break;
        case '1y':
          daysAgo = 365;
          break;
        default:
          daysAgo = 30;
      }

      const startPeriod = new Date(now);
      startPeriod.setDate(startPeriod.getDate() - daysAgo);

      dateFilter = {
        gte: startPeriod,
        lte: now,
      };
    }

    // 前期間との比較用
    const periodLength = dateFilter.lte.getTime() - dateFilter.gte.getTime();
    const previousPeriodStart = new Date(
      dateFilter.gte.getTime() - periodLength
    );
    const previousPeriodEnd = new Date(dateFilter.lte.getTime() - periodLength);

    // 並列でデータ取得
    const [
      currentOrders,
      previousOrders,
      currentCustomers,
      previousCustomers,
      salesTrend,
      topProducts,
      revenueByCategory,
      orderHistory,
    ] = await Promise.all([
      // 現在期間の注文
      prisma.order.findMany({
        where: {
          createdAt: dateFilter,
          status: 'DELIVERED',
        },
        include: {
          items: true,
        },
      }),

      // 前期間の注文
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
          status: 'DELIVERED',
        },
      }),

      // 現在期間の新規顧客
      prisma.user.count({
        where: {
          createdAt: dateFilter,
        },
      }),

      // 前期間の新規顧客
      prisma.user.count({
        where: {
          createdAt: {
            gte: previousPeriodStart,
            lte: previousPeriodEnd,
          },
        },
      }),

      // 日別売上トレンド
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          SUM(total_amount) as revenue,
          COUNT(*) as orders
        FROM "Order"
        WHERE created_at >= ${dateFilter.gte}
          AND created_at <= ${dateFilter.lte}
          AND status = 'DELIVERED'
        GROUP BY DATE(created_at)
        ORDER BY date
      `,

      // トップ商品
      prisma.$queryRaw`
        SELECT 
          p.id,
          p.name,
          SUM(oi.quantity * oi.price) as revenue,
          SUM(oi.quantity) as units,
          COUNT(DISTINCT o.id) as orders,
          COUNT(DISTINCT bh.user_id) as views
        FROM "Product" p
        JOIN "OrderItem" oi ON p.id = oi.product_id
        JOIN "Order" o ON oi.order_id = o.id
        LEFT JOIN "BrowsingHistory" bh ON p.id = bh.product_id
        WHERE o.created_at >= ${dateFilter.gte}
          AND o.created_at <= ${dateFilter.lte}
          AND o.status = 'DELIVERED'
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT 10
      `,

      // カテゴリー別売上
      prisma.$queryRaw`
        SELECT 
          c.name as category_name,
          SUM(oi.quantity * oi.price) as revenue,
          COUNT(DISTINCT o.id) as orders
        FROM "Category" c
        JOIN "Product" p ON c.id = p.category_id
        JOIN "OrderItem" oi ON p.id = oi.product_id
        JOIN "Order" o ON oi.order_id = o.id
        WHERE o.created_at >= ${dateFilter.gte}
          AND o.created_at <= ${dateFilter.lte}
          AND o.status = 'DELIVERED'
        GROUP BY c.id, c.name
        ORDER BY revenue DESC
      `,

      // 時間別アクセス用データ（注文ベース）
      prisma.order.findMany({
        where: {
          createdAt: dateFilter,
        },
        select: {
          createdAt: true,
          userId: true,
        },
      }),
    ]);

    // 主要指標計算
    const currentRevenue = currentOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const previousRevenue = previousOrders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const revenueGrowth =
      previousRevenue > 0
        ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    const orderGrowth =
      previousOrders.length > 0
        ? ((currentOrders.length - previousOrders.length) /
            previousOrders.length) *
          100
        : 0;
    const customerGrowth =
      previousCustomers > 0
        ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
        : 0;

    const averageOrderValue =
      currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0;

    // 時間別アクセス集計
    const hourlyData = new Array(24)
      .fill(0)
      .map((_, hour) => ({ hour, visitors: 0, orders: 0 }));

    orderHistory.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].visitors++;
    });

    currentOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyData[hour].orders++;
    });

    // 顧客セグメント分析
    const customerOrderCounts = (await prisma.$queryRaw`
      SELECT 
        u.id,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_spent
      FROM "User" u
      LEFT JOIN "Order" o ON u.id = o.user_id AND o.status = 'DELIVERED'
      GROUP BY u.id
    `) as Array<{
      id: string;
      order_count: bigint;
      total_spent: number | null;
    }>;

    const customerSegments = [
      {
        segment: '新規顧客（1回購入）',
        count: customerOrderCounts.filter(c => Number(c.order_count) === 1)
          .length,
        revenue: customerOrderCounts
          .filter(c => Number(c.order_count) === 1)
          .reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0),
        averageOrderValue: 0,
      },
      {
        segment: 'リピーター（2-5回購入）',
        count: customerOrderCounts.filter(
          c => Number(c.order_count) >= 2 && Number(c.order_count) <= 5
        ).length,
        revenue: customerOrderCounts
          .filter(c => Number(c.order_count) >= 2 && Number(c.order_count) <= 5)
          .reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0),
        averageOrderValue: 0,
      },
      {
        segment: 'VIP顧客（6回以上購入）',
        count: customerOrderCounts.filter(c => Number(c.order_count) >= 6)
          .length,
        revenue: customerOrderCounts
          .filter(c => Number(c.order_count) >= 6)
          .reduce((sum, c) => sum + (Number(c.total_spent) || 0), 0),
        averageOrderValue: 0,
      },
    ];

    // 平均注文額計算
    customerSegments.forEach(segment => {
      segment.averageOrderValue =
        segment.count > 0 ? segment.revenue / segment.count : 0;
    });

    // コンバージョン率計算（簡易版、注文ベース）
    const totalOrderAttempts = orderHistory.length;
    const conversionRate =
      totalOrderAttempts > 0
        ? (currentOrders.length / Math.max(totalOrderAttempts, 100)) * 100
        : 2.5;

    const analytics = {
      overview: {
        totalRevenue: currentRevenue,
        totalOrders: currentOrders.length,
        totalCustomers: currentCustomers,
        averageOrderValue,
        revenueGrowth,
        orderGrowth,
        customerGrowth,
        conversionRate,
      },
      salesTrend: (salesTrend as any[]).map(item => ({
        date: item.date,
        revenue: Number(item.revenue),
        orders: Number(item.orders),
      })),
      topProducts: (topProducts as any[]).map(product => ({
        id: product.id,
        name: product.name,
        revenue: Number(product.revenue),
        units: Number(product.units),
        conversionRate:
          Number(product.views) > 0
            ? (Number(product.orders) / Number(product.views)) * 100
            : 0,
      })),
      customerSegments,
      revenueByCategory: (revenueByCategory as any[]).map(category => ({
        categoryName: category.category_name,
        revenue: Number(category.revenue),
        orders: Number(category.orders),
      })),
      hourlyTraffic: hourlyData,
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
