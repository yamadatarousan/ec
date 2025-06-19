'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ユーザー登録ページコンポーネント
 */
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  /**
   * フォーム送信処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // パスワード確認
    if (formData.password !== formData.confirmPassword) {
      setError('パスワードが一致しません');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name || undefined,
        email: formData.email,
        password: formData.password,
      });
      router.push('/'); // 登録成功後はホームへリダイレクト
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'ユーザー登録に失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 入力値変更処理
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* ヘッダー */}
        <div className="flex items-center justify-center mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ホームに戻る</span>
            </Button>
          </Link>
        </div>

        <div className="text-center">
          <Link href="/" className="flex items-center justify-center space-x-2">
            <div className="bg-orange-400 text-gray-900 px-3 py-2 rounded text-xl font-bold">
              EC
            </div>
            <span className="text-xl font-semibold text-gray-900">ストア</span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            新規アカウント作成
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            既にアカウントをお持ちの方は{' '}
            <Link
              href="/auth/login"
              className="font-medium text-orange-600 hover:text-orange-500"
            >
              ログイン
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 名前 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お名前（任意）
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="田中 太郎"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* メールアドレス */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* パスワード */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="8文字以上の英数字"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  大文字・小文字・数字を含む8文字以上で設定してください
                </p>
              </div>

              {/* パスワード確認 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード確認 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    placeholder="パスワードを再入力"
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* 利用規約 */}
              <div className="text-sm text-gray-600">
                アカウントを作成することで、
                <Link
                  href="/terms"
                  className="text-orange-600 hover:text-orange-500"
                >
                  利用規約
                </Link>
                および
                <Link
                  href="/privacy"
                  className="text-orange-600 hover:text-orange-500"
                >
                  プライバシーポリシー
                </Link>
                に同意したものとみなされます。
              </div>

              {/* 登録ボタン */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3"
              >
                {isLoading ? '登録中...' : 'アカウントを作成'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
