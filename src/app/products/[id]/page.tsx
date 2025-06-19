import { notFound } from 'next/navigation';
import { getProductById, getRelatedProducts } from '@/lib/services/product';
import { ProductDetailClient } from './ProductDetailClient';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

/**
 * 商品詳細ページ（サーバーコンポーネント）
 * 商品IDから商品情報を取得し、クライアントコンポーネントに渡す
 */
export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const [product, relatedProducts] = await Promise.all([
    getProductById(id),
    getRelatedProducts(id, 4),
  ]);

  if (!product) {
    notFound();
  }

  // Decimal型をnumberに変換してクライアントコンポーネントに渡す
  const serializedProduct = {
    ...product,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    weight: product.weight ? Number(product.weight) : null,
  };

  const serializedRelatedProducts = relatedProducts.map(p => ({
    ...p,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
  }));

  return (
    <ProductDetailClient
      product={serializedProduct}
      relatedProducts={serializedRelatedProducts}
    />
  );
}

/**
 * メタデータの生成
 */
export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

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
