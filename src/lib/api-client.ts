/**
 * 認証付きAPI呼び出しのためのクライアント
 * キャッシュ機能付き
 */

import { cache, apiCache } from './cache';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 認証付きのAPI呼び出しを行う
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 認証エラーの場合、ログインページにリダイレクト
  if (response.status === 401) {
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth/login') {
      window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
    }
    throw new ApiError('認証が必要です', 401, response);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP error! status: ${response.status}`,
      response.status,
      response
    );
  }

  return response;
}

/**
 * JSON形式でAPIレスポンスを取得（キャッシュ機能付き）
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  token?: string,
  cacheOptions?: {
    useCache?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
  }
): Promise<T> {
  const {
    useCache = false,
    cacheKey,
    cacheTTL = 5 * 60 * 1000,
  } = cacheOptions || {};

  // GETリクエストでキャッシュが有効な場合、キャッシュをチェック
  if (useCache && (!options.method || options.method === 'GET') && cacheKey) {
    const cached = cache.get<T>(cacheKey);
    if (cached !== null) {
      return cached;
    }
  }

  const response = await authenticatedFetch(url, options, token);
  const data = await response.json();

  // GETリクエストでキャッシュが有効な場合、レスポンスをキャッシュ
  if (useCache && (!options.method || options.method === 'GET') && cacheKey) {
    cache.set(cacheKey, data, { ttl: cacheTTL });
  }

  return data;
}

/**
 * GET リクエスト（キャッシュ機能付き）
 */
export async function apiGet<T = any>(
  url: string,
  token?: string,
  cacheOptions?: {
    useCache?: boolean;
    cacheKey?: string;
    cacheTTL?: number;
  }
): Promise<T> {
  return apiRequest<T>(url, { method: 'GET' }, token, cacheOptions);
}

/**
 * POST リクエスト
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  token?: string
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    },
    token
  );
}

/**
 * PUT リクエスト
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  token?: string
): Promise<T> {
  return apiRequest<T>(
    url,
    {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    },
    token
  );
}

/**
 * DELETE リクエスト
 */
export async function apiDelete<T = any>(
  url: string,
  token?: string
): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE' }, token);
}
