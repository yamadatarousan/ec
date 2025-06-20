import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

// 国際化ミドルウェアを作成
const intlMiddleware = createIntlMiddleware({
  locales: ['ja', 'en'],
  defaultLocale: 'ja',
});

// レート制限用のメモリストア（本番環境ではRedisなどの外部ストアを使用）
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();

// レート制限設定
const RATE_LIMIT_CONFIG = {
  api: { requests: 100, window: 60 * 1000 }, // 1分間に100リクエスト
  auth: { requests: 5, window: 60 * 1000 }, // 1分間に5リクエスト
  admin: { requests: 50, window: 60 * 1000 }, // 1分間に50リクエスト
  default: { requests: 60, window: 60 * 1000 }, // 1分間に60リクエスト
};

// CSRFトークン検証が必要なパス
const CSRF_PROTECTED_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/cart',
  '/api/orders',
  '/api/admin',
];

// 管理者権限が必要なパス
const ADMIN_PROTECTED_PATHS = ['/admin', '/api/admin'];

/**
 * レート制限チェック
 */
function checkRateLimit(
  key: string,
  config: { requests: number; window: number }
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now - record.timestamp > config.window) {
    // 新しいウィンドウの開始
    rateLimitStore.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (record.count >= config.requests) {
    return false;
  }

  // カウントを増加
  rateLimitStore.set(key, {
    count: record.count + 1,
    timestamp: record.timestamp,
  });
  return true;
}

/**
 * レート制限のキーを生成
 */
function getRateLimitKey(request: NextRequest, prefix: string): string {
  const ip =
    (request as any).ip ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  return `${prefix}:${ip}`;
}

/**
 * レート制限設定を取得
 */
function getRateLimitConfig(pathname: string) {
  if (pathname.startsWith('/api/auth/')) {
    return { config: RATE_LIMIT_CONFIG.auth, prefix: 'auth' };
  }
  if (pathname.startsWith('/api/admin/')) {
    return { config: RATE_LIMIT_CONFIG.admin, prefix: 'admin' };
  }
  if (pathname.startsWith('/api/')) {
    return { config: RATE_LIMIT_CONFIG.api, prefix: 'api' };
  }
  return { config: RATE_LIMIT_CONFIG.default, prefix: 'default' };
}

/**
 * CSRFトークンを検証
 */
function verifyCSRFToken(request: NextRequest): boolean {
  const csrfToken = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies.get('csrf-token')?.value;

  if (!csrfToken || !csrfCookie) {
    return false;
  }

  return csrfToken === csrfCookie;
}

/**
 * 管理者権限を検証（簡易版 - Edge Runtime対応）
 */
async function verifyAdminAccess(request: NextRequest): Promise<boolean> {
  const token =
    request.cookies.get('auth-token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  // Edge Runtimeでは簡易チェックのみ
  // 実際の検証はAPI側で行う
  return !!token;
}

/**
 * セキュリティヘッダーを設定
 */
function setSecurityHeaders(response: NextResponse): NextResponse {
  // XSS対策
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // HSTS（本番環境のみ）
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://images.unsplash.com",
    "font-src 'self'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的ビルド時はミドルウェアをスキップ
  if (process.env.NODE_ENV === 'production' && !request.url) {
    return NextResponse.next();
  }

  // API routes はスキップして国際化処理を行わない
  if (pathname.startsWith('/api/')) {
    // レート制限チェック
    const { config, prefix } = getRateLimitConfig(pathname);
    const rateLimitKey = getRateLimitKey(request, prefix);

    if (!checkRateLimit(rateLimitKey, config)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }
  } else {
    // 国際化ミドルウェアを実行
    const intlResponse = intlMiddleware(request);
    if (intlResponse) {
      return intlResponse;
    }
  }

  // CSRF保護が必要なパスのチェック
  if (
    request.method !== 'GET' &&
    CSRF_PROTECTED_PATHS.some(path => pathname.startsWith(path))
  ) {
    if (!verifyCSRFToken(request)) {
      return new NextResponse(
        JSON.stringify({
          error: 'CSRF token verification failed',
          message: 'Invalid or missing CSRF token',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // 管理者権限チェック
  if (ADMIN_PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
    const hasAdminAccess = await verifyAdminAccess(request);
    if (!hasAdminAccess) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({
            error: 'Access denied',
            message: 'Admin privileges required',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      } else {
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }
    }
  }

  const response = NextResponse.next();

  // セキュリティヘッダーを設定
  return setSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sw.js (service worker)
     * - manifest.json (PWA manifest)
     */
    '/((?!_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)',
  ],
};
