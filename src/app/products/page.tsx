'use client';

import { useState, useMemo } from 'react';
import { Grid, List, Filter, SortAsc } from 'lucide-react';
import { Button, Card, CardContent, Input, Badge } from '@/components/ui';
import { ProductCard } from '@/components/features/ProductCard';
import { mockProducts, mockCategories } from '@/data/mockProducts';
import { Product, ProductFilters, ProductSort } from '@/types';
import { cn } from '@/lib/utils';

/**
 * 商品一覧ページコンポーネント
 * Amazon風の商品一覧表示とフィルタリング機能を提供
 */
export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<ProductSort>({
    field: 'createdAt',
    direction: 'desc',
  });

  /**
   * フィルタリングとソートを適用した商品リスト
   */
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // カテゴリーフィルター
    if (filters.categoryId) {
      filtered = filtered.filter(
        product => product.categoryId === filters.categoryId
      );
    }

    // 価格フィルター
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => product.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice!);
    }

    // 評価フィルター
    if (filters.rating !== undefined) {
      filtered = filtered.filter(
        product =>
          product.averageRating && product.averageRating >= filters.rating!
      );
    }

    // 在庫フィルター
    if (filters.inStock) {
      filtered = filtered.filter(product => product.stock > 0);
    }

    // 検索フィルター
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm)
      );
    }

    // ソート
    filtered.sort((a, b) => {
      let aVal: any = a[sort.field as keyof Product];
      let bVal: any = b[sort.field as keyof Product];

      if (sort.field === 'rating') {
        aVal = a.averageRating || 0;
        bVal = b.averageRating || 0;
      }

      if (typeof aVal === 'string') {
        return sort.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number') {
        return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (aVal instanceof Date) {
        return sort.direction === 'asc'
          ? aVal.getTime() - bVal.getTime()
          : bVal.getTime() - aVal.getTime();
      }

      return 0;
    });

    return filtered;
  }, [filters, sort]);

  /**
   * フィルター更新処理
   */
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  /**
   * フィルターリセット処理
   */
  const resetFilters = () => {
    setFilters({});
  };

  /**
   * アクティブなフィルター数を計算
   */
  const activeFiltersCount = Object.values(filters).filter(
    value => value !== undefined && value !== '' && value !== false
  ).length;

  return (
    <div className="container-custom py-6">
      {/* ページヘッダー */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">商品一覧</h1>
          <p className="text-gray-600 mt-1">
            {filteredAndSortedProducts.length}件の商品が見つかりました
          </p>
        </div>

        {/* 表示設定 */}
        <div className="flex items-center space-x-4">
          {/* ソート */}
          <select
            value={`${sort.field}-${sort.direction}`}
            onChange={e => {
              const [field, direction] = e.target.value.split('-');
              setSort({
                field: field as any,
                direction: direction as 'asc' | 'desc',
              });
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="createdAt-desc">新着順</option>
            <option value="price-asc">価格の安い順</option>
            <option value="price-desc">価格の高い順</option>
            <option value="rating-desc">評価の高い順</option>
            <option value="name-asc">名前順</option>
          </select>

          {/* 表示モード切り替え */}
          <div className="flex border border-gray-300 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* フィルター切り替え */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            フィルター
            {activeFiltersCount > 0 && (
              <Badge
                variant="error"
                size="sm"
                className="absolute -top-2 -right-2 h-5 w-5 text-xs"
              >
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* サイドバーフィルター */}
        <aside
          className={cn(
            'lg:w-64 space-y-6',
            showFilters ? 'block' : 'hidden lg:block'
          )}
        >
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">フィルター</h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetFilters}
                    className="text-xs"
                  >
                    リセット
                  </Button>
                )}
              </div>

              {/* 検索 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  商品名検索
                </label>
                <Input
                  placeholder="商品を検索..."
                  value={filters.search || ''}
                  onChange={e => updateFilter('search', e.target.value)}
                />
              </div>

              {/* カテゴリー */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  カテゴリー
                </label>
                <select
                  value={filters.categoryId || ''}
                  onChange={e =>
                    updateFilter('categoryId', e.target.value || undefined)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">すべてのカテゴリー</option>
                  {mockCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 価格範囲 */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  価格範囲
                </label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="最小"
                    value={filters.minPrice || ''}
                    onChange={e =>
                      updateFilter(
                        'minPrice',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="最大"
                    value={filters.maxPrice || ''}
                    onChange={e =>
                      updateFilter(
                        'maxPrice',
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                </div>
              </div>

              {/* 評価 */}
              <div>
                <label className="block text-sm font-medium mb-2">評価</label>
                <select
                  value={filters.rating || ''}
                  onChange={e =>
                    updateFilter(
                      'rating',
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">すべて</option>
                  <option value="4">★4以上</option>
                  <option value="3">★3以上</option>
                  <option value="2">★2以上</option>
                </select>
              </div>

              {/* 在庫状況 */}
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.inStock || false}
                    onChange={e => updateFilter('inStock', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">在庫ありのみ</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* 商品グリッド */}
        <main className="flex-1">
          {filteredAndSortedProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 text-lg">
                  条件に一致する商品が見つかりませんでした。
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-4"
                >
                  フィルターをリセット
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                  : 'space-y-4'
              )}
            >
              {filteredAndSortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
