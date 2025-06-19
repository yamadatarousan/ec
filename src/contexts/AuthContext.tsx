'use client';

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { AuthUser, LoginRequest, RegisterRequest } from '@/types/auth';
import { apiPost, apiGet, apiPut, ApiError } from '@/lib/api-client';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: AuthUser; token: string } }
  | { type: 'CLEAR_USER' }
  | { type: 'UPDATE_USER'; payload: AuthUser };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'CLEAR_USER':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name: string; email: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ローカルストレージからトークンを取得してユーザー情報を復元
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const data = await apiGet('/api/auth/me', token);
          dispatch({
            type: 'SET_USER',
            payload: { user: data.user, token },
          });
        } catch (error) {
          console.error('認証初期化エラー:', error);
          localStorage.removeItem('auth_token');
          dispatch({ type: 'CLEAR_USER' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // ログイン
  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await apiPost('/api/auth/login', credentials);

      // トークンをローカルストレージに保存
      localStorage.setItem('auth_token', data.token);

      dispatch({
        type: 'SET_USER',
        payload: { user: data.user, token: data.token },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  // ユーザー登録
  const register = async (data: RegisterRequest) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const responseData = await apiPost('/api/auth/register', data);

      // トークンをローカルストレージに保存
      localStorage.setItem('auth_token', responseData.token);

      dispatch({
        type: 'SET_USER',
        payload: { user: responseData.user, token: responseData.token },
      });
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  // ログアウト
  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'CLEAR_USER' });
  };

  // ユーザー情報を再取得
  const refreshUser = async () => {
    if (!state.token) return;

    try {
      const data = await apiGet('/api/auth/me', state.token);
      dispatch({ type: 'UPDATE_USER', payload: data.user });
    } catch (error) {
      console.error('ユーザー情報更新エラー:', error);
    }
  };

  // プロフィール更新
  const updateProfile = async (data: { name: string; email: string }) => {
    if (!state.token) {
      throw new Error('認証が必要です');
    }

    try {
      const responseData = await apiPut('/api/auth/me', data, state.token);
      dispatch({ type: 'UPDATE_USER', payload: responseData.user });
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw error;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
