'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchSuggestionsProps {
  query: string;
  isVisible: boolean;
  onClose: () => void;
  onSelect: (query: string) => void;
}

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'product' | 'category' | 'recent' | 'trending';
}

export function SearchSuggestions({
  query,
  isVisible,
  onClose,
  onSelect,
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 検索候補を取得
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        // 簡易的な候補生成（実際のAPIでは検索候補エンドポイントを使用）
        const mockSuggestions: SearchSuggestion[] = [
          { id: '1', name: `${query} MacBook`, type: 'product' as const },
          { id: '2', name: `${query} iPhone`, type: 'product' as const },
          { id: '3', name: `${query}関連商品`, type: 'category' as const },
          { id: '4', name: query, type: 'recent' as const },
        ].filter(s => s.name.toLowerCase().includes(query.toLowerCase()));

        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('検索候補取得エラー:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // 外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, onClose]);

  if (!isVisible || (!loading && suggestions.length === 0)) {
    return null;
  }

  const getIcon = (type: SearchSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'trending':
        return <TrendingUp className="h-4 w-4 text-orange-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
    >
      {loading ? (
        <div className="p-4 text-center text-gray-500">
          <Search className="h-5 w-5 animate-spin mx-auto mb-2" />
          検索中...
        </div>
      ) : (
        <div className="py-2">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.id}
              onClick={() => onSelect(suggestion.name)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left transition-colors"
            >
              {getIcon(suggestion.type)}
              <span className="flex-1 text-gray-900">{suggestion.name}</span>
              {suggestion.type === 'trending' && (
                <span className="text-xs text-orange-500 font-medium">
                  人気
                </span>
              )}
            </button>
          ))}

          {query.trim() && (
            <div className="border-t border-gray-100 mt-2 pt-2">
              <Link
                href={`/products?search=${encodeURIComponent(query.trim())}`}
                onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-left transition-colors"
              >
                <Search className="h-4 w-4 text-blue-500" />
                <span className="flex-1 text-blue-600">
                  「<strong>{query}</strong>」で検索
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
