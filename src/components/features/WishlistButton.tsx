'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  showText?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  className,
  size = 'md',
  variant = 'ghost',
  showText = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) {
      setIsFavorite(false);
      return;
    }

    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/wishlist/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.data.isFavorite);
        }
      } catch (error) {
        console.error('Error checking favorite status:', error);
      }
    };

    checkFavoriteStatus();
  }, [productId, user, token]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !token) {
      // ログインページにリダイレクトするかモーダルを表示
      window.location.href = '/auth/login';
      return;
    }

    setLoading(true);

    try {
      if (isFavorite) {
        // ウィッシュリストから削除
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsFavorite(false);
        } else {
          throw new Error('削除に失敗しました');
        }
      } else {
        // ウィッシュリストに追加
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });

        if (response.ok) {
          setIsFavorite(true);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || '追加に失敗しました');
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 24 : 20;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 transition-colors',
        isFavorite && 'text-red-600 hover:text-red-700',
        !isFavorite && 'text-gray-400 hover:text-red-500',
        className
      )}
      title={isFavorite ? 'ウィッシュリストから削除' : 'ウィッシュリストに追加'}
    >
      <Heart
        size={iconSize}
        className={cn(
          'transition-all duration-200',
          isFavorite ? 'fill-current' : 'fill-none',
          loading && 'opacity-50'
        )}
      />
      {showText && (
        <span className="text-sm">
          {isFavorite ? 'お気に入り済み' : 'お気に入り'}
        </span>
      )}
    </Button>
  );
};
