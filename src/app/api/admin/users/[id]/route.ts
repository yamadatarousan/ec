import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    price: true,
                    images: {
                      take: 1,
                      orderBy: { order: 'asc' },
                    },
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          include: {
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
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        orders: user.orders.map(order => ({
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
            },
          })),
        })),
        // ウィッシュリスト機能は簡略化のため今回は省略
      },
    });
  } catch (error) {
    console.error('Failed to get user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { name, email, phone, isActive, emailVerified } = body;

    // ユーザーの存在確認
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // メールアドレスの重複チェック（自分以外）
    if (email && email !== existingUser.email) {
      const duplicateEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId },
        },
      });

      if (duplicateEmail) {
        return NextResponse.json(
          { success: false, error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // ユーザー更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name !== undefined ? name : undefined,
        email: email !== undefined ? email : undefined,
        // isActiveとemailVerifiedフィールドは今回は簡略化のため省略
      },
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
    });

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        orders: updatedUser.orders.map(order => ({
          ...order,
          totalAmount: Number(order.totalAmount),
        })),
      },
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
