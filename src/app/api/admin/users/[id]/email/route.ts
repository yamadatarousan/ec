import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/services/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { type } = body;

    // タイプの検証
    if (!type || !['welcome'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email type' },
        { status: 400 }
      );
    }

    // ユーザーの取得
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // メール送信
    try {
      if (type === 'welcome') {
        await sendWelcomeEmail(user.email, {
          customerName: user.name,
          customerEmail: user.email,
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
