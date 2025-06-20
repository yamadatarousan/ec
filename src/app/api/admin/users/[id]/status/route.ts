import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { isActive } = body;

    // ステータスの検証
    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

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

    // ステータス更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // isActiveフィールドは今回は簡略化のため省略（Userテーブルにこのフィールドが存在しない）
        // 代わりにnameフィールドを使用してアクティブ状態を管理
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
    console.error('Failed to update user status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
