'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';
import {
  Package,
  Calendar,
  Truck,
  CreditCard,
  MapPin,
  ArrowLeft,
  AlertCircle,
  Phone,
} from 'lucide-react';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order';
import Link from 'next/link';
import Image from 'next/image';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // paramsを解決
  useEffect(() => {
    params.then(resolvedParams => {
      setOrderId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token && orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, token, orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      setIsOrderLoading(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('注文が見つかりません');
        }
        throw new Error('注文詳細の取得に失敗しました');
      }

      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error('注文詳細取得エラー:', error);
      setError(
        error instanceof Error ? error.message : '注文詳細の取得に失敗しました'
      );
    } finally {
      setIsOrderLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !orderId) return;

    if (
      !confirm(
        'この注文をキャンセルしますか？\nキャンセル後は元に戻すことができません。'
      )
    ) {
      return;
    }

    try {
      setIsCancelling(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '注文のキャンセルに失敗しました');
      }

      const data = await response.json();
      setOrder(data.order);
      alert('注文をキャンセルしました');
    } catch (error) {
      console.error('注文キャンセルエラー:', error);
      alert(
        error instanceof Error
          ? error.message
          : '注文のキャンセルに失敗しました'
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

  const canCancelOrder = (order: Order) => {
    return ['PENDING', 'CONFIRMED'].includes(order.status);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (isOrderLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">注文詳細を読み込み中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {error || '注文が見つかりません'}
              </h3>
              <div className="space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.push('/orders')}
                >
                  注文履歴に戻る
                </Button>
                <Button onClick={fetchOrder}>再試行</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href="/orders"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              注文履歴に戻る
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  注文詳細
                </h1>
                <p className="text-gray-600">注文番号: {order.orderNumber}</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    ORDER_STATUS_COLORS[order.status]
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-6">
              {/* 注文情報 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  注文情報
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">注文日時</span>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">注文番号</span>
                    <p className="font-medium">{order.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">ステータス</span>
                    <p className="font-medium">
                      {ORDER_STATUS_LABELS[order.status]}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">合計金額</span>
                    <p className="font-medium">
                      {formatPrice(order.totalAmount)}
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <span className="text-gray-600 text-sm">備考</span>
                    <p className="mt-1">{order.notes}</p>
                  </div>
                )}
              </div>

              {/* 注文商品 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  注文商品
                </h2>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={
                              item.product.images[0].alt || item.product.name
                            }
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">
                            数量: {item.quantity}
                          </span>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 注文サマリー */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  注文サマリー
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">商品合計</span>
                    <span>
                      {formatPrice(
                        order.totalAmount - order.shippingCost - order.taxAmount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">配送料</span>
                    <span>{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">消費税</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base border-t pt-3">
                    <span>合計</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* 配送先住所 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  配送先住所
                </h2>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{order.address.name}</p>
                  {order.address.company && (
                    <p className="text-gray-600">{order.address.company}</p>
                  )}
                  <p>〒{order.address.zipCode}</p>
                  <p>
                    {order.address.state} {order.address.city}
                  </p>
                  <p>{order.address.address1}</p>
                  {order.address.address2 && <p>{order.address.address2}</p>}
                  {order.address.phone && (
                    <p className="flex items-center mt-2">
                      <Phone className="h-4 w-4 mr-1" />
                      {order.address.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* アクション */}
              {canCancelOrder(order) && (
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    注文の管理
                  </h2>
                  <Button
                    variant="outline"
                    onClick={handleCancelOrder}
                    disabled={isCancelling}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    {isCancelling ? 'キャンセル中...' : '注文をキャンセル'}
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    注文確定前のみキャンセル可能です
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
