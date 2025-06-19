import { NextRequest, NextResponse } from 'next/server';
import { trackProductView } from '@/lib/services/recommendation';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await request.json();
    const { userId, sessionId } = body;

    // 商品閲覧を記録
    const result = await trackProductView(
      productId,
      userId || undefined,
      sessionId || undefined
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Failed to track product view' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Failed to track product view:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track product view' },
      { status: 500 }
    );
  }
}
