import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { JWTPayload, AuthUser } from '@/types/auth';
import { createHash, randomBytes } from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

// トークンブラックリスト（本番環境ではRedisなどを使用）
const tokenBlacklist = new Set<string>();

// リフレッシュトークンストア（本番環境ではデータベースを使用）
const refreshTokenStore = new Map<
  string,
  { userId: string; expiresAt: number }
>();

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
 * JWTトークンを生成（強化版）
 */
export function generateToken(
  payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>
): string {
  // JTI（JWT ID）を追加してトークンを一意に識別
  const jti = randomBytes(16).toString('hex');

  const enhancedPayload = {
    ...payload,
    jti,
    iss: 'ec-site', // issuer
    aud: 'ec-users', // audience
  };

  return jwt.sign(
    enhancedPayload as Record<string, any>,
    JWT_SECRET as string,
    {
      expiresIn: '15m', // アクセストークンの有効期限を短縮
      algorithm: 'HS256',
    }
  );
}

/**
 * リフレッシュトークンを生成
 */
export function generateRefreshToken(userId: string): string {
  const refreshToken = randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7日後

  // リフレッシュトークンを保存
  refreshTokenStore.set(refreshToken, { userId, expiresAt });

  return refreshToken;
}

/**
 * リフレッシュトークンを検証
 */
export function verifyRefreshToken(refreshToken: string): string | null {
  const tokenData = refreshTokenStore.get(refreshToken);

  if (!tokenData || tokenData.expiresAt < Date.now()) {
    // 期限切れまたは無効なトークンは削除
    refreshTokenStore.delete(refreshToken);
    return null;
  }

  return tokenData.userId;
}

/**
 * JWTトークンを検証（強化版）
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    // ブラックリストチェック
    if (tokenBlacklist.has(token)) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET as string, {
      issuer: 'ec-site',
      audience: 'ec-users',
      algorithms: ['HS256'],
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * トークンをブラックリストに追加（ログアウト時に使用）
 */
export function blacklistToken(token: string): void {
  tokenBlacklist.add(token);

  // 定期的にブラックリストをクリーンアップ（期限切れトークンを削除）
  setTimeout(
    () => {
      try {
        const decoded = jwt.decode(token) as any;
        if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
          tokenBlacklist.delete(token);
        }
      } catch {
        // デコードに失敗した場合は削除
        tokenBlacklist.delete(token);
      }
    },
    60 * 60 * 1000
  ); // 1時間後にクリーンアップチェック
}

/**
 * リフレッシュトークンを無効化
 */
export function revokeRefreshToken(refreshToken: string): void {
  refreshTokenStore.delete(refreshToken);
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
  // Authorizationヘッダーから取得を試行
  const authHeader = request.headers.get('authorization');
  const headerToken = extractTokenFromHeader(authHeader);

  if (headerToken) {
    return headerToken;
  }

  // クッキーからも取得を試行
  const cookieToken = request.cookies.get('auth-token')?.value;
  return cookieToken || null;
}

/**
 * セキュリティ監査ログ
 */
export function logSecurityEvent(event: {
  type:
    | 'login'
    | 'logout'
    | 'token_refresh'
    | 'invalid_token'
    | 'rate_limit'
    | 'admin_access';
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: any;
}): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event,
  };

  // 本番環境では外部ログサービスに送信
  console.log('Security Event:', JSON.stringify(logEntry));
}

/**
 * 管理者権限の厳格な検証
 */
export function verifyAdminPermissions(
  token: string,
  requiredPermissions: string[] = []
): { isAdmin: boolean; permissions: string[] } {
  const payload = verifyToken(token);

  if (!payload || payload.role !== 'ADMIN') {
    return { isAdmin: false, permissions: [] };
  }

  // 管理者の権限リスト（実際のプロジェクトではデータベースから取得）
  const adminPermissions = (payload as any).permissions || [
    'user_management',
    'product_management',
    'order_management',
    'analytics_view',
    'system_settings',
  ];

  // 必要な権限がすべて含まれているかチェック
  const hasRequiredPermissions = requiredPermissions.every(permission =>
    adminPermissions.includes(permission)
  );

  return {
    isAdmin: hasRequiredPermissions,
    permissions: adminPermissions,
  };
}

/**
 * IPアドレス制限チェック
 */
export function checkIpRestriction(
  ip: string,
  allowedIps: string[] = []
): boolean {
  if (allowedIps.length === 0) {
    return true; // 制限なし
  }

  return allowedIps.includes(ip);
}

/**
 * デバイスフィンガープリント生成
 */
export function generateDeviceFingerprint(request: NextRequest): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';

  const fingerprint = createHash('sha256')
    .update(userAgent + acceptLanguage + acceptEncoding)
    .digest('hex');

  return fingerprint;
}
