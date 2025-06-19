/**
 * 認証関連の型定義
 */

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: 'CUSTOMER' | 'ADMIN';
  avatar?: string | null;
  createdAt?: Date | string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  iat?: number;
  exp?: number;
}
