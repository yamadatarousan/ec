'use client';

import React, { useState } from 'react';
import {
  Mail,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Download,
  Eye,
  Plus,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs' | 'stats'>(
    'templates'
  );

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">メール管理</h1>
          <p className="text-gray-600">
            メールテンプレート、送信履歴、統計の管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            レポート出力
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規テンプレート
          </Button>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'templates', label: 'テンプレート', icon: Mail },
            { key: 'logs', label: '送信履歴', icon: Clock },
            { key: 'stats', label: '統計', icon: BarChart3 },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* テンプレート管理 */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: '注文確認メール',
                type: '注文確認',
                subject: 'ご注文ありがとうございます',
                active: true,
              },
              {
                name: '発送通知メール',
                type: '発送通知',
                subject: '商品を発送いたしました',
                active: true,
              },
              {
                name: 'ウェルカムメール',
                type: 'ウェルカム',
                subject: '会員登録ありがとうございます',
                active: true,
              },
              {
                name: 'パスワードリセット',
                type: 'パスワードリセット',
                subject: 'パスワードリセットのご案内',
                active: true,
              },
              {
                name: '在庫アラート',
                type: '在庫アラート',
                subject: '在庫不足のお知らせ',
                active: false,
              },
            ].map((template, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-500">{template.type}</p>
                    </div>
                    <div className="flex items-center">
                      {template.active ? (
                        <Badge className="bg-green-100 text-green-800">
                          アクティブ
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          非アクティブ
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">件名:</p>
                    <p className="text-sm font-medium text-gray-900">
                      {template.subject}
                    </p>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    更新日: 2025年6月20日
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      {template.active ? '無効化' : '有効化'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      プレビュー
                    </Button>
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      テスト
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 送信履歴 */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* フィルター */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="メールアドレス、件名で検索..."
                    className="pl-10"
                  />
                </div>

                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">すべてのステータス</option>
                  <option value="SENT">送信済み</option>
                  <option value="FAILED">失敗</option>
                  <option value="PENDING">送信中</option>
                </select>

                <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">すべてのタイプ</option>
                  <option value="ORDER_CONFIRMATION">注文確認</option>
                  <option value="SHIPPING_NOTIFICATION">発送通知</option>
                  <option value="WELCOME">ウェルカム</option>
                  <option value="PASSWORD_RESET">パスワードリセット</option>
                  <option value="INVENTORY_ALERT">在庫アラート</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* メール履歴一覧 */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        宛先
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        件名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        タイプ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ステータス
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        送信日時
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      {
                        to: 'user1@example.com',
                        subject: 'ご注文ありがとうございます',
                        type: '注文確認',
                        status: 'SENT',
                        time: '2025/06/20 14:30',
                      },
                      {
                        to: 'user2@example.com',
                        subject: '商品を発送いたしました',
                        type: '発送通知',
                        status: 'SENT',
                        time: '2025/06/20 13:45',
                      },
                      {
                        to: 'user3@example.com',
                        subject: '会員登録ありがとうございます',
                        type: 'ウェルカム',
                        status: 'FAILED',
                        time: '2025/06/20 12:15',
                      },
                      {
                        to: 'user4@example.com',
                        subject: 'ご注文ありがとうございます',
                        type: '注文確認',
                        status: 'PENDING',
                        time: '2025/06/20 11:30',
                      },
                      {
                        to: 'admin@example.com',
                        subject: '在庫不足のお知らせ',
                        type: '在庫アラート',
                        status: 'SENT',
                        time: '2025/06/20 10:00',
                      },
                    ].map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.to}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.subject}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.type}
                        </td>
                        <td className="px-6 py-4">
                          {log.status === 'SENT' && (
                            <Badge className="bg-green-100 text-green-800">
                              送信済み
                            </Badge>
                          )}
                          {log.status === 'FAILED' && (
                            <Badge className="bg-red-100 text-red-800">
                              失敗
                            </Badge>
                          )}
                          {log.status === 'PENDING' && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              送信中
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {log.time}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 統計 */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* 統計カード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Send className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      総送信数
                    </p>
                    <p className="text-2xl font-bold text-gray-900">15,247</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">配信率</p>
                    <p className="text-2xl font-bold text-gray-900">98.5%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">開封率</p>
                    <p className="text-2xl font-bold text-gray-900">24.3%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">失敗数</p>
                    <p className="text-2xl font-bold text-gray-900">234</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <Mail className="h-8 w-8 text-indigo-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      今日の送信数
                    </p>
                    <p className="text-2xl font-bold text-gray-900">127</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-teal-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">
                      今週の送信数
                    </p>
                    <p className="text-2xl font-bold text-gray-900">892</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* パフォーマンス詳細 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                メール配信パフォーマンス
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">98.5%</div>
                  <div className="text-sm text-gray-600">配信成功率</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: '98.5%' }}
                    ></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">24.3%</div>
                  <div className="text-sm text-gray-600">開封率</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: '24.3%' }}
                    ></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">5.7%</div>
                  <div className="text-sm text-gray-600">クリック率</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: '5.7%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
