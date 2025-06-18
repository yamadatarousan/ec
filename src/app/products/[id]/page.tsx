import { notFound } from 'next/navigation';
import { getProductById } from '@/data/mockProducts';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * 商品詳細ページ（サーバーコンポーネント）
 * 商品IDから商品情報を取得し、クライアントコンポーネントに渡す
 */
export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

/**
 * メタデータの生成
 */
export async function generateMetadata({ params }: ProductDetailPageProps) {
  const product = getProductById(params.id);

  if (!product) {
    return {
      title: '商品が見つかりません | ECストア',
    };
  }

  return {
    title: `${product.name} | ECストア`,
    description: product.description,
  };
}
