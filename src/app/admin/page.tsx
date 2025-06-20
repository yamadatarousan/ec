'use client';

import React, { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import {
  TrendingUp,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Star,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  ordersGrowth: number;
  revenueGrowth: number;
  lowStockProducts: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  status: string;
  createdAt: string;
}

/**
 * 管理者ダッシュボードメインページ
 * システム全体の概要と主要な統計情報を表示
 */
export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // モックデータを使用（実際のAPIエンドポイントは後で実装）
      const mockStats: DashboardStats = {
        totalOrders: 1247,
        totalRevenue: 2845600,
        totalProducts: 156,
        totalUsers: 3421,
        ordersGrowth: 12.5,
        revenueGrowth: 8.3,
        lowStockProducts: 5,
        pendingOrders: 12,
      };

      const mockRecentOrders: RecentOrder[] = [
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          customerName: '田中太郎',
          amount: 25800,
          status: 'PENDING',
          createdAt: '2024-01-15T10:30:00Z',
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          customerName: '佐藤花子',
          amount: 15200,
          status: 'CONFIRMED',
          createdAt: '2024-01-15T09:15:00Z',
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          customerName: '鈴木一郎',
          amount: 8900,
          status: 'SHIPPED',
          createdAt: '2024-01-15T08:45:00Z',
        },
        {
          id: '4',
          orderNumber: 'ORD-2024-004',
          customerName: '山田美咲',
          amount: 32400,
          status: 'DELIVERED',
          createdAt: '2024-01-14T16:20:00Z',
        },
      ];

      setStats(mockStats);
      setRecentOrders(mockRecentOrders);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '処理待ち';
      case 'CONFIRMED':
        return '確認済み';
      case 'SHIPPED':
        return '発送済み';
      case 'DELIVERED':
        return '配送完了';
      case 'CANCELLED':
        return 'キャンセル';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-600">システム全体の概要と主要指標</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 総注文数 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">総注文数</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalOrders.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">
                  +{stats?.ordersGrowth}% 前月比
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 総売上 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">総売上</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(stats?.totalRevenue || 0)}
                </p>
                <p className="text-sm text-green-600">
                  +{stats?.revenueGrowth}% 前月比
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 商品数 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">総商品数</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalProducts}
                </p>
                <p className="text-sm text-orange-600">
                  在庫切れ: {stats?.lowStockProducts}件
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ユーザー数 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">
                  総ユーザー数
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-blue-600">
                  <TrendingUp className="inline h-4 w-4 mr-1" />
                  成長中
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* アラートセクション */}
      {(stats?.lowStockProducts || 0) > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <span className="text-orange-800 font-medium">
                {stats?.lowStockProducts}件の商品で在庫が不足しています
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近の注文 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">最近の注文</h3>
              <Badge variant="outline">{stats?.pendingOrders}件処理待ち</Badge>
            </div>
            <div className="space-y-4">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatPrice(order.amount)}
                    </p>
                    <Badge
                      variant="outline"
                      className={getStatusColor(order.status)}
                    >
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* クイックアクション */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              クイックアクション
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Package className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-900">商品を追加</h4>
                <p className="text-sm text-gray-600">新しい商品を登録</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Eye className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-900">注文を確認</h4>
                <p className="text-sm text-gray-600">処理待ち注文</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-900">ユーザー管理</h4>
                <p className="text-sm text-gray-600">ユーザー情報の管理</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <Star className="h-8 w-8 text-orange-600 mb-2" />
                <h4 className="font-medium text-gray-900">レビュー確認</h4>
                <p className="text-sm text-gray-600">新着レビューの確認</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
