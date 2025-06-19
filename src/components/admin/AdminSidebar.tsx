'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  FileText,
  Inbox,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navigation: NavItem[] = [
  { name: 'ダッシュボード', href: '/admin', icon: Home },
  { name: '商品管理', href: '/admin/products', icon: Package },
  { name: '注文管理', href: '/admin/orders', icon: ShoppingCart, badge: '12' },
  { name: 'ユーザー管理', href: '/admin/users', icon: Users },
  { name: 'レビュー管理', href: '/admin/reviews', icon: FileText },
  { name: '在庫管理', href: '/admin/inventory', icon: Inbox },
  { name: 'メール管理', href: '/admin/emails', icon: Mail },
  { name: '分析・レポート', href: '/admin/analytics', icon: BarChart3 },
  { name: '設定', href: '/admin/settings', icon: Settings },
];

/**
 * 管理者サイドバーコンポーネント
 * 管理者画面のナビゲーションメニュー
 */
export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:top-16 lg:bg-white lg:border-r lg:border-gray-200">
      <div className="flex-1 flex flex-col min-h-0 pt-6 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href as any}
                className={cn(
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors'
                )}
              >
                <Icon
                  className={cn(
                    isActive ? 'text-blue-500' : 'text-gray-400',
                    'mr-3 h-5 w-5 flex-shrink-0'
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span
                    className={cn(
                      isActive
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-gray-100 text-gray-600',
                      'ml-3 inline-block py-0.5 px-2 text-xs font-medium rounded-full'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* フッター情報 */}
        <div className="px-2 py-4">
          <div className="text-xs text-gray-500">
            <div className="font-medium">ECサイト管理</div>
            <div>Version 1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
