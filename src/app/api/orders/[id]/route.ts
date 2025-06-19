import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, cancelOrder } from '@/lib/services/order';
import { getAuthPayload, createAuthErrorResponse } from '@/lib/auth-utils';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    // 認証チェック
    const payload = getAuthPayload(request);
    if (!payload) {
      const error = createAuthErrorResponse();
      return NextResponse.json(
        { error: error.error },
        { status: error.status }
      );
    }

    const { id } = await params;
    const order = await getOrderById(id, payload.userId);

    // Decimal型を数値に変換
    const serializedOrder = {
      ...order,
      totalAmount: Number(order.totalAmount),
      shippingCost: Number(order.shippingCost),
      taxAmount: Number(order.taxAmount),
      items: order.items.map(item => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
          comparePrice: item.product.comparePrice
            ? Number(item.product.comparePrice)
            : null,
          weight: item.product.weight ? Number(item.product.weight) : null,
        },
      })),
    };

    return NextResponse.json({ order: serializedOrder });
  } catch (error) {
    console.error('注文詳細取得エラー:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: '注文詳細の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    // 認証チェック
    const payload = getAuthPayload(request);
    if (!payload) {
      const error = createAuthErrorResponse();
      return NextResponse.json(
        { error: error.error },
        { status: error.status }
      );
    }

    const { id } = await params;
    const cancelledOrder = await cancelOrder(id, payload.userId);

    // Decimal型を数値に変換
    const serializedOrder = {
      ...cancelledOrder,
      totalAmount: Number(cancelledOrder.totalAmount),
      shippingCost: Number(cancelledOrder.shippingCost),
      taxAmount: Number(cancelledOrder.taxAmount),
    };

    return NextResponse.json({
      order: serializedOrder,
      message: '注文をキャンセルしました',
    });
  } catch (error) {
    console.error('注文キャンセルエラー:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: '注文のキャンセルに失敗しました' },
      { status: 500 }
    );
  }
}
