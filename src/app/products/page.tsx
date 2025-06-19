import { Suspense } from 'react';
import { getProducts, getCategories } from '@/lib/services/product';
import { ProductsClient } from './ProductsClient';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

/**
 * 商品一覧ページ（サーバーコンポーネント）
 */
export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;

  // クエリパラメータからフィルター設定を構築
  const filters = {
    category: params.category,
    search: params.search,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  };

  const sort = {
    field: (params.sortBy as 'name' | 'price' | 'createdAt') || 'createdAt',
    direction: (params.sortOrder as 'asc' | 'desc') || 'desc',
  };

  const page = Number(params.page) || 1;

  // データを並行して取得
  const [productsResult, categories] = await Promise.all([
    getProducts(filters, sort, { page, limit: 20 }),
    getCategories(),
  ]);

  // Decimal型をnumberに変換
  const serializedProducts = productsResult.products.map(product => ({
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">商品一覧</h1>
          <p className="text-gray-600">
            {productsResult.pagination.total}件の商品が見つかりました
          </p>
        </div>

        <Suspense fallback={<div>読み込み中...</div>}>
          <ProductsClient
            initialProducts={serializedProducts}
            categories={categories}
            pagination={productsResult.pagination}
            initialFilters={filters}
            initialSort={sort}
          />
        </Suspense>
      </div>
    </div>
  );
}

export async function generateMetadata({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const category = params.category;
  const search = params.search;

  let title = '商品一覧 | ECストア';

  if (category) {
    title = `${category} | ECストア`;
  } else if (search) {
    title = `「${search}」の検索結果 | ECストア`;
  }

  return {
    title,
    description:
      'Amazon風ECサイトの商品一覧ページ。様々な商品をお探しいただけます。',
  };
}
