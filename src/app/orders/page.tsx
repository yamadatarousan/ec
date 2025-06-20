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
  ChevronRight,
} from 'lucide-react';
import { Order, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order';
import Link from 'next/link';
import Image from 'next/image';

export default function OrdersPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    try {
      setIsOrdersLoading(true);
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('注文履歴の取得に失敗しました');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('注文履歴取得エラー:', error);
      setError('注文履歴の取得に失敗しました');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">注文履歴</h1>
            <p className="text-gray-600">
              これまでのご注文をご確認いただけます
            </p>
          </div>

          {/* ローディング状態 */}
          {isOrdersLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">注文履歴を読み込み中...</p>
            </div>
          ) : error ? (
            /* エラー状態 */
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                エラーが発生しました
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchOrders}>再試行</Button>
            </div>
          ) : orders.length === 0 ? (
            /* 注文履歴なし */
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                注文履歴がありません
              </h3>
              <p className="text-gray-600 mb-4">
                まだご注文がございません。商品をカートに追加してご注文ください。
              </p>
              <Button onClick={() => router.push('/products')}>
                商品を見る
              </Button>
            </div>
          ) : (
            /* 注文履歴一覧 */
            <div className="space-y-6">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden"
                >
                  {/* 注文ヘッダー */}
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            注文番号: {order.orderNumber}
                          </h3>
                          <div className="flex items-center text-sm text-gray-600 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            ORDER_STATUS_COLORS[order.status]
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                        >
                          詳細を見る
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* 注文内容 */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* 商品一覧 */}
                      <div className="lg:col-span-2">
                        <h4 className="font-medium text-gray-900 mb-3">
                          注文商品
                        </h4>
                        <div className="space-y-3">
                          {order.items.slice(0, 3).map(item => (
                            <div
                              key={item.id}
                              className="flex items-center space-x-3"
                            >
                              <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                {item.product.images[0] && (
                                  <Image
                                    src={item.product.images[0].url}
                                    alt={
                                      item.product.images[0].alt ||
                                      item.product.name
                                    }
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  数量: {item.quantity} ×{' '}
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-gray-600">
                              他 {order.items.length - 3} 点
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 注文サマリー */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          注文合計
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">商品合計</span>
                            <span>
                              {formatPrice(
                                order.totalAmount -
                                  order.shippingCost -
                                  order.taxAmount
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
                          <div className="flex justify-between font-semibold text-base border-t pt-2">
                            <span>合計</span>
                            <span>{formatPrice(order.totalAmount)}</span>
                          </div>
                        </div>

                        {/* 配送先 */}
                        <div className="mt-4 pt-4 border-t">
                          <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            配送先
                          </h5>
                          <div className="text-sm text-gray-600">
                            <p>{order.address.name}</p>
                            <p>
                              〒{order.address.zipCode} {order.address.state}{' '}
                              {order.address.city}
                            </p>
                            <p>{order.address.address1}</p>
                            {order.address.address2 && (
                              <p>{order.address.address2}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
