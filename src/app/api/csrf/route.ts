import { NextRequest, NextResponse } from 'next/server';
import { generateCSRFToken } from '@/lib/csrf';

/**
 * CSRFトークンを生成して返す
 */
export async function GET(request: NextRequest) {
  try {
    const csrfToken = generateCSRFToken();

    const response = NextResponse.json({
      csrfToken,
      message: 'CSRF token generated successfully',
    });

    // CSRFトークンをHttpOnlyクッキーに設定
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24時間
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
