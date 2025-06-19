import Link from 'next/link';
import { Button, Card, CardContent } from '@/components/ui';
import { RecommendedProducts } from '@/components/features/RecommendedProducts';

/**
 * ホームページコンポーネント
 * ECサイトのメインページを表示
 * 商品カテゴリーやおすすめ商品を表示
 */
export default function Home() {
  return (
    <div className="space-y-8">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-r from-orange-100 to-yellow-100">
        <div className="container-custom py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              ECストアへようこそ
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Amazon風のECサイトで、豊富な商品ラインナップから
              <br />
              お気に入りの商品を見つけてください
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-md transition-colors"
              >
                商品を探す
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-md transition-colors"
              >
                カテゴリーから探す
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* カテゴリーセクション */}
      <section className="container-custom py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          人気のカテゴリー
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: '家電・PC', href: '/products', emoji: '💻' },
            { name: 'ファッション', href: '/products', emoji: '👕' },
            { name: '本・雑誌', href: '/products', emoji: '📚' },
            { name: 'ホーム・キッチン', href: '/products', emoji: '🏠' },
            { name: 'スポーツ', href: '/products', emoji: '⚽' },
            { name: 'その他', href: '/products', emoji: '🎁' },
          ].map(category => (
            <Card
              key={category.name}
              className="hover:shadow-md transition-shadow cursor-pointer"
            >
              <Link href={category.href as any}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">{category.emoji}</div>
                  <h3 className="font-medium text-sm">{category.name}</h3>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* 特別セクション */}
      <section className="bg-gray-50">
        <div className="container-custom py-12">
          <div className="grid md:grid-cols-2 gap-8">
            <Card variant="elevated">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  🔥 今日のタイムセール
                </h3>
                <p className="text-gray-600 mb-6">
                  期間限定の特別価格で人気商品をお得にゲット！
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-md transition-colors"
                >
                  セール商品を見る
                </Link>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  ⭐ おすすめ商品
                </h3>
                <p className="text-gray-600 mb-6">
                  厳選されたおすすめ商品をチェックしてみてください。
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-md transition-colors"
                >
                  おすすめを見る
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 推薦商品セクション */}
      <section className="container-custom py-12">
        <RecommendedProducts
          title="最近閲覧した商品"
          type="recent"
          limit={6}
          className="mb-12"
        />

        <RecommendedProducts
          title="あなたにおすすめの商品"
          type="general"
          limit={8}
          className="mb-12"
        />
      </section>
    </div>
  );
}
