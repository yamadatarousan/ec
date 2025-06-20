import { NextRequest, NextResponse } from 'next/server';
import { sendInventoryAlerts } from '@/lib/services/inventory';

export async function POST(request: NextRequest) {
  try {
    // 管理者メールアドレス（環境変数から取得可能に）
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [
      'admin@example.com',
    ];

    const result = await sendInventoryAlerts(adminEmails);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to send inventory alerts:', error);
    return NextResponse.json(
      {
        success: false,
        sentCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      { status: 500 }
    );
  }
}
