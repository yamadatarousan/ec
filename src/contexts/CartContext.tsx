'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: { url: string; alt?: string | null }[];
    category: { name: string };
    stock: number;
  };
}

interface CartState {
  items: CartItem[];
  itemCount: number;
  total: number;
  isLoading: boolean;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: { items: CartItem[]; itemCount: number } }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_ITEM_COUNT'; payload: number }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  itemCount: 0,
  total: 0,
  isLoading: false,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_CART':
      const total = action.payload.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
      return {
        ...state,
        items: action.payload.items,
        itemCount: action.payload.itemCount,
        total,
        isLoading: false,
      };

    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.product.id === action.payload.product.id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity:
            newItems[existingItemIndex].quantity + action.payload.quantity,
        };
      } else {
        newItems = [...state.items, action.payload];
      }

      const newTotal = newItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      return {
        ...state,
        items: newItems,
        total: newTotal,
        isLoading: false,
      };

    case 'UPDATE_ITEM':
      const updatedItems = state.items
        .map(item =>
          item.product.id === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
        .filter(item => item.quantity > 0);

      const updatedTotal = updatedItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        total: updatedTotal,
      };

    case 'REMOVE_ITEM':
      const filteredItems = state.items.filter(
        item => item.product.id !== action.payload
      );

      const filteredTotal = filteredItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      return {
        ...state,
        items: filteredItems,
        total: filteredTotal,
      };

    case 'SET_ITEM_COUNT':
      return { ...state, itemCount: action.payload };

    case 'CLEAR_CART':
      return { ...state, items: [], itemCount: 0, total: 0 };

    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { token, isAuthenticated } = useAuth();

  // 認証ヘッダーを取得するヘルパー
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  };

  // カート情報を取得
  const refreshCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/cart', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: 'SET_CART',
          payload: {
            items: data.items.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              product: {
                id: item.product.id,
                name: item.product.name,
                price: Number(item.product.price),
                images: item.product.images,
                category: item.product.category,
                stock: item.product.stock,
              },
            })),
            itemCount: data.itemCount,
          },
        });
      }
    } catch (error) {
      console.error('カート取得エラー:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // カートにアイテム追加
  const addToCart = async (productId: string, quantity: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SET_ITEM_COUNT', payload: data.itemCount });
        await refreshCart(); // カート全体を再取得
      }
    } catch (error) {
      console.error('カート追加エラー:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 数量更新
  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'UPDATE_ITEM', payload: { productId, quantity } });
        dispatch({ type: 'SET_ITEM_COUNT', payload: data.itemCount });
      }
    } catch (error) {
      console.error('カート更新エラー:', error);
    }
  };

  // アイテム削除
  const removeFromCart = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
        dispatch({ type: 'SET_ITEM_COUNT', payload: data.itemCount });
      }
    } catch (error) {
      console.error('カート削除エラー:', error);
    }
  };

  // カートクリア
  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('カートクリアエラー:', error);
    }
  };

  // 認証状態変更時にカートを更新
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      // 未認証時はカートをクリア
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [isAuthenticated]);

  const value: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
