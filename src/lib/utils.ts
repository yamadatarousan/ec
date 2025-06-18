import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwind CSSのクラス名を効率的にマージするユーティリティ関数
 * clsxとtailwind-mergeを組み合わせて、条件付きクラス名と競合解決を提供
 *
 * @param inputs - クラス名の配列または条件付きオブジェクト
 * @returns マージされたクラス名文字列
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 価格を日本円形式でフォーマットする関数
 *
 * @param price - フォーマットする価格（数値またはDecimal型）
 * @returns フォーマットされた価格文字列（例: "¥1,234"）
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(numPrice);
}

/**
 * 日付を相対時間でフォーマットする関数
 *
 * @param date - フォーマットする日付
 * @returns 相対時間文字列（例: "2日前"、"3時間前"）
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  } else if (diffInDays < 30) {
    return `${diffInDays}日前`;
  } else {
    return date.toLocaleDateString('ja-JP');
  }
}

/**
 * 文字列を指定した長さで切り詰める関数
 *
 * @param text - 切り詰める文字列
 * @param maxLength - 最大文字数
 * @returns 切り詰められた文字列
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
