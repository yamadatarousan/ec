'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  TrendingUp,
  Filter,
  RefreshCw,
  Upload,
  Download,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT';
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt?: string;
  }>;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
}

interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  lowStock: number;
  totalValue: number;
}

/**
 * 管理者商品管理ページ
 * 商品の一覧表示、作成、編集、削除、ステータス管理を提供
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState<
    'name' | 'price' | 'stock' | 'createdAt'
  >('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchStats();
  }, [
    searchTerm,
    selectedCategory,
    selectedStatus,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (selectedStatus) params.set('status', selectedStatus);

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/products/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleStatusToggle = async (
    productId: string,
    currentStatus: string
  ) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      const response = await fetch(`/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('この商品を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProducts();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return '公開中';
      case 'INACTIVE':
        return '非公開';
      case 'DRAFT':
        return '下書き';
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

  if (loading && products.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">商品管理</h1>
          <p className="text-gray-600">
            商品の追加、編集、削除、ステータス管理
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchProducts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <Link href={'/admin/products/new' as any}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規商品
            </Button>
          </Link>
        </div>
      </div>

      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">総商品数</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">公開中</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <EyeOff className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">非公開</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">下書き</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.draft}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">在庫少</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.lowStock}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-purple-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">総価値</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatPrice(stats.totalValue)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* フィルターとソート */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="商品名、SKU、説明で検索..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* カテゴリフィルター */}
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* ステータスフィルター */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべてのステータス</option>
              <option value="ACTIVE">公開中</option>
              <option value="INACTIVE">非公開</option>
              <option value="DRAFT">下書き</option>
            </select>

            {/* ソート */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">作成日</option>
              <option value="name">商品名</option>
              <option value="price">価格</option>
              <option value="stock">在庫数</option>
            </select>

            {/* ソート順 */}
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 商品一覧 */}
      <Card>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600">該当する商品がありません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      カテゴリ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      価格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      在庫
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      評価
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      更新日
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16">
                            {product.images.length > 0 ? (
                              <Image
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                width={64}
                                height={64}
                                className="h-16 w-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </div>
                        {product.comparePrice &&
                          product.comparePrice > product.price && (
                            <div className="text-xs text-gray-500 line-through">
                              {formatPrice(product.comparePrice)}
                            </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`text-sm font-medium ${product.stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}
                        >
                          {product.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeColor(product.status)}>
                          {getStatusText(product.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.averageRating ? (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm text-gray-900">
                              {product.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">
                              ({product.reviewCount})
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">未評価</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(product.updatedAt).toLocaleDateString(
                          'ja-JP'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/admin/products/${product.id}` as any}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleStatusToggle(product.id, product.status)
                            }
                          >
                            {product.status === 'ACTIVE' ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ページング */}
      {products.length > 0 && (
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              前へ
            </Button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-700">
              ページ {currentPage}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={products.length < itemsPerPage}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
