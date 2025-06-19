import Link from 'next/link';
import {
  Building2,
  Users,
  Target,
  Heart,
  Shield,
  Truck,
  ArrowLeft,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

/**
 * 会社情報ページコンポーネント
 * 会社概要、ミッション、サービスについて表示
 */
export default function AboutPage() {
  return (
    <div className="container-custom py-6">
      {/* ヘッダー */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>ホームに戻る</span>
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">会社情報</h1>
      </div>

      <div className="space-y-12">
        {/* 会社概要 */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              私たちについて
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              ECストアは、お客様に最高のショッピング体験を提供することを使命とする
              オンライン総合通販サイトです。2024年の設立以来、品質の高い商品と
              優れたカスタマーサービスを通じて、多くのお客様に愛され続けています。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ミッション
                </h3>
                <p className="text-gray-600">
                  お客様の生活をより豊かにする商品とサービスを提供し、
                  便利で安心なショッピング体験を創造します。
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  バリュー
                </h3>
                <p className="text-gray-600">
                  お客様第一、品質重視、信頼関係の構築を大切にし、
                  持続可能な成長を目指します。
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  ビジョン
                </h3>
                <p className="text-gray-600">
                  日本で最も信頼され、愛されるオンラインショッピング
                  プラットフォームになることを目指します。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* 会社データ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            会社データ
          </h2>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Building2 className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900">会社名</div>
                      <div className="text-gray-600">株式会社ECストア</div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Building2 className="h-6 w-6 text-orange-500 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900">所在地</div>
                      <div className="text-gray-600">
                        〒100-0001
                        <br />
                        東京都千代田区千代田1-1-1
                        <br />
                        ECストアビル 5F
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Users className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900">設立</div>
                      <div className="text-gray-600">2024年1月</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Users className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900">代表者</div>
                      <div className="text-gray-600">
                        代表取締役社長 田中 太郎
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Building2 className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900">資本金</div>
                      <div className="text-gray-600">1億円</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Users className="h-6 w-6 text-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900">従業員数</div>
                      <div className="text-gray-600">150名</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* サービス特徴 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            私たちのサービス
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Truck className="h-8 w-8 text-orange-500" />
                  <h3 className="text-lg font-bold text-gray-900">
                    迅速な配送
                  </h3>
                </div>
                <p className="text-gray-600">
                  全国送料無料で、注文から最短翌日配送。
                  お急ぎの商品も安心してご注文いただけます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-8 w-8 text-orange-500" />
                  <h3 className="text-lg font-bold text-gray-900">
                    安心の保証
                  </h3>
                </div>
                <p className="text-gray-600">
                  商品到着後30日間の返品保証。
                  万が一の際も安心のサポート体制を整えています。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Heart className="h-8 w-8 text-orange-500" />
                  <h3 className="text-lg font-bold text-gray-900">
                    厳選された商品
                  </h3>
                </div>
                <p className="text-gray-600">
                  品質にこだわった商品のみを厳選。
                  お客様に本当に良いものだけをお届けします。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* お問い合わせセクション */}
        <section className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            もっと詳しく知りたい方へ
          </h2>
          <p className="text-gray-600 mb-6">
            ご質問やご不明な点がございましたら、 お気軽にお問い合わせください。
          </p>
          <Link href="/contact">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
              お問い合わせ
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
