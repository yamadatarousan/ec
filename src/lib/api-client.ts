/**
 * 認証付きAPI呼び出しのためのクライアント
 */

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
 * JSON形式でAPIレスポンスを取得
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await authenticatedFetch(url, options, token);
  return response.json();
}

/**
 * GET リクエスト
 */
export async function apiGet<T = any>(url: string, token?: string): Promise<T> {
  return apiRequest<T>(url, { method: 'GET' }, token);
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
