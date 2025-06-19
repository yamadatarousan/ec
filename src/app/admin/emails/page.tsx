'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  CheckCircle,
  AlertTriangle,
  Users,
  Package,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';

interface EmailStats {
  connected: boolean;
  lastCheck: Date;
}

interface TestEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * メール管理ページ
 * メール設定の確認、テスト送信、統計表示を提供
 */
export default function EmailsPage() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<TestEmailResult | null>(null);

  useEffect(() => {
    checkEmailConnection();
  }, []);

  const checkEmailConnection = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/emails/verify');
      const result = await response.json();

      setStats({
        connected: result.connected,
        lastCheck: new Date(),
      });
    } catch (error) {
      console.error('Failed to check email connection:', error);
      setStats({
        connected: false,
        lastCheck: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) return;

    try {
      setSending(true);
      setTestResult(null);

      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'welcome',
          to: testEmail,
          data: {
            customerName: 'テストユーザー',
            customerEmail: testEmail,
          },
        }),
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Failed to send test email:', error);
      setTestResult({
        success: false,
        error: 'テストメールの送信に失敗しました',
      });
    } finally {
      setSending(false);
    }
  };

  const sendInventoryAlerts = async () => {
    try {
      setSending(true);
      
      const response = await fetch('/api/admin/inventory/alerts', {
        method: 'POST',
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`在庫アラートメールを${result.sentCount}件送信しました`);
      } else {
        alert(`在庫アラートメールの送信に失敗しました: ${result.errors?.join(', ')}`);
      }
    } catch (error) {
      console.error('Failed to send inventory alerts:', error);
      alert('在庫アラートメールの送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">メール管理</h1>
          <p className="text-gray-600">メール設定とテスト送信</p>
        </div>
        <Button onClick={checkEmailConnection} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          接続確認
        </Button>
      </div>

      {/* 接続ステータス */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div
                className={`p-2 rounded-lg ${
                  stats?.connected ? 'bg-green-100' : 'bg-red-100'
                }`}
              >
                {stats?.connected ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  メールサービス
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.connected ? '接続済み' : '未接続'}
                </p>
                <p className="text-xs text-gray-500">
                  最終確認: {stats?.lastCheck.toLocaleString('ja-JP')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  設定状況
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {process.env.NODE_ENV === 'development' ? '開発モード' : '本番モード'}
                </p>
                <p className="text-xs text-gray-500">
                  SMTP設定: {process.env.SMTP_HOST || 'Ethereal（テスト用）'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* テストメール送信 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            テストメール送信
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                送信先メールアドレス
              </label>
              <Input
                type="email"
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="max-w-md"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={sendTestEmail}
                disabled={!testEmail || sending || !stats?.connected}
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? '送信中...' : 'ウェルカムメール送信'}
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg ${
                  testResult.success
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <div className="flex items-center">
                  {testResult.success ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  <span className="text-sm">
                    {testResult.success
                      ? `テストメールを送信しました${testResult.messageId ? ` (ID: ${testResult.messageId})` : ''}`
                      : `送信失敗: ${testResult.error}`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 自動メール送信 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            自動メール送信
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Package className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">在庫アラート</h4>
                  <p className="text-sm text-gray-600">
                    在庫が少ない商品について管理者にメール通知
                  </p>
                </div>
              </div>
              <Button
                onClick={sendInventoryAlerts}
                disabled={sending || !stats?.connected}
                variant="outline"
                size="sm"
              >
                <Send className="h-4 w-4 mr-1" />
                送信
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">注文確認メール</h4>
                  <p className="text-sm text-gray-600">
                    注文完了時に顧客に自動送信される
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                自動送信中
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">ウェルカムメール</h4>
                  <p className="text-sm text-gray-600">
                    ユーザー登録時に新規ユーザーに自動送信される
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                自動送信中
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 設定ガイド */}
      {!stats?.connected && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              メール設定ガイド
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>メール機能を有効にするには、以下の環境変数を設定してください：</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code className="bg-gray-100 px-1 rounded">SMTP_HOST</code> - SMTPサーバーのホスト名</li>
                <li><code className="bg-gray-100 px-1 rounded">SMTP_PORT</code> - SMTPポート（通常587）</li>
                <li><code className="bg-gray-100 px-1 rounded">SMTP_USER</code> - SMTP認証ユーザー名</li>
                <li><code className="bg-gray-100 px-1 rounded">SMTP_PASS</code> - SMTP認証パスワード</li>
                <li><code className="bg-gray-100 px-1 rounded">FROM_EMAIL</code> - 送信者メールアドレス</li>
              </ul>
              <p className="text-yellow-600">
                開発環境では設定がない場合、Etherealテストサーバーが使用されます。
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}