'use client';

import React from 'react';
import Link from 'next/link';
import { Wifi, RefreshCw, Home, Search, ShoppingCart } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

/**
 * オフラインページ
 * Service Workerによってネットワーク接続がない時に表示される
 */
export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          {/* オフラインアイコン */}
          <div className="mb-6">
            <Wifi className="w-16 h-16 mx-auto text-gray-400" />
          </div>

          {/* メッセージ */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            オフラインです
          </h1>

          <p className="text-gray-600 mb-6">
            インターネット接続を確認して、もう一度お試しください。
            一部のコンテンツはオフラインでもご利用いただけます。
          </p>

          {/* アクション */}
          <div className="space-y-4">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              再読み込み
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <Home className="w-4 h-4 mr-2" />
                  ホーム
                </Button>
              </Link>

              <Link href="/products">
                <Button variant="outline" className="w-full">
                  <Search className="w-4 h-4 mr-2" />
                  商品
                </Button>
              </Link>
            </div>
          </div>

          {/* オフライン時の利用可能機能 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              オフライン時でも利用可能
            </h3>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                閲覧済みの商品情報
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                カート内容の確認
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                お気に入りリスト
              </div>
            </div>
          </div>

          {/* 接続状態表示 */}
          <div className="mt-6">
            <div id="connection-status" className="text-sm">
              <span className="inline-flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                オフライン
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ページ内のスクリプト */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          // 接続状態の監視
          function updateConnectionStatus() {
            const statusElement = document.getElementById('connection-status');
            if (statusElement) {
              if (navigator.onLine) {
                statusElement.innerHTML = '<span class="inline-flex items-center"><div class="w-2 h-2 bg-green-500 rounded-full mr-2"></div>オンライン</span>';
              } else {
                statusElement.innerHTML = '<span class="inline-flex items-center"><div class="w-2 h-2 bg-red-500 rounded-full mr-2"></div>オフライン</span>';
              }
            }
          }

          // イベントリスナーの設定
          window.addEventListener('online', updateConnectionStatus);
          window.addEventListener('offline', updateConnectionStatus);
          
          // 初期状態の更新
          updateConnectionStatus();
          
          // 接続が回復したら自動で再読み込み
          window.addEventListener('online', () => {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          });
        `,
        }}
      />
    </div>
  );
}
