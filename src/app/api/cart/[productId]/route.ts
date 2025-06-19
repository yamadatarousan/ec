import { NextRequest, NextResponse } from 'next/server';
import {
  updateCartItemQuantity,
  removeFromCart,
  getCartItemCount,
} from '@/lib/services/cart';
import { getAuthPayload, createAuthErrorResponse } from '@/lib/auth-utils';

interface Params {
  params: Promise<{ productId: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
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

    const { productId } = await params;
    const { quantity } = await request.json();

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: '有効な数量を指定してください' },
        { status: 400 }
      );
    }

    const cartItem = await updateCartItemQuantity(
      payload.userId,
      productId,
      quantity
    );
    const itemCount = await getCartItemCount(payload.userId);

    return NextResponse.json({
      item: cartItem,
      itemCount,
      message: 'カートを更新しました',
    });
  } catch (error) {
    console.error('カート更新エラー:', error);
    return NextResponse.json(
      { error: 'カートの更新に失敗しました' },
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

    const { productId } = await params;

    await removeFromCart(payload.userId, productId);
    const itemCount = await getCartItemCount(payload.userId);

    return NextResponse.json({
      itemCount,
      message: 'カートから削除しました',
    });
  } catch (error) {
    console.error('カート削除エラー:', error);
    return NextResponse.json(
      { error: 'カートからの削除に失敗しました' },
      { status: 500 }
    );
  }
}
