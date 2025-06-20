import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailConnection } from '@/lib/services/email';

export async function GET(request: NextRequest) {
  try {
    const isConnected = await verifyEmailConnection();

    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected
        ? 'Email service is connected and ready'
        : 'Email service connection failed',
    });
  } catch (error) {
    console.error('Failed to verify email connection:', error);
    return NextResponse.json(
      {
        success: false,
        connected: false,
        error: 'Failed to verify email connection',
      },
      { status: 500 }
    );
  }
}
