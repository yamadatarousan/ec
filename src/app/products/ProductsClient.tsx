'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Grid, List, Filter, SortAsc, ChevronDown } from 'lucide-react';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';
import { ProductCard } from '@/components/features/ProductCard';
import { ProductFilters } from '@/components/features/ProductFilters';
import { ProductSort } from '@/components/features/ProductSort';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku: string;
  stock: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: {
    id: string;
    url: string;
    alt?: string | null;
  }[];
  _count: {
    reviews: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface FilterState {
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock: boolean;
  onSale: boolean;
}

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  pagination: Pagination;
  initialFilters: {
    category?: string;
    categories?: string[];
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    inStock?: boolean;
    onSale?: boolean;
  };
  initialSort: {
    field: string;
    direction: string;
  };
}

export function ProductsClient({
  initialProducts,
  categories,
  pagination,
  initialFilters,
  initialSort,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    categories:
      initialFilters.categories ||
      (initialFilters.category ? [initialFilters.category] : []),
    minPrice: initialFilters.minPrice,
    maxPrice: initialFilters.maxPrice,
    minRating: initialFilters.minRating,
    inStock: initialFilters.inStock || false,
    onSale: initialFilters.onSale || false,
  });

  const [searchQuery, setSearchQuery] = useState(initialFilters.search || '');
  const [currentSort, setCurrentSort] = useState({
    field: initialSort.field,
    direction: initialSort.direction,
  });

  // 商品データを取得
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (searchQuery) params.set('search', searchQuery);
      if (filters.categories.length > 0)
        params.set('categories', filters.categories.join(','));
      if (filters.minPrice !== undefined)
        params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice !== undefined)
        params.set('maxPrice', filters.maxPrice.toString());
      if (filters.minRating !== undefined)
        params.set('minRating', filters.minRating.toString());
      if (filters.inStock) params.set('inStock', 'true');
      if (filters.onSale) params.set('onSale', 'true');
      params.set('sortBy', currentSort.field);
      params.set('sortOrder', currentSort.direction);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, currentSort]);

  // URLパラメータを更新
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (filters.categories.length > 0)
      params.set('categories', filters.categories.join(','));
    if (filters.minPrice !== undefined)
      params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined)
      params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating !== undefined)
      params.set('minRating', filters.minRating.toString());
    if (filters.inStock) params.set('inStock', 'true');
    if (filters.onSale) params.set('onSale', 'true');
    if (currentSort.field !== 'createdAt')
      params.set('sortBy', currentSort.field);
    if (currentSort.direction !== 'desc')
      params.set('sortOrder', currentSort.direction);

    const newURL = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newURL as any);
  }, [router, searchQuery, filters, currentSort]);

  // フィルター変更ハンドラー
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  // ソート変更ハンドラー
  const handleSortChange = useCallback((field: string, direction: string) => {
    setCurrentSort({ field, direction });
  }, []);

  // 検索実行
  const handleSearch = useCallback(() => {
    fetchProducts();
    updateURL();
  }, [fetchProducts, updateURL]);

  // アクティブなフィルターの数を計算
  const activeFiltersCount =
    filters.categories.length +
    (filters.minPrice !== undefined ? 1 : 0) +
    (filters.maxPrice !== undefined ? 1 : 0) +
    (filters.minRating !== undefined ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.onSale ? 1 : 0) +
    (searchQuery ? 1 : 0);

  // フィルターまたはソートが変更されたら商品を取得
  useEffect(() => {
    fetchProducts();
  }, [filters, currentSort]);

  // URLが変更されたら更新
  useEffect(() => {
    updateURL();
  }, [searchQuery, filters, currentSort]);

  return (
    <div className="space-y-6">
      {/* 検索バー */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex gap-2">
          <Input
            type="search"
            placeholder="商品を検索..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading}>
            検索
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* サイドバー（フィルター） */}
        <div
          className={cn(
            'w-80 space-y-6',
            showFilters ? 'block' : 'hidden lg:block'
          )}
        >
          <ProductFilters
            categories={categories}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>

        {/* メインコンテンツ */}
        <div className="flex-1">
          {/* ツールバー */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                フィルター
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2">{activeFiltersCount}</Badge>
                )}
              </Button>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-600">表示:</span>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                {products.length}件の商品
                {loading && (
                  <span className="ml-2 text-blue-600">読み込み中...</span>
                )}
              </div>
            </div>

            {/* ソートコンポーネント */}
            <ProductSort
              currentSort={currentSort}
              onSortChange={handleSortChange}
              className="sm:ml-auto"
            />
          </div>

          {/* 商品一覧 */}
          <div
            className={cn(
              loading && 'opacity-50 pointer-events-none',
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            )}
          >
            {products.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500">
                  {loading
                    ? '商品を読み込み中...'
                    : '条件に合う商品が見つかりませんでした'}
                </div>
              </div>
            ) : (
              products.map(product => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    comparePrice: product.comparePrice,
                    sku: product.sku,
                    stock: product.stock,
                    status: 'ACTIVE' as any,
                    categoryId: product.category.id,
                    category: {
                      id: product.category.id,
                      name: product.category.name,
                      slug: product.category.slug,
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    },
                    images: product.images.map(img => ({
                      id: img.id,
                      url: img.url,
                      alt: img.alt || '',
                      order: 0,
                      createdAt: new Date(),
                      productId: product.id,
                    })),
                    reviews: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    averageRating: (product as any).averageRating || 0,
                    reviewCount: product._count.reviews,
                  }}
                  variant={viewMode === 'grid' ? 'default' : 'compact'}
                />
              ))
            )}
          </div>

          {/* ページネーション */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(
                  page => (
                    <Button
                      key={page}
                      variant={page === pagination.page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('page', page.toString());
                        router.push(`/products?${params.toString()}` as any);
                      }}
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
