import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const addresses = await prisma.address.findMany({
      where: { userId: payload.userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('住所取得エラー:', error);
    return NextResponse.json(
      { error: '住所の取得に失敗しました' },
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

    const body = await request.json();
    const {
      name,
      company,
      address1,
      address2,
      city,
      state,
      zipCode,
      country = 'JP',
      phone,
      isDefault = false,
    } = body;

    // 必須フィールドのバリデーション
    if (!name || !address1 || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: '必須項目が入力されていません' },
        { status: 400 }
      );
    }

    // デフォルト住所を設定する場合、他の住所のデフォルトを解除
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: payload.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: payload.userId,
        name,
        company,
        address1,
        address2,
        city,
        state,
        zipCode,
        country,
        phone,
        isDefault,
      },
    });

    return NextResponse.json({
      address,
      message: '住所を追加しました',
    });
  } catch (error) {
    console.error('住所追加エラー:', error);
    return NextResponse.json(
      { error: '住所の追加に失敗しました' },
      { status: 500 }
    );
  }
}
