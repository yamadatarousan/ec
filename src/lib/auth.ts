import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { JWTPayload, AuthUser } from '@/types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * パスワードをハッシュ化
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * パスワードを検証
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * JWTトークンを生成
 */
export function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>
): string {
  return jwt.sign(payload as Record<string, any>, JWT_SECRET as string, {
    expiresIn: '7d',
  });
}

/**
 * JWTトークンを検証
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * AuthorizationヘッダーからJWTトークンを取得
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Userオブジェクトから公開可能な情報のみを抽出
 */
export function sanitizeUser(user: any): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

/**
 * パスワードの強度をチェック
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('パスワードは8文字以上である必要があります');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('パスワードには大文字を含める必要があります');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('パスワードには小文字を含める必要があります');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('パスワードには数字を含める必要があります');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * メールアドレスの形式をチェック
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * NextRequestからJWTトークンを取得
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  return extractTokenFromHeader(authHeader);
}
