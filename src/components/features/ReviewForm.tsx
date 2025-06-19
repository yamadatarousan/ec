'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Button, Card, CardContent, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useToast, useErrorHandler } from '@/components/ui';
import { apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

/**
 * レビュー投稿フォームコンポーネント
 */
export function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { isAuthenticated, token } = useAuth();
  const { showSuccess } = useToast();
  const { handleError } = useErrorHandler();

  /**
   * レビュー投稿処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      handleError(new Error('レビューを投稿するにはログインが必要です'));
      return;
    }

    if (rating === 0) {
      handleError(new Error('評価を選択してください'));
      return;
    }

    if (comment.trim().length < 10) {
      handleError(new Error('コメントは10文字以上で入力してください'));
      return;
    }

    setIsSubmitting(true);

    try {
      await apiPost(
        `/api/products/${productId}/reviews`,
        {
          rating,
          title: title.trim() || null,
          comment: comment.trim(),
        },
        token
      );

      showSuccess('レビューを投稿しました', 'ご意見をありがとうございます');

      // フォームをリセット
      setRating(0);
      setTitle('');
      setComment('');
      setShowForm(false);

      // 親コンポーネントに投稿完了を通知
      onReviewSubmitted();
    } catch (error) {
      handleError(error, 'レビューの投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 星の描画
   */
  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= currentRating;

      return (
        <Star
          key={index}
          className={cn(
            'h-8 w-8 transition-colors',
            interactive && 'cursor-pointer hover:scale-110',
            isFilled
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300 hover:text-yellow-300'
          )}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={
            interactive ? () => setHoveredRating(starValue) : undefined
          }
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      );
    });
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600 mb-4">
            レビューを投稿するにはログインが必要です
          </p>
          <Button onClick={() => (window.location.href = '/auth/login')}>
            ログイン
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        {!showForm ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">商品のレビューを書く</h3>
            <Button onClick={() => setShowForm(true)} className="w-full">
              レビューを投稿する
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">レビューを投稿</h3>
            </div>

            {/* 評価 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                評価 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1">
                {renderStars(hoveredRating || rating, true)}
                <span className="ml-3 text-sm text-gray-600">
                  {rating > 0 && (
                    <>
                      {rating}/5 -{' '}
                      {['', '最悪', '悪い', '普通', '良い', '最高'][rating]}
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium mb-2">
                タイトル（任意）
              </label>
              <Input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="レビューのタイトル"
                maxLength={100}
              />
            </div>

            {/* コメント */}
            <div>
              <label className="block text-sm font-medium mb-2">
                コメント <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="商品の感想をお聞かせください（10文字以上）"
                rows={5}
                maxLength={1000}
                required
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {comment.length}/1000文字
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setTitle('');
                  setComment('');
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting || rating === 0 || comment.trim().length < 10
                }
                className="flex-1"
              >
                {isSubmitting ? '投稿中...' : 'レビューを投稿'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * レビュー統計表示コンポーネント
 */
interface ReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function ReviewStats({
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewStatsProps) {
  if (totalReviews === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">まだレビューがありません</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">カスタマーレビュー</h3>
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      'h-5 w-5',
                      index < Math.floor(averageRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-xl font-bold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-gray-600">
                （{totalReviews}件のレビュー）
              </span>
            </div>
          </div>
        </div>

        {/* 評価分布 */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = ratingDistribution[rating] || 0;
            const percentage =
              totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={rating} className="flex items-center space-x-3">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12">{count}件</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
