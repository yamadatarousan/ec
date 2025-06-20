import { NextRequest, NextResponse } from 'next/server';
import { createOrder, getUserOrders } from '@/lib/services/order';
import { getAuthPayload, createAuthErrorResponse } from '@/lib/auth-utils';
import { CreateOrderRequest } from '@/types/order';
import { sendOrderConfirmationEmail } from '@/lib/services/email';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    const orders = await getUserOrders(payload.userId);

    // Decimal型を数値に変換
    const serializedOrders = orders.map(order => ({
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
    }));

    return NextResponse.json({ orders: serializedOrders });
  } catch (error) {
    console.error('注文履歴取得エラー:', error);
    return NextResponse.json(
      { error: '注文履歴の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body: CreateOrderRequest = await request.json();
    const { addressId, notes } = body;

    if (!addressId) {
      return NextResponse.json(
        { error: '配送先住所を指定してください' },
        { status: 400 }
      );
    }

    const order = await createOrder(payload.userId, addressId, notes);

    // 注文確認メールを送信
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { name: true, email: true },
      });

      const orderDetails = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: {
                select: { name: true },
              },
            },
          },
          // shippingAddressフィールドは今回は簡略化のため省略
        },
      });

      if (user && orderDetails) {
        await sendOrderConfirmationEmail(user.email, {
          orderNumber: order.orderNumber,
          customerName: user.name,
          customerEmail: user.email,
          items: orderDetails.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
          totalAmount: Number(order.totalAmount),
          shippingCost: Number(order.shippingCost),
          taxAmount: Number(order.taxAmount),
          shippingAddress: {
            name: user.name,
            address1: '住所1',
            address2: '住所2',
            city: '都市',
            state: '都道府県',
            zipCode: '123-4567',
          },
          orderDate: order.createdAt,
        });
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // メール送信失敗は注文処理の失敗にしない
    }

    // Decimal型を数値に変換
    const serializedOrder = {
      ...order,
      totalAmount: Number(order.totalAmount),
      shippingCost: Number(order.shippingCost),
      taxAmount: Number(order.taxAmount),
    };

    return NextResponse.json({
      order: serializedOrder,
      message: '注文を受け付けました',
    });
  } catch (error) {
    console.error('注文作成エラー:', error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: '注文の作成に失敗しました' },
      { status: 500 }
    );
  }
}
