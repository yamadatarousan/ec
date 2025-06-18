/**
 * 商品関連の型定義
 * Prismaスキーマと対応する型を定義
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  sku: string;
  stock: number;
  status: ProductStatus;
  weight?: number;
  dimensions?: string;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  reviews: Review[];
  averageRating?: number;
  reviewCount?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order: number;
  createdAt: Date;
  productId: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category;
  children?: Category[];
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  productId: string;
  user: {
    id: string;
    name?: string;
    email: string;
  };
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

/**
 * 商品一覧用のフィルター条件
 */
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
}

/**
 * 商品一覧のソート条件
 */
export interface ProductSort {
  field: 'name' | 'price' | 'createdAt' | 'rating' | 'popularity';
  direction: 'asc' | 'desc';
}

/**
 * 商品一覧のページネーション
 */
export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * 商品一覧のレスポンス型
 */
export interface ProductListResponse {
  products: Product[];
  pagination: ProductPagination;
  filters: ProductFilters;
  sort: ProductSort;
}
