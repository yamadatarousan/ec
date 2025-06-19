'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useProductView = () => {
  const { user } = useAuth();

  const trackView = useCallback(
    async (productId: string) => {
      try {
        // セッションIDを取得または生成
        let sessionId = null;
        if (typeof window !== 'undefined') {
          sessionId = localStorage.getItem('sessionId');
          if (!sessionId) {
            sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('sessionId', sessionId);
          }
        }

        const response = await fetch(`/api/products/${productId}/view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            sessionId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to track product view');
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to track product view:', error);
        // エラーが発生してもユーザー体験を阻害しないよう、silent fail
        return null;
      }
    },
    [user]
  );

  return { trackView };
};
