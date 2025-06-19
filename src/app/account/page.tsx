'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react';

export default function AccountPage() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email,
      });
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // キャンセル時は元の値に戻す
      setEditForm({
        name: user?.name || '',
        email: user?.email || '',
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      alert('プロフィールの更新に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    マイアカウント
                  </h1>
                  <p className="text-gray-600">アカウント情報を管理できます</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleEditToggle}
                className="flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    <span>キャンセル</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    <span>編集</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* アカウント情報 */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              基本情報
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 名前 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline h-4 w-4 mr-1" />
                  名前
                </label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={e =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    placeholder="名前を入力"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {user.name || '未設定'}
                  </p>
                )}
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  メールアドレス
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={e =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="メールアドレスを入力"
                  />
                ) : (
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {user.email}
                  </p>
                )}
              </div>

              {/* ロール */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield className="inline h-4 w-4 mr-1" />
                  アカウント種別
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {user.role === 'ADMIN' ? '管理者' : '一般ユーザー'}
                </p>
              </div>

              {/* 作成日 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  登録日
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('ja-JP')
                    : '不明'}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? '保存中...' : '保存'}</span>
                </Button>
              </div>
            )}
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              クイックアクション
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => router.push('/orders')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-2xl">📦</span>
                <span>注文履歴</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/favorites')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-2xl">❤️</span>
                <span>お気に入り</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/cart')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-2xl">🛒</span>
                <span>カート</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/account')}
                className="h-20 flex flex-col items-center justify-center space-y-2"
              >
                <span className="text-2xl">⚙️</span>
                <span>設定</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
