'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

/**
 * 管理者認証ガードコンポーネント
 * 管理者権限のチェックとリダイレクト処理
 */
export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // 未ログインの場合は管理者ログインページにリダイレクト
      router.replace('/admin/login');
      return;
    }

    if (user.role !== 'ADMIN') {
      // 管理者権限がない場合はホームページにリダイレクト
      router.replace('/');
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};
