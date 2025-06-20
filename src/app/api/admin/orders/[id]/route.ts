import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
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

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        totalAmount: Number(order.totalAmount),
        shippingCost: Number(order.shippingCost),
        taxAmount: Number(order.taxAmount),
        items: order.items.map(item => ({
          ...item,
          price: Number(item.price),
        })),
      },
    });
  } catch (error) {
    console.error('Failed to get order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const { notes, status } = body;

    // 注文の存在確認
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // 注文更新
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        notes: notes !== undefined ? notes : undefined,
        status: status !== undefined ? status : undefined,
      },
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

    return NextResponse.json({
      success: true,
      order: {
        ...updatedOrder,
        totalAmount: Number(updatedOrder.totalAmount),
        shippingCost: Number(updatedOrder.shippingCost),
        taxAmount: Number(updatedOrder.taxAmount),
        items: updatedOrder.items.map(item => ({
          ...item,
          price: Number(item.price),
        })),
      },
    });
  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update order' },
      { status: 500 }
    );
  }
}
