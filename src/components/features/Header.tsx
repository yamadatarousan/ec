'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Heart,
  LogOut,
  LogIn,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { SearchSuggestions } from './SearchSuggestions';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

/**
 * サイトヘッダーコンポーネント
 * Amazon風のレイアウトとデザインを採用
 * ロゴ、検索バー、ユーザーメニュー、カートアイコンを含む
 */
function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ユーザーメニューの外部クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * 検索フォーム送信ハンドラー
   */
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        // 検索結果ページに遷移
        router.push(
          `/products?search=${encodeURIComponent(searchQuery.trim())}` as any
        );
        setIsMenuOpen(false); // モバイルメニューを閉じる
        setShowSuggestions(false); // サジェストを閉じる
      }
    },
    [searchQuery, router]
  );

  /**
   * 検索入力変更ハンドラー
   */
  const handleSearchInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      setShowSuggestions(value.trim().length > 0);
    },
    []
  );

  /**
   * サジェスト選択ハンドラー
   */
  const handleSuggestionSelect = useCallback(
    (suggestion: string) => {
      setSearchQuery(suggestion);
      setShowSuggestions(false);
      router.push(`/products?search=${encodeURIComponent(suggestion)}` as any);
    },
    [router]
  );

  /**
   * ログアウト処理
   */
  const handleLogout = useCallback(() => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  }, [logout, router]);

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
          <div className="hidden md:flex flex-1 max-w-xl mx-6 relative">
            <form
              onSubmit={handleSearch}
              className="w-full flex rounded-md overflow-hidden shadow-sm"
            >
              <div className="flex-1 relative">
                <Input
                  type="search"
                  placeholder="商品を検索..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                  className="rounded-r-none border-r-0 focus:ring-0 focus:border-gray-300 h-9"
                />
                <SearchSuggestions
                  query={searchQuery}
                  isVisible={showSuggestions}
                  onClose={() => setShowSuggestions(false)}
                  onSelect={handleSuggestionSelect}
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
              href="/favorites"
              className="hidden sm:flex items-center space-x-1 hover:text-yellow-400 transition-colors px-2 py-1 rounded"
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm">お気に入り</span>
            </Link>

            {/* ユーザーアカウント */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 hover:text-yellow-400 transition-colors px-2 py-1 rounded"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:block text-sm">
                    {user?.name || 'アカウント'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.name || 'ユーザー'}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="inline h-4 w-4 mr-2" />
                        マイアカウント
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        📦 注文履歴
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        ログアウト
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center space-x-1 hover:text-yellow-400 transition-colors px-2 py-1 rounded"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:block text-sm">ログイン</span>
              </Link>
            )}

            {/* ショッピングカート */}
            <Link
              href="/cart"
              className="flex items-center space-x-1 hover:text-yellow-400 transition-colors px-2 py-1 rounded relative"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:block text-sm">カート</span>
              {/* カート内アイテム数バッジ */}
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-[1rem]">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* モバイル検索バー */}
        <div className="md:hidden pb-3 relative">
          <form
            onSubmit={handleSearch}
            className="flex rounded-md overflow-hidden shadow-sm"
          >
            <div className="flex-1 relative">
              <Input
                type="search"
                placeholder="商品を検索..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                className="rounded-r-none border-r-0 h-9"
              />
              <SearchSuggestions
                query={searchQuery}
                isVisible={showSuggestions}
                onClose={() => setShowSuggestions(false)}
                onSelect={handleSuggestionSelect}
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

// React.memoで最適化 - 認証状態とカート数の変更時のみ再レンダリング
const MemoizedHeader = React.memo(Header, (prevProps, nextProps) => {
  // propsが無いので、常にtrueを返して内部の状態変化に依存
  return false; // 内部状態（useAuth, useCart）に依存するため、毎回チェック
});

export { MemoizedHeader as Header };
