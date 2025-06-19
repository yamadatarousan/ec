import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/Toast';

interface WishlistItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number;
    images: Array<{
      url: string;
      alt: string;
    }>;
    category: {
      name: string;
    };
    averageRating?: number;
    reviewCount: number;
  };
  addedAt: string;
}

interface UseWishlistReturn {
  wishlistItems: WishlistItem[];
  loading: boolean;
  error: string | null;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
}

export function useWishlist(): UseWishlistReturn {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchWishlist = useCallback(async () => {
    if (!user || !token) {
      setWishlistItems([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/wishlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('ウィッシュリストの取得に失敗しました');
      }

      const data = await response.json();
      setWishlistItems(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('Wishlist fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  const addToWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!user || !token) {
        showError('ログインが必要です');
        return false;
      }

      try {
        const response = await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || 'ウィッシュリストへの追加に失敗しました'
          );
        }

        const data = await response.json();
        setWishlistItems(prev => [data.data, ...prev]);
        showSuccess('ウィッシュリストに追加しました');
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'エラーが発生しました';
        showError(errorMessage);
        console.error('Add to wishlist error:', err);
        return false;
      }
    },
    [user, token, showSuccess, showError]
  );

  const removeFromWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      if (!user || !token) {
        showError('ログインが必要です');
        return false;
      }

      try {
        const response = await fetch(`/api/wishlist/${productId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message ||
              'ウィッシュリストからの削除に失敗しました'
          );
        }

        setWishlistItems(prev =>
          prev.filter(item => item.product.id !== productId)
        );
        showSuccess('ウィッシュリストから削除しました');
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'エラーが発生しました';
        showError(errorMessage);
        console.error('Remove from wishlist error:', err);
        return false;
      }
    },
    [user, token, showSuccess, showError]
  );

  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlistItems.some(item => item.product.id === productId);
    },
    [wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      if (isInWishlist(productId)) {
        return await removeFromWishlist(productId);
      } else {
        return await addToWishlist(productId);
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  return {
    wishlistItems,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  };
}
