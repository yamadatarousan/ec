'use client';

import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SortOption {
  value: string;
  label: string;
  field: 'name' | 'price' | 'createdAt' | 'rating' | 'popularity';
  direction: 'asc' | 'desc';
}

interface ProductSortProps {
  currentSort: {
    field: string;
    direction: string;
  };
  onSortChange: (field: string, direction: string) => void;
  className?: string;
}

const sortOptions: SortOption[] = [
  { value: 'newest', label: '新着順', field: 'createdAt', direction: 'desc' },
  { value: 'oldest', label: '登録順', field: 'createdAt', direction: 'asc' },
  {
    value: 'price-low',
    label: '価格の安い順',
    field: 'price',
    direction: 'asc',
  },
  {
    value: 'price-high',
    label: '価格の高い順',
    field: 'price',
    direction: 'desc',
  },
  {
    value: 'name-asc',
    label: '名前順（あ→ん）',
    field: 'name',
    direction: 'asc',
  },
  {
    value: 'name-desc',
    label: '名前順（ん→あ）',
    field: 'name',
    direction: 'desc',
  },
  {
    value: 'rating-high',
    label: '評価の高い順',
    field: 'rating',
    direction: 'desc',
  },
  {
    value: 'rating-low',
    label: '評価の低い順',
    field: 'rating',
    direction: 'asc',
  },
  {
    value: 'popularity-high',
    label: '人気順',
    field: 'popularity',
    direction: 'desc',
  },
];

export const ProductSort: React.FC<ProductSortProps> = ({
  currentSort,
  onSortChange,
  className,
}) => {
  const currentOption = sortOptions.find(
    option =>
      option.field === currentSort.field &&
      option.direction === currentSort.direction
  );

  const handleSortSelect = (option: SortOption) => {
    onSortChange(option.field, option.direction);
  };

  const getSortIcon = (option: SortOption) => {
    const isActive =
      option.field === currentSort.field &&
      option.direction === currentSort.direction;

    if (!isActive) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }

    return option.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ArrowDown className="h-4 w-4 text-blue-600" />
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center gap-4',
        className
      )}
    >
      {/* 現在のソート表示 */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">並び順:</span>
        <span className="text-sm text-gray-900 font-medium">
          {currentOption?.label || '新着順'}
        </span>
      </div>

      {/* ソートオプション */}
      <div className="flex flex-wrap gap-2">
        {sortOptions.map(option => {
          const isActive =
            option.field === currentSort.field &&
            option.direction === currentSort.direction;

          return (
            <Button
              key={option.value}
              variant={isActive ? 'primary' : 'outline'}
              size="sm"
              onClick={() => handleSortSelect(option)}
              className={cn(
                'flex items-center gap-2 text-sm',
                isActive && 'bg-blue-600 text-white',
                !isActive && 'hover:bg-gray-50'
              )}
            >
              {getSortIcon(option)}
              <span className="hidden sm:block">{option.label}</span>
              <span className="sm:hidden">
                {option.label
                  .replace(/順$/, '')
                  .replace(/の高い|の低い|の安い|の新しい|順/, '')}
              </span>
            </Button>
          );
        })}
      </div>

      {/* クイックソート（よく使用されるもの） */}
      <div className="sm:ml-auto flex items-center gap-2">
        <span className="text-xs text-gray-500 hidden lg:block">クイック:</span>
        <div className="flex gap-1">
          {[
            { label: '安い順', field: 'price', direction: 'asc' },
            { label: '高い順', field: 'price', direction: 'desc' },
            { label: '人気順', field: 'popularity', direction: 'desc' },
            { label: '評価順', field: 'rating', direction: 'desc' },
          ].map(quickSort => {
            const isActive =
              quickSort.field === currentSort.field &&
              quickSort.direction === currentSort.direction;

            return (
              <Button
                key={`${quickSort.field}-${quickSort.direction}`}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                onClick={() =>
                  onSortChange(quickSort.field, quickSort.direction)
                }
                className={cn(
                  'text-xs px-2 py-1 h-auto',
                  isActive && 'bg-blue-600 text-white'
                )}
              >
                {quickSort.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
