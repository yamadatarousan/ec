'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Grid, List, Filter, SortAsc, ChevronDown } from 'lucide-react';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';
import { ProductCard } from '@/components/features/ProductCard';
import { cn } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';

interface Product {
  id: string;
  name: string;
  description: string;
  price: Decimal;
  comparePrice?: Decimal | null;
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

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  pagination: Pagination;
  initialFilters: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
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
  const [products] = useState(initialProducts);

  const [localFilters, setLocalFilters] = useState({
    category: initialFilters.category || '',
    search: initialFilters.search || '',
    minPrice: initialFilters.minPrice?.toString() || '',
    maxPrice: initialFilters.maxPrice?.toString() || '',
  });

  const [sortBy, setSortBy] = useState(initialSort.field);
  const [sortOrder, setSortOrder] = useState(initialSort.direction);

  // URLパラメータを更新
  const updateURL = () => {
    const params = new URLSearchParams();

    if (localFilters.category) params.set('category', localFilters.category);
    if (localFilters.search) params.set('search', localFilters.search);
    if (localFilters.minPrice) params.set('minPrice', localFilters.minPrice);
    if (localFilters.maxPrice) params.set('maxPrice', localFilters.maxPrice);
    if (sortBy !== 'createdAt') params.set('sortBy', sortBy);
    if (sortOrder !== 'desc') params.set('sortOrder', sortOrder);

    const newURL = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newURL as any);
  };

  // フィルターをクリア
  const clearFilters = () => {
    setLocalFilters({
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
    });
    router.push('/products' as any);
  };

  // アクティブなフィルターの数を計算
  const activeFiltersCount = Object.values(localFilters).filter(Boolean).length;

  return (
    <div className="flex gap-6">
      {/* サイドバー（フィルター） */}
      <div
        className={cn(
          'w-80 space-y-6',
          showFilters ? 'block' : 'hidden lg:block'
        )}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">フィルター</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800"
                >
                  クリア ({activeFiltersCount})
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {/* 検索 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  キーワード検索
                </label>
                <Input
                  type="text"
                  placeholder="商品名で検索"
                  value={localFilters.search}
                  onChange={e =>
                    setLocalFilters(prev => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  onKeyDown={e => e.key === 'Enter' && updateURL()}
                />
              </div>

              {/* カテゴリー */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  カテゴリー
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setLocalFilters(prev => ({ ...prev, category: '' }));
                      router.push('/products' as any);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                      !localFilters.category
                        ? 'bg-blue-100 text-blue-800'
                        : 'hover:bg-gray-100'
                    )}
                  >
                    すべて
                  </button>
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setLocalFilters(prev => ({
                          ...prev,
                          category: category.slug,
                        }));
                        const params = new URLSearchParams(searchParams);
                        params.set('category', category.slug);
                        router.push(`/products?${params.toString()}` as any);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center',
                        localFilters.category === category.slug
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:bg-gray-100'
                      )}
                    >
                      <span>{category.name}</span>
                      <Badge variant="default" size="sm">
                        {category._count.products}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* 価格範囲 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  価格範囲
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="最低価格"
                    value={localFilters.minPrice}
                    onChange={e =>
                      setLocalFilters(prev => ({
                        ...prev,
                        minPrice: e.target.value,
                      }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="最高価格"
                    value={localFilters.maxPrice}
                    onChange={e =>
                      setLocalFilters(prev => ({
                        ...prev,
                        maxPrice: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button onClick={updateURL} className="w-full mt-2" size="sm">
                  適用
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1">
        {/* ツールバー */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">並び順:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [field, direction] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(direction);
                const params = new URLSearchParams(searchParams);
                params.set('sortBy', field);
                params.set('sortOrder', direction);
                router.push(`/products?${params.toString()}` as any);
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="createdAt-desc">新着順</option>
              <option value="price-asc">価格の安い順</option>
              <option value="price-desc">価格の高い順</option>
              <option value="name-asc">名前順</option>
            </select>
          </div>
        </div>

        {/* 商品一覧 */}
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}
        >
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.name,
                description: product.description,
                price: Number(product.price),
                comparePrice: product.comparePrice
                  ? Number(product.comparePrice)
                  : undefined,
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
                averageRating: 0,
                reviewCount: product._count.reviews,
              }}
              variant={viewMode === 'grid' ? 'default' : 'compact'}
            />
          ))}
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
  );
}
