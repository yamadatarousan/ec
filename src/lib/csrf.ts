import { randomBytes, createHash } from 'crypto';

/**
 * CSRFトークンを生成
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * CSRFトークンを検証
 */
export function verifyCSRFToken(token: string, secret: string): boolean {
  if (!token || !secret) {
    return false;
  }

  // シンプルな比較（本番環境では時間攻撃対策を考慮）
  return token === secret;
}

/**
 * セキュアなトークン比較（時間攻撃対策）
 */
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * CSRFトークンのハッシュ化
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
