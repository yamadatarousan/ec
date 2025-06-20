'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { Card, CardContent, Button, Input } from '@/components/ui';

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    conversionRate: number;
  };
  salesTrend: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    units: number;
    conversionRate: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    averageOrderValue: number;
  }>;
  revenueByCategory: Array<{
    categoryName: string;
    revenue: number;
    orders: number;
  }>;
  hourlyTraffic: Array<{
    hour: number;
    visitors: number;
    orders: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, startDate, endDate]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        range: dateRange,
      });

      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);

      const response = await fetch(`/api/admin/analytics?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
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

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-600">分析データを読み込めませんでした</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          再試行
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            分析ダッシュボード
          </h1>
          <p className="text-gray-600">売上・顧客・商品の詳細分析</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            レポート出力
          </Button>
        </div>
      </div>

      {/* 期間選択 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">期間:</span>
            </div>

            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map(range => (
                <Button
                  key={range}
                  variant={dateRange === range ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setDateRange(range)}
                >
                  {range === '7d' && '7日'}
                  {range === '30d' && '30日'}
                  {range === '90d' && '90日'}
                  {range === '1y' && '1年'}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-auto"
              />
              <span className="text-gray-500">〜</span>
              <Input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要指標 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">総売上</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(analytics.overview.totalRevenue)}
                </p>
              </div>
              <div className="flex items-center text-sm">
                {analytics.overview.revenueGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={
                    analytics.overview.revenueGrowth >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {formatPercent(Math.abs(analytics.overview.revenueGrowth))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">注文数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalOrders.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center text-sm">
                {analytics.overview.orderGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={
                    analytics.overview.orderGrowth >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {formatPercent(Math.abs(analytics.overview.orderGrowth))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">顧客数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.overview.totalCustomers.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center text-sm">
                {analytics.overview.customerGrowth >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={
                    analytics.overview.customerGrowth >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }
                >
                  {formatPercent(Math.abs(analytics.overview.customerGrowth))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均注文額</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(analytics.overview.averageOrderValue)}
                </p>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600">
                  CV率: {formatPercent(analytics.overview.conversionRate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 売上トレンド */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">売上トレンド</h3>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-gray-600">日別推移</span>
            </div>
          </div>

          <div className="space-y-4">
            {analytics.salesTrend.slice(-7).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium w-20">
                    {new Date(item.date).toLocaleDateString('ja-JP', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (item.revenue / Math.max(...analytics.salesTrend.map(d => d.revenue))) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {formatPrice(item.revenue)}
                  </div>
                  <div className="text-xs text-gray-500">{item.orders}件</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* トップ商品 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">トップ商品</h3>
              <PieChart className="h-5 w-5 text-green-500" />
            </div>

            <div className="space-y-4">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-500 w-6">
                      #{index + 1}
                    </span>
                    <div>
                      <div className="text-sm font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        {product.units}個販売 • CV率{' '}
                        {formatPercent(product.conversionRate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatPrice(product.revenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* カテゴリー別売上 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">カテゴリー別売上</h3>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>

            <div className="space-y-4">
              {analytics.revenueByCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <div>
                      <div className="text-sm font-medium">
                        {category.categoryName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {category.orders}件の注文
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatPrice(category.revenue)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 顧客セグメント */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">顧客セグメント</h3>
              <Users className="h-5 w-5 text-orange-500" />
            </div>

            <div className="space-y-4">
              {analytics.customerSegments.map((segment, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {segment.segment}
                    </span>
                    <span className="text-sm text-gray-500">
                      {segment.count}人
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      売上: {formatPrice(segment.revenue)}
                    </span>
                    <span className="text-gray-600">
                      平均注文額: {formatPrice(segment.averageOrderValue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 時間別アクセス */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">時間別アクセス</h3>
              <Eye className="h-5 w-5 text-teal-500" />
            </div>

            <div className="grid grid-cols-6 gap-2">
              {analytics.hourlyTraffic.map(hour => (
                <div key={hour.hour} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">
                    {hour.hour}:00
                  </div>
                  <div
                    className="bg-teal-500 rounded mx-auto mb-1"
                    style={{
                      height: `${Math.max(4, (hour.visitors / Math.max(...analytics.hourlyTraffic.map(h => h.visitors))) * 40)}px`,
                      width: '8px',
                    }}
                  ></div>
                  <div className="text-xs text-gray-600">{hour.visitors}</div>
                  <div className="text-xs text-gray-400">{hour.orders}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
