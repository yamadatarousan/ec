'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';
import {
  CreditCard,
  MapPin,
  Package,
  Plus,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { Address } from '@/types/order';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const { items, total, itemCount, refreshCart } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchAddresses();
      refreshCart();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    // カートが空の場合はカートページにリダイレクト
    if (!isLoading && isAuthenticated && itemCount === 0) {
      router.push('/cart');
    }
  }, [isLoading, isAuthenticated, itemCount, router]);

  const fetchAddresses = async () => {
    try {
      setIsAddressLoading(true);
      const response = await fetch('/api/addresses', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses);

        // デフォルト住所を自動選択
        const defaultAddress = data.addresses.find(
          (addr: Address) => addr.isDefault
        );
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        } else if (data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        }
      }
    } catch (error) {
      console.error('住所取得エラー:', error);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(prev => [data.address, ...prev]);
        setSelectedAddressId(data.address.id);
        setShowAddressForm(false);
        setNewAddress({
          name: '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          isDefault: false,
        });
      } else {
        const data = await response.json();
        alert(data.error || '住所の追加に失敗しました');
      }
    } catch (error) {
      console.error('住所追加エラー:', error);
      alert('住所の追加に失敗しました');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('配送先住所を選択してください');
      return;
    }

    try {
      setIsPlacingOrder(true);
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          addressId: selectedAddressId,
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('注文を受け付けました！');
        router.push(`/orders/${data.order.id}`);
      } else {
        const data = await response.json();
        alert(data.error || '注文の作成に失敗しました');
      }
    } catch (error) {
      console.error('注文作成エラー:', error);
      alert('注文の作成に失敗しました');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const calculateShipping = () => {
    return total >= 10000 ? 0 : 500;
  };

  const calculateTax = () => {
    return Math.floor(total * 0.1);
  };

  const calculateTotal = () => {
    return total + calculateShipping() + calculateTax();
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

  if (itemCount === 0) {
    return null; // リダイレクト処理中
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="max-w-6xl mx-auto">
          {/* ヘッダー */}
          <div className="mb-8">
            <Link
              href="/cart"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              カートに戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">注文内容の確認</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-6">
              {/* 配送先住所 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    配送先住所
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    新しい住所
                  </Button>
                </div>

                {isAddressLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">
                      住所が登録されていません
                    </p>
                    <Button onClick={() => setShowAddressForm(true)}>
                      住所を追加
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(address => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="font-medium">
                                {address.name}
                              </span>
                              {address.isDefault && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  デフォルト
                                </span>
                              )}
                            </div>
                            {address.company && (
                              <p className="text-sm text-gray-600 mb-1">
                                {address.company}
                              </p>
                            )}
                            <p className="text-sm text-gray-600">
                              〒{address.zipCode} {address.state} {address.city}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.address1}
                            </p>
                            {address.address2 && (
                              <p className="text-sm text-gray-600">
                                {address.address2}
                              </p>
                            )}
                            {address.phone && (
                              <p className="text-sm text-gray-600 mt-1">
                                TEL: {address.phone}
                              </p>
                            )}
                          </div>
                          {selectedAddressId === address.id && (
                            <Check className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 住所追加フォーム */}
                {showAddressForm && (
                  <div className="mt-6 border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">
                      新しい住所を追加
                    </h3>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            お名前 *
                          </label>
                          <Input
                            type="text"
                            value={newAddress.name}
                            onChange={e =>
                              setNewAddress({
                                ...newAddress,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            会社名
                          </label>
                          <Input
                            type="text"
                            value={newAddress.company}
                            onChange={e =>
                              setNewAddress({
                                ...newAddress,
                                company: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            郵便番号 *
                          </label>
                          <Input
                            type="text"
                            value={newAddress.zipCode}
                            onChange={e =>
                              setNewAddress({
                                ...newAddress,
                                zipCode: e.target.value,
                              })
                            }
                            placeholder="123-4567"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            都道府県 *
                          </label>
                          <Input
                            type="text"
                            value={newAddress.state}
                            onChange={e =>
                              setNewAddress({
                                ...newAddress,
                                state: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            市区町村 *
                          </label>
                          <Input
                            type="text"
                            value={newAddress.city}
                            onChange={e =>
                              setNewAddress({
                                ...newAddress,
                                city: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          住所1 *
                        </label>
                        <Input
                          type="text"
                          value={newAddress.address1}
                          onChange={e =>
                            setNewAddress({
                              ...newAddress,
                              address1: e.target.value,
                            })
                          }
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          住所2（建物名・部屋番号など）
                        </label>
                        <Input
                          type="text"
                          value={newAddress.address2}
                          onChange={e =>
                            setNewAddress({
                              ...newAddress,
                              address2: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">
                          電話番号
                        </label>
                        <Input
                          type="tel"
                          value={newAddress.phone}
                          onChange={e =>
                            setNewAddress({
                              ...newAddress,
                              phone: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={newAddress.isDefault}
                          onChange={e =>
                            setNewAddress({
                              ...newAddress,
                              isDefault: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        <label htmlFor="isDefault" className="text-sm">
                          デフォルト住所に設定
                        </label>
                      </div>

                      <div className="flex space-x-3">
                        <Button type="submit">住所を追加</Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddressForm(false)}
                        >
                          キャンセル
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* 備考 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  配送に関する備考
                </h2>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  placeholder="配送に関するご要望があれば入力してください（任意）"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 注文商品 */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 mr-2" />
                  注文商品
                </h2>
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.images[0] && (
                          <Image
                            src={item.product.images[0].url}
                            alt={
                              item.product.images[0].alt || item.product.name
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
                          {formatPrice(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 注文サマリー */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  注文サマリー
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">商品合計</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">配送料</span>
                    <span>{formatPrice(calculateShipping())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">消費税</span>
                    <span>{formatPrice(calculateTax())}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base border-t pt-3">
                    <span>合計</span>
                    <span>{formatPrice(calculateTotal())}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddressId || isPlacingOrder}
                  className="w-full mt-6"
                >
                  {isPlacingOrder ? '注文処理中...' : '注文を確定する'}
                </Button>

                {total >= 10000 && (
                  <p className="text-sm text-green-600 mt-2 text-center">
                    🎉 送料無料対象です！
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
