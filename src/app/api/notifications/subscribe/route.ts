import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload } from '@/lib/auth-utils';

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const subscription: PushSubscription = await request.json();

    if (
      !subscription.endpoint ||
      !subscription.keys?.p256dh ||
      !subscription.keys?.auth
    ) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    // 認証情報を取得（オプショナル - 未ログインユーザーも許可）
    const authPayload = getAuthPayload(request);
    const userId = authPayload?.userId;

    // セッションIDを生成（未ログインユーザー用）
    const sessionId =
      request.headers.get('x-session-id') ||
      `session_${Math.random().toString(36).substr(2, 9)}`;

    // 既存の登録を確認
    const existingSubscription = await prisma.pushSubscription.findFirst({
      where: {
        endpoint: subscription.endpoint,
      },
    });

    if (existingSubscription) {
      // 既存の登録を更新
      await prisma.pushSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          userId,
          sessionId: userId ? null : sessionId,
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          updatedAt: new Date(),
        },
      });
    } else {
      // 新規登録
      await prisma.pushSubscription.create({
        data: {
          endpoint: subscription.endpoint,
          p256dhKey: subscription.keys.p256dh,
          authKey: subscription.keys.auth,
          userId,
          sessionId: userId ? null : sessionId,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription successful',
    });
  } catch (error) {
    console.error('Failed to save push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription removed',
    });
  } catch (error) {
    console.error('Failed to remove push subscription:', error);
    return NextResponse.json(
      { error: 'Failed to remove subscription' },
      { status: 500 }
    );
  }
}
