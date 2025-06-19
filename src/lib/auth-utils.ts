import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  iat?: number;
  exp?: number;
}

/**
 * リクエストから認証トークンを取得・検証する
 */
export function getAuthPayload(request: NextRequest): AuthPayload | null {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * 認証エラーレスポンスを作成
 */
export function createAuthErrorResponse() {
  return {
    error: '認証が必要です',
    status: 401,
  };
}

/**
 * 無効なトークンエラーレスポンスを作成
 */
export function createInvalidTokenResponse() {
  return {
    error: '無効な認証トークンです',
    status: 401,
  };
}
