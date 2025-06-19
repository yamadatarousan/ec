import React from 'react';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * 管理者レイアウトコンポーネント
 * 管理者認証チェックとレイアウト構造を提供
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 lg:ml-64">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
