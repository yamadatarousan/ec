import { NextRequest, NextResponse } from 'next/server';
import {
  getCartItems,
  addToCart,
  getCartItemCount,
  clearCart,
} from '@/lib/services/cart';
import { getAuthPayload, createAuthErrorResponse } from '@/lib/auth-utils';

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

    const cartItems = await getCartItems(payload.userId);
    const itemCount = await getCartItemCount(payload.userId);

    return NextResponse.json({
      items: cartItems,
      itemCount,
    });
  } catch (error) {
    console.error('カート取得エラー:', error);
    return NextResponse.json(
      { error: 'カートの取得に失敗しました' },
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

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: '商品IDが必要です' }, { status: 400 });
    }

    const cartItem = await addToCart(payload.userId, productId, quantity);
    const itemCount = await getCartItemCount(payload.userId);

    return NextResponse.json({
      item: cartItem,
      itemCount,
      message: 'カートに追加しました',
    });
  } catch (error) {
    console.error('カート追加エラー:', error);
    return NextResponse.json(
      { error: 'カートへの追加に失敗しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    await clearCart(payload.userId);

    return NextResponse.json({
      message: 'カートをクリアしました',
      itemCount: 0,
    });
  } catch (error) {
    console.error('カートクリアエラー:', error);
    return NextResponse.json(
      { error: 'カートのクリアに失敗しました' },
      { status: 500 }
    );
  }
}
