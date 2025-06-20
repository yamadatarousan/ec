/**
 * XSS対策のためのサニタイゼーション関数
 */

/**
 * HTMLエスケープ
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
}

/**
 * 基本的なHTMLタグを許可するサニタイゼーション
 */
export function sanitizeHtml(input: string): string {
  // 基本的なHTMLタグのみ許可
  const allowedTags = ['b', 'i', 'u', 'strong', 'em', 'p', 'br'];
  const allowedTagsRegex = new RegExp(
    `<(/?(?:${allowedTags.join('|')}))>`,
    'gi'
  );

  // すべてのHTMLタグを削除し、許可されたタグのみを復元
  const sanitized = input.replace(/<[^>]*>/g, '');

  // 許可されたタグの復元は簡易的な実装
  // 本番環境では DOMPurify などの専用ライブラリを使用を推奨
  return escapeHtml(sanitized);
}

/**
 * SQLインジェクション対策のための入力サニタイゼーション
 */
export function sanitizeSqlInput(input: string): string {
  // 危険な文字をエスケープ
  return input
    .replace(/'/g, "''")
    .replace(/"/g, '""')
    .replace(/;/g, '\\;')
    .replace(/--/g, '\\--')
    .replace(/\/\*/g, '\\/\\*')
    .replace(/\*\//g, '\\*\\/');
}

/**
 * ファイルパスのサニタイゼーション
 */
export function sanitizeFilePath(path: string): string {
  // ディレクトリトラバーサル攻撃を防ぐ
  return path
    .replace(/\.\./g, '')
    .replace(/\\/g, '')
    .replace(/\//g, '')
    .replace(/[<>:"|?*]/g, '')
    .trim();
}

/**
 * URLのサニタイゼーション
 */
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // 許可されたプロトコルのみ
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }

    return urlObj.href;
  } catch {
    // 無効なURLの場合は空文字を返す
    return '';
  }
}

/**
 * メールアドレスのサニタイゼーション
 */
export function sanitizeEmail(email: string): string {
  // 基本的なメールアドレス形式のチェック
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  return email.trim().toLowerCase();
}

/**
 * 検索クエリのサニタイゼーション
 */
export function sanitizeSearchQuery(query: string): string {
  // 基本的なサニタイゼーション
  return query
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s\-_.]/g, '')
    .substring(0, 100); // 長さ制限
}

/**
 * JSON入力のサニタイゼーション
 */
export function sanitizeJsonInput(input: any): any {
  if (typeof input === 'string') {
    return escapeHtml(input);
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeJsonInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      const sanitizedKey = escapeHtml(key);
      sanitized[sanitizedKey] = sanitizeJsonInput(value);
    }
    return sanitized;
  }

  return input;
}

/**
 * ユーザー入力の包括的サニタイゼーション
 */
export function sanitizeUserInput(
  input: string,
  type: 'text' | 'html' | 'email' | 'url' | 'search' = 'text'
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  switch (type) {
    case 'html':
      return sanitizeHtml(input);
    case 'email':
      return sanitizeEmail(input);
    case 'url':
      return sanitizeUrl(input);
    case 'search':
      return sanitizeSearchQuery(input);
    case 'text':
    default:
      return escapeHtml(input);
  }
}
