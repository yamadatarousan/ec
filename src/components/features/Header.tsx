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
    <header className="bg-gray-900 text-white shadow-md">
      {/* メインヘッダー */}
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <div className="flex items-center space-x-4">
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded font-bold text-xl">
                EC
              </div>
              <span className="hidden sm:block text-xl font-semibold text-white">
                ストア
              </span>
            </Link>
          </div>

          {/* 検索バー */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="w-full flex">
              <div className="flex-1">
                <Input
                  type="search"
                  placeholder="商品を検索..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rounded-r-none border-r-0 focus:ring-0 focus:border-gray-300"
                />
              </div>
              <button
                type="submit"
                className="rounded-l-none bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            {/* お気に入り */}
            <Link
              href="/favorites"
              className="hidden sm:flex items-center space-x-1 hover:text-yellow-400 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span className="text-sm">お気に入り</span>
            </Link>

            {/* ユーザーアカウント */}
            <Link
              href="/account"
              className="flex items-center space-x-1 hover:text-yellow-400 transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:block text-sm">アカウント</span>
            </Link>

            {/* ショッピングカート */}
            <Link
              href="/cart"
              className="flex items-center space-x-1 hover:text-yellow-400 transition-colors relative"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="hidden sm:block text-sm">カート</span>
              {/* カート内アイテム数バッジ（仮） */}
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* モバイル検索バー */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="flex">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="商品を検索..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0"
              />
            </div>
            <button
              type="submit"
              className="rounded-l-none bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-4 py-2 transition-colors"
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
              'md:flex md:space-x-8 md:py-2',
              isMenuOpen ? 'block py-4 space-y-2' : 'hidden md:block'
            )}
          >
            <Link
              href="/categories/electronics"
              className="block px-3 py-2 text-sm hover:text-yellow-400 transition-colors"
            >
              家電・PC
            </Link>
            <Link
              href="/categories/fashion"
              className="block px-3 py-2 text-sm hover:text-yellow-400 transition-colors"
            >
              ファッション
            </Link>
            <Link
              href="/categories/books"
              className="block px-3 py-2 text-sm hover:text-yellow-400 transition-colors"
            >
              本・雑誌
            </Link>
            <Link
              href="/categories/home"
              className="block px-3 py-2 text-sm hover:text-yellow-400 transition-colors"
            >
              ホーム・キッチン
            </Link>
            <Link
              href="/categories/sports"
              className="block px-3 py-2 text-sm hover:text-yellow-400 transition-colors"
            >
              スポーツ・アウトドア
            </Link>
            <Link
              href="/deals"
              className="block px-3 py-2 text-sm hover:text-yellow-400 transition-colors font-medium"
            >
              タイムセール
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
