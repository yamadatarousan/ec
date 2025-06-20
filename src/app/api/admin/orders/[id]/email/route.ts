import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmationEmail } from '@/lib/services/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { type } = body;

    // タイプの検証
    if (!type || !['confirmation', 'shipping'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email type' },
        { status: 400 }
      );
    }

    // 注文の取得
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        address: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                images: {
                  take: 1,
                  orderBy: { order: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // メール送信
    try {
      if (type === 'confirmation') {
        await sendOrderConfirmationEmail(order.user.email, {
          customerName: order.user.name,
          customerEmail: order.user.email,
          orderNumber: order.orderNumber,
          orderDate: order.createdAt,
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
          shippingCost: Number(order.shippingCost),
          taxAmount: Number(order.taxAmount),
          totalAmount: Number(order.totalAmount),
          shippingAddress: order.address || {
            name: order.user.name,
            address1: '',
            city: '',
            state: '',
            zipCode: '',
          },
        });
      } else if (type === 'shipping') {
        // 発送通知メール（簡易実装）
        await sendOrderConfirmationEmail(order.user.email, {
          customerName: order.user.name,
          customerEmail: order.user.email,
          orderNumber: order.orderNumber,
          orderDate: order.createdAt,
          items: order.items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.price),
          })),
          shippingCost: Number(order.shippingCost),
          taxAmount: Number(order.taxAmount),
          totalAmount: Number(order.totalAmount),
          shippingAddress: order.address || {
            name: order.user.name,
            address1: '',
            city: '',
            state: '',
            zipCode: '',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Failed to process email request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process email request' },
      { status: 500 }
    );
  }
}
