import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

/**
 * 利用規約ページコンポーネント
 */
export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">利用規約</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 prose prose-gray max-w-none">
          <div className="text-sm text-gray-600 mb-6">
            最終更新日: 2024年1月1日
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. 総則</h2>
            <p className="text-gray-700 leading-relaxed">
              本利用規約（以下「本規約」）は、株式会社ECストア（以下「当社」）が
              運営するウェブサイト「ECストア」（以下「本サービス」）の利用条件を
              定めるものです。利用者は、本サービスを利用することにより、
              本規約に同意したものとみなされます。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. 定義</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              本規約において、以下の用語は次の意味を有します：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>「利用者」: 本サービスを利用する全ての方</li>
              <li>「会員」: 本サービスに会員登録を行った利用者</li>
              <li>「商品」: 本サービスで販売される商品</li>
              <li>
                「コンテンツ」: 本サービス上に掲載される文章、画像、動画等の情報
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              3. 会員登録
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              会員登録を希望する方は、以下の条件を満たす必要があります：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>18歳以上であること（未成年者は保護者の同意が必要）</li>
              <li>正確かつ最新の情報を提供すること</li>
              <li>本規約及び関連法令を遵守すること</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              4. 商品の注文と契約
            </h2>
            <p className="text-gray-700 leading-relaxed">
              商品の注文は、以下の手順で行われます：
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-gray-700 mt-4">
              <li>利用者が商品をカートに追加し、注文手続きを完了</li>
              <li>当社が注文を確認し、注文確認メールを送信</li>
              <li>注文確認メールの送信をもって売買契約が成立</li>
            </ol>
            <p className="text-gray-700 leading-relaxed mt-4">
              商品の在庫切れや価格変更等により、ご注文をお受けできない場合があります。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. 支払い</h2>
            <p className="text-gray-700 leading-relaxed">
              支払い方法は以下から選択できます：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>クレジットカード（VISA、MasterCard、JCB等）</li>
              <li>銀行振込</li>
              <li>コンビニエンスストア決済</li>
              <li>代金引換</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              支払いは商品注文時に行うものとし、支払い完了後に商品の配送準備を開始します。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. 配送</h2>
            <p className="text-gray-700 leading-relaxed">
              配送に関する条件は以下の通りです：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>配送料: 全国一律送料無料</li>
              <li>配送期間: 注文確定から1-3営業日以内に発送</li>
              <li>配送業者: ヤマト運輸、佐川急便等</li>
              <li>配送時間の指定が可能（地域により制限あり）</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              7. 返品・交換
            </h2>
            <p className="text-gray-700 leading-relaxed">
              以下の条件で返品・交換を承ります：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>商品到着後30日以内のご連絡</li>
              <li>未使用・未開封の状態（食品等一部例外あり）</li>
              <li>商品の初期不良や当社のミスによる場合は、返送料当社負担</li>
              <li>お客様都合の場合は、返送料お客様負担</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              8. 禁止事項
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              利用者は以下の行為を行ってはいけません：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>法令に違反する行為</li>
              <li>当社や他の利用者の権利を侵害する行為</li>
              <li>虚偽の情報を登録する行為</li>
              <li>システムに負荷をかける行為</li>
              <li>転売目的での大量購入</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              9. 免責事項
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、以下について一切の責任を負いません：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>システムの一時的な停止や障害</li>
              <li>第三者による不正アクセスや情報の改ざん</li>
              <li>利用者間のトラブル</li>
              <li>天災地変等の不可抗力による損害</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              10. 規約の変更
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、必要に応じて本規約を変更することができます。
              変更後の規約は、本サイトに掲載した時点から効力を生じます。
              利用者は、本サービスを継続利用することにより、
              変更後の規約に同意したものとみなされます。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              11. 準拠法・管轄裁判所
            </h2>
            <p className="text-gray-700 leading-relaxed">
              本規約は日本法に準拠し、本規約に関する一切の紛争は、
              東京地方裁判所を第一審の専属的合意管轄裁判所とします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              12. お問い合わせ
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                本規約に関するお問い合わせは、以下までご連絡ください：
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <div>
                  <strong>株式会社ECストア</strong>
                </div>
                <div>カスタマーサポート</div>
                <div>メール: support@ecstore.com</div>
                <div>電話: 03-1234-5678</div>
                <div>受付時間: 平日 9:00-18:00</div>
              </div>
            </div>
          </section>

          <div className="text-center mt-12">
            <Link href="/contact">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                お問い合わせ
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
