'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Heart } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

/**
 * サイトヘッダーコンポーネント
 * Amazon風のレイアウトとデザインを採用
 * ロゴ、検索バー、ユーザーメニュー、カートアイコンを含む
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 検索フォーム送信ハンドラー
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: 検索ページに遷移する処理を実装
      console.log('検索:', searchQuery);
    }
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg border-b border-gray-800">
      {/* メインヘッダー */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-14">
          {/* ロゴ */}
          <div className="flex items-center space-x-3">
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/"
              className="flex items-center space-x-2 hover:text-yellow-400 transition-colors"
            >
              <div className="bg-yellow-400 text-gray-900 px-2 py-1 rounded font-bold text-lg">
                EC
              </div>
              <span className="hidden sm:block text-lg font-semibold">
                ストア
              </span>
            </Link>
          </div>

          {/* 検索バー */}
          <div className="hidden md:flex flex-1 max-w-xl mx-6">
            <form
              onSubmit={handleSearch}
              className="w-full flex rounded-md overflow-hidden shadow-sm"
            >
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="商品を検索..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rounded-r-none border-r-0 focus:ring-0 focus:border-gray-300 h-9"
                />
              </div>
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 transition-colors flex items-center justify-center min-w-[2.5rem]"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-3">
            {/* お気に入り */}
            <Link
              href={'#' as any}
              className="hidden sm:flex items-center space-x-1 hover:text-yellow-400 transition-colors px-2 py-1 rounded"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm">お気に入り</span>
            </Link>

            {/* ユーザーアカウント */}
            <Link
              href={'#' as any}
              className="flex items-center space-x-1 hover:text-yellow-400 transition-colors px-2 py-1 rounded"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:block text-sm">アカウント</span>
            </Link>

            {/* ショッピングカート */}
            <Link
              href={'#' as any}
              className="flex items-center space-x-1 hover:text-yellow-400 transition-colors px-2 py-1 rounded relative"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:block text-sm">カート</span>
              {/* カート内アイテム数バッジ（仮） */}
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* モバイル検索バー */}
        <div className="md:hidden pb-3">
          <form
            onSubmit={handleSearch}
            className="flex rounded-md overflow-hidden shadow-sm"
          >
            <div className="flex-1">
              <Input
                type="search"
                placeholder="商品を検索..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0 h-9"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-3 transition-colors flex items-center justify-center min-w-[2.5rem]"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ナビゲーションメニュー */}
      <nav className="bg-gray-800 border-t border-gray-700">
        <div className="container-custom">
          <div
            className={cn(
              'md:flex md:space-x-6 md:py-2',
              isMenuOpen ? 'block py-3 space-y-1' : 'hidden md:block'
            )}
          >
            <Link
              href="/products"
              className="block md:inline-block px-2 py-1 md:py-2 text-sm hover:text-yellow-400 transition-colors rounded"
            >
              家電・PC
            </Link>
            <Link
              href="/products"
              className="block md:inline-block px-2 py-1 md:py-2 text-sm hover:text-yellow-400 transition-colors rounded"
            >
              ファッション
            </Link>
            <Link
              href="/products"
              className="block md:inline-block px-2 py-1 md:py-2 text-sm hover:text-yellow-400 transition-colors rounded"
            >
              本・雑誌
            </Link>
            <Link
              href="/products"
              className="block md:inline-block px-2 py-1 md:py-2 text-sm hover:text-yellow-400 transition-colors rounded"
            >
              ホーム・キッチン
            </Link>
            <Link
              href="/products"
              className="block md:inline-block px-2 py-1 md:py-2 text-sm hover:text-yellow-400 transition-colors rounded"
            >
              スポーツ・アウトドア
            </Link>
            <Link
              href="/products"
              className="block md:inline-block px-2 py-1 md:py-2 text-sm hover:text-yellow-400 transition-colors font-medium bg-yellow-400 text-gray-900 rounded"
            >
              タイムセール
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
