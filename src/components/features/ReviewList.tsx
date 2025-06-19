'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Star, ThumbsUp, ThumbsDown, Filter, ChevronDown } from 'lucide-react';
import { Button, Card, CardContent, Badge } from '@/components/ui';
import { apiGet } from '@/lib/api-client';
import { useErrorHandler } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface ReviewListProps {
  productId: string;
  refreshTrigger?: number; // レビュー投稿後の再読み込み用
}

/**
 * レビュー一覧表示コンポーネント
 */
export function ReviewList({ productId, refreshTrigger = 0 }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    rating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { handleError } = useErrorHandler();

  /**
   * レビューを取得
   */
  const fetchReviews = useCallback(
    async (pageNum: number = 1, resetList: boolean = true) => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: '10',
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        });

        if (filters.rating) {
          params.set('rating', filters.rating);
        }

        const data = await apiGet(
          `/api/products/${productId}/reviews?${params}`
        );

        if (resetList) {
          setReviews(data.reviews);
        } else {
          setReviews(prev => [...prev, ...data.reviews]);
        }

        setHasMore(data.pagination.page < data.pagination.pages);
        setPage(pageNum);
      } catch (error) {
        handleError(error, 'レビューの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    },
    [productId, filters, handleError]
  );

  // 初回読み込みとフィルター変更時
  useEffect(() => {
    fetchReviews(1, true);
  }, [fetchReviews, refreshTrigger]);

  /**
   * さらに読み込み
   */
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchReviews(page + 1, false);
    }
  };

  /**
   * フィルター変更処理
   */
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  /**
   * 星の描画
   */
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={cn(
          'h-4 w-4',
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        )}
      />
    ));
  };

  /**
   * 日付フォーマット
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  /**
   * ユーザー名のマスキング
   */
  const maskUserName = (name: string) => {
    if (name.length <= 2) return name;
    return (
      name.charAt(0) +
      '*'.repeat(name.length - 2) +
      name.charAt(name.length - 1)
    );
  };

  return (
    <div className="space-y-6">
      {/* フィルターセクション */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">レビューを見る</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              フィルター
              <ChevronDown
                className={cn(
                  'h-4 w-4 ml-2 transition-transform',
                  showFilters && 'rotate-180'
                )}
              />
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 評価フィルター */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  評価で絞り込み
                </label>
                <select
                  value={filters.rating}
                  onChange={e => handleFilterChange('rating', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">すべて</option>
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★☆ (4)</option>
                  <option value="3">★★★☆☆ (3)</option>
                  <option value="2">★★☆☆☆ (2)</option>
                  <option value="1">★☆☆☆☆ (1)</option>
                </select>
              </div>

              {/* ソート順 */}
              <div>
                <label className="block text-sm font-medium mb-2">並び順</label>
                <select
                  value={filters.sortBy}
                  onChange={e => handleFilterChange('sortBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">投稿日順</option>
                  <option value="rating">評価順</option>
                </select>
              </div>

              {/* 昇順・降順 */}
              <div>
                <label className="block text-sm font-medium mb-2">順序</label>
                <select
                  value={filters.sortOrder}
                  onChange={e =>
                    handleFilterChange('sortOrder', e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="desc">新しい順</option>
                  <option value="asc">古い順</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* レビューリスト */}
      <div className="space-y-4">
        {loading && page === 1 ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">レビューを読み込み中...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">
                {filters.rating
                  ? 'この評価のレビューはありません'
                  : 'まだレビューがありません'}
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map(review => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      {review.user.avatar ? (
                        <img
                          src={review.user.avatar}
                          alt={review.user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-semibold">
                          {review.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {maskUserName(review.user.name)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">認証済み購入</Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm font-medium">
                      {review.rating}/5
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h4>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">
                  {review.comment}
                </p>

                {/* 役立つボタン（将来実装予定） */}
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-600">
                    このレビューは役に立ちましたか？
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled>
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      はい (0)
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      いいえ (0)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* さらに読み込みボタン */}
      {hasMore && !loading && reviews.length > 0 && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? '読み込み中...' : 'さらに読み込む'}
          </Button>
        </div>
      )}
    </div>
  );
}
