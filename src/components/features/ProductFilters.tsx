'use client';

import React, { useState, useCallback } from 'react';
import { ChevronDown, Filter, X, Star } from 'lucide-react';
import { Card, CardContent, Button, Badge, Checkbox } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface FilterState {
  categories: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock: boolean;
  onSale: boolean;
}

interface ProductFiltersProps {
  categories: Category[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  onFiltersChange,
  className,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice?.toString() || '',
    max: filters.maxPrice?.toString() || '',
  });

  const handleCategoryChange = useCallback(
    (categorySlug: string, checked: boolean) => {
      const newCategories = checked
        ? [...filters.categories, categorySlug]
        : filters.categories.filter(cat => cat !== categorySlug);

      onFiltersChange({
        ...filters,
        categories: newCategories,
      });
    },
    [filters, onFiltersChange]
  );

  const handlePriceChange = useCallback(() => {
    const minPrice = priceRange.min ? parseFloat(priceRange.min) : undefined;
    const maxPrice = priceRange.max ? parseFloat(priceRange.max) : undefined;

    onFiltersChange({
      ...filters,
      minPrice,
      maxPrice,
    });
  }, [filters, onFiltersChange, priceRange]);

  const handleRatingChange = useCallback(
    (rating: number) => {
      onFiltersChange({
        ...filters,
        minRating: filters.minRating === rating ? undefined : rating,
      });
    },
    [filters, onFiltersChange]
  );

  const handleToggleFilter = useCallback(
    (key: keyof FilterState) => {
      onFiltersChange({
        ...filters,
        [key]: !filters[key],
      });
    },
    [filters, onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      categories: [],
      inStock: false,
      onSale: false,
    });
    setPriceRange({ min: '', max: '' });
  }, [onFiltersChange]);

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating !== undefined ||
    filters.inStock ||
    filters.onSale;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">以上</span>
      </div>
    );
  };

  return (
    <Card className={cn('w-full lg:w-80', className)}>
      <CardContent className="p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="font-semibold text-lg">フィルター</h3>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm"
              >
                クリア
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden"
            >
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isCollapsed && 'rotate-180'
                )}
              />
            </Button>
          </div>
        </div>

        <div className={cn('space-y-6', isCollapsed && 'lg:block hidden')}>
          {/* カテゴリフィルター */}
          <div>
            <h4 className="font-medium text-sm mb-3">カテゴリ</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(category => (
                <label
                  key={category.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Checkbox
                    checked={filters.categories.includes(category.slug)}
                    onCheckedChange={checked =>
                      handleCategoryChange(category.slug, checked as boolean)
                    }
                  />
                  <span className="text-sm flex-1">{category.name}</span>
                  <span className="text-xs text-gray-500">
                    ({category._count.products})
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 価格フィルター */}
          <div>
            <h4 className="font-medium text-sm mb-3">価格帯</h4>
            <div className="flex items-center space-x-2 mb-2">
              <input
                type="number"
                placeholder="最低価格"
                value={priceRange.min}
                onChange={e =>
                  setPriceRange(prev => ({ ...prev, min: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="0"
              />
              <span className="text-gray-500">〜</span>
              <input
                type="number"
                placeholder="最高価格"
                value={priceRange.max}
                onChange={e =>
                  setPriceRange(prev => ({ ...prev, max: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                min="0"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePriceChange}
              className="w-full"
            >
              適用
            </Button>
          </div>

          {/* 評価フィルター */}
          <div>
            <h4 className="font-medium text-sm mb-3">評価</h4>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(rating => (
                <label
                  key={rating}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Checkbox
                    checked={filters.minRating === rating}
                    onCheckedChange={() => handleRatingChange(rating)}
                  />
                  {renderStars(rating)}
                </label>
              ))}
            </div>
          </div>

          {/* その他のフィルター */}
          <div>
            <h4 className="font-medium text-sm mb-3">その他</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={filters.inStock}
                  onCheckedChange={() => handleToggleFilter('inStock')}
                />
                <span className="text-sm">在庫あり</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <Checkbox
                  checked={filters.onSale}
                  onCheckedChange={() => handleToggleFilter('onSale')}
                />
                <span className="text-sm">セール中</span>
              </label>
            </div>
          </div>
        </div>

        {/* 適用中のフィルター */}
        {hasActiveFilters && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-sm mb-3">適用中のフィルター</h4>
            <div className="flex flex-wrap gap-2">
              {filters.categories.map(categorySlug => {
                const category = categories.find(
                  cat => cat.slug === categorySlug
                );
                return category ? (
                  <Badge
                    key={categorySlug}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {category.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleCategoryChange(categorySlug, false)}
                    />
                  </Badge>
                ) : null;
              })}

              {(filters.minPrice !== undefined ||
                filters.maxPrice !== undefined) && (
                <Badge variant="outline" className="flex items-center gap-1">
                  ¥{filters.minPrice || 0} - ¥{filters.maxPrice || '∞'}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      onFiltersChange({
                        ...filters,
                        minPrice: undefined,
                        maxPrice: undefined,
                      });
                      setPriceRange({ min: '', max: '' });
                    }}
                  />
                </Badge>
              )}

              {filters.minRating !== undefined && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {filters.minRating}つ星以上
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRatingChange(filters.minRating!)}
                  />
                </Badge>
              )}

              {filters.inStock && (
                <Badge variant="outline" className="flex items-center gap-1">
                  在庫あり
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleToggleFilter('inStock')}
                  />
                </Badge>
              )}

              {filters.onSale && (
                <Badge variant="outline" className="flex items-center gap-1">
                  セール中
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleToggleFilter('onSale')}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
