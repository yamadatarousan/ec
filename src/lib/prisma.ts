import { PrismaClient } from '@prisma/client';

/**
 * グローバル型定義でPrismaClientを拡張
 * 開発環境でのホットリロード時の接続問題を回避
 */
declare global {
  // eslint-disable-next-line no-unused-vars
  var prisma: PrismaClient | undefined;
}

/**
 * Prismaクライアントのシングルトンインスタンス
 * 開発環境では既存のインスタンスを再利用し、
 * 本番環境では新しいインスタンスを作成
 */
const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
  globalThis.prisma = prisma;
}

export { prisma };
export default prisma;
