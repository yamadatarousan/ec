'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Flag,
  MessageCircle,
  Calendar,
  User,
  RefreshCw,
  Download,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, Button, Input, Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  isApproved: boolean;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  product: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      alt: string;
    }>;
  };
  helpfulCount: number;
  reportCount: number;
}

interface ReviewStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  reported: number;
  averageRating: number;
  totalHelpful: number;
  totalReports: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedRating, setSelectedRating] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'rating' | 'helpful'>(
    'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [
    searchTerm,
    selectedStatus,
    selectedRating,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    currentPage,
  ]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.set('search', searchTerm);
      if (selectedStatus) params.set('status', selectedStatus);
      if (selectedRating) params.set('rating', selectedRating);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const response = await fetch(`/api/admin/reviews?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/reviews/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleStatusUpdate = async (reviewId: string, isApproved: boolean) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      });

      if (response.ok) {
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to update review status:', error);
    }
  };

  const handleReportReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to report review:', error);
    }
  };

  const getStatusBadgeColor = (review: Review) => {
    if (review.isReported) return 'bg-red-100 text-red-800';
    if (review.isApproved) return 'bg-green-100 text-green-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (review: Review) => {
    if (review.isReported) return '報告済み';
    if (review.isApproved) return '承認済み';
    return '承認待ち';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading && reviews.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">レビュー管理</h1>
          <p className="text-gray-600">商品レビューの確認、承認、管理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchReviews}>
            <RefreshCw className="h-4 w-4 mr-2" />
            更新
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    総レビュー数
                  </p>
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
                <Check className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">承認済み</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.approved}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Flag className="h-8 w-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">報告済み</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.reported}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">平均評価</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {/* 検索 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="商品名、レビュー内容で検索..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* ステータスフィルター */}
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべてのステータス</option>
              <option value="pending">承認待ち</option>
              <option value="approved">承認済み</option>
              <option value="reported">報告済み</option>
            </select>

            {/* 評価フィルター */}
            <select
              value={selectedRating}
              onChange={e => setSelectedRating(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">すべての評価</option>
              <option value="5">5つ星</option>
              <option value="4">4つ星</option>
              <option value="3">3つ星</option>
              <option value="2">2つ星</option>
              <option value="1">1つ星</option>
            </select>

            {/* 期間フィルター（開始日） */}
            <Input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder="開始日"
            />

            {/* 期間フィルター（終了日） */}
            <Input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder="終了日"
            />

            {/* ソート */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">作成日</option>
              <option value="rating">評価</option>
              <option value="helpful">参考になった数</option>
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

      {/* レビュー一覧 */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-600">該当するレビューがありません</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* レビューヘッダー */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {review.rating}.0
                          </span>
                        </div>
                        <Badge className={getStatusBadgeColor(review)}>
                          {getStatusText(review)}
                        </Badge>
                        {review.helpfulCount > 0 && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{review.helpfulCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(review.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>

                    {/* レビュー内容 */}
                    <div className="mb-4">
                      {review.title && (
                        <h4 className="font-medium text-gray-900 mb-2">
                          {review.title}
                        </h4>
                      )}
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.content}
                      </p>
                    </div>

                    {/* 商品・ユーザー情報 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {review.product.images[0] && (
                            <img
                              src={review.product.images[0].url}
                              alt={review.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {review.product.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              商品ID: {review.product.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        <span>{review.user.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col gap-2 ml-6">
                    <Link href={`/admin/reviews/${review.id}` as any}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {!review.isApproved && !review.isReported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(review.id, true)}
                        className="text-green-600"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}

                    {review.isApproved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(review.id, false)}
                        className="text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}

                    {!review.isReported && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReportReview(review.id)}
                        className="text-orange-600"
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ページング */}
      {reviews.length > 0 && (
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
              disabled={reviews.length < itemsPerPage}
            >
              次へ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
