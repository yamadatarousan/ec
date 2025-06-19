'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Minus,
  Edit3,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';
import { InventoryAlert } from '@/lib/services/inventory';

interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockItems: number;
  alertCount: number;
}

interface StockUpdateModal {
  isOpen: boolean;
  productId: string | null;
  productName: string;
  currentStock: number;
}

/**
 * 在庫管理ページ
 * 在庫アラート、統計、在庫調整機能を提供
 */
export default function InventoryPage() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'low_stock' | 'out_of_stock'
  >('all');

  // ストック更新モーダル
  const [updateModal, setUpdateModal] = useState<StockUpdateModal>({
    isOpen: false,
    productId: null,
    productName: '',
    currentStock: 0,
  });
  const [stockAdjustment, setStockAdjustment] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);

      const [statsResponse, alertsResponse] = await Promise.all([
        fetch('/api/admin/inventory?type=stats'),
        fetch('/api/admin/inventory?type=alerts'),
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data);
      }
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openUpdateModal = (alert: InventoryAlert) => {
    setUpdateModal({
      isOpen: true,
      productId: alert.productId,
      productName: alert.product.name,
      currentStock: alert.currentStock,
    });
    setStockAdjustment('');
    setAdjustmentReason('');
  };

  const closeUpdateModal = () => {
    setUpdateModal({
      isOpen: false,
      productId: null,
      productName: '',
      currentStock: 0,
    });
  };

  const handleStockUpdate = async () => {
    if (!updateModal.productId || !stockAdjustment || !adjustmentReason) {
      return;
    }

    try {
      setUpdating(true);

      const response = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'update',
          productId: updateModal.productId,
          adjustment: parseInt(stockAdjustment),
          reason: adjustmentReason,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // データを再取得
        await fetchInventoryData();
        closeUpdateModal();
      } else {
        alert(`更新に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('Failed to update stock:', error);
      alert('在庫更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.product.sku.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'low_stock' && alert.alertType === 'LOW_STOCK') ||
      (filterType === 'out_of_stock' && alert.alertType === 'OUT_OF_STOCK');

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">在庫管理</h1>
          <p className="text-gray-600">在庫状況の監視と調整</p>
        </div>
        <Button onClick={fetchInventoryData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          更新
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">総商品数</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalProducts.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">在庫少</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.lowStockCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">在庫切れ</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.outOfStockCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">総在庫数</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalStockItems.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルターとサーチ */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="商品名またはSKUで検索..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'primary' : 'outline'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                すべて
              </Button>
              <Button
                variant={filterType === 'low_stock' ? 'primary' : 'outline'}
                onClick={() => setFilterType('low_stock')}
                size="sm"
              >
                在庫少
              </Button>
              <Button
                variant={filterType === 'out_of_stock' ? 'primary' : 'outline'}
                onClick={() => setFilterType('out_of_stock')}
                size="sm"
              >
                在庫切れ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* アラート一覧 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">在庫アラート</h3>
            <Badge variant="outline">{filteredAlerts.length}件</Badge>
          </div>

          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600">該当するアラートはありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        alert.alertType === 'OUT_OF_STOCK'
                          ? 'bg-red-100'
                          : 'bg-yellow-100'
                      }`}
                    >
                      <AlertTriangle
                        className={`h-5 w-5 ${
                          alert.alertType === 'OUT_OF_STOCK'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {alert.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        SKU: {alert.product.sku} | カテゴリ:{' '}
                        {alert.product.category.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        現在の在庫: {alert.currentStock}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          alert.alertType === 'OUT_OF_STOCK'
                            ? 'text-red-600 border-red-200'
                            : 'text-yellow-600 border-yellow-200'
                        }
                      >
                        {alert.alertType === 'OUT_OF_STOCK'
                          ? '在庫切れ'
                          : '在庫少'}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => openUpdateModal(alert)}
                      size="sm"
                      variant="outline"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      調整
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 在庫更新モーダル */}
      {updateModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                在庫調整: {updateModal.productName}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    現在の在庫: {updateModal.currentStock}
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    調整数量（正の数で追加、負の数で減算）
                  </label>
                  <Input
                    type="number"
                    value={stockAdjustment}
                    onChange={e => setStockAdjustment(e.target.value)}
                    placeholder="例: +50 または -10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    調整理由
                  </label>
                  <Input
                    value={adjustmentReason}
                    onChange={e => setAdjustmentReason(e.target.value)}
                    placeholder="例: 新規仕入れ、破損、棚卸し調整"
                  />
                </div>

                {stockAdjustment && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      調整後の在庫:{' '}
                      {updateModal.currentStock +
                        parseInt(stockAdjustment || '0')}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={closeUpdateModal}>
                  キャンセル
                </Button>
                <Button
                  onClick={handleStockUpdate}
                  disabled={!stockAdjustment || !adjustmentReason || updating}
                >
                  {updating ? '更新中...' : '更新'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
