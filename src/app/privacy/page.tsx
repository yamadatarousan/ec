import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';

/**
 * プライバシーポリシーページコンポーネント
 */
export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900">
          プライバシーポリシー
        </h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 prose prose-gray max-w-none">
          <div className="text-sm text-gray-600 mb-6">
            最終更新日: 2024年1月1日
          </div>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              1. 基本方針
            </h2>
            <p className="text-gray-700 leading-relaxed">
              株式会社ECストア（以下「当社」）は、お客様の個人情報の保護を重要視し、
              個人情報の保護に関する法律（個人情報保護法）をはじめとする関連法令を遵守し、
              お客様の個人情報を適切に取り扱います。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              2. 収集する個人情報
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              当社では、以下の個人情報を収集させていただく場合があります：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>氏名、住所、電話番号、メールアドレス</li>
              <li>クレジットカード情報等の決済に関する情報</li>
              <li>購入履歴、閲覧履歴、検索履歴</li>
              <li>お問い合わせ内容</li>
              <li>その他、サービス提供に必要な情報</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              3. 個人情報の利用目的
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              収集した個人情報は、以下の目的で利用いたします：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>商品の販売及び配送</li>
              <li>お客様からのお問い合わせへの対応</li>
              <li>アフターサービス、メンテナンス</li>
              <li>新商品やサービスのご案内</li>
              <li>統計データの作成（個人を特定できない形式）</li>
              <li>不正利用の防止</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              4. 個人情報の第三者提供
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、法令に基づく場合を除き、お客様の同意なく個人情報を第三者に
              提供することはありません。ただし、以下の場合については第三者提供を
              行うことがあります：
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-4">
              <li>配送業者への配送に必要な情報の提供</li>
              <li>決済代行業者への決済に必要な情報の提供</li>
              <li>法令により開示が求められた場合</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              5. 個人情報の管理
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、個人情報への不正アクセス、紛失、破壊、改ざん及び漏洩などを
              防止するため、適切な安全管理措置を講じます。また、個人情報を取り扱う
              従業員に対して、必要かつ適切な監督を行います。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              6. Cookieの使用について
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当サイトでは、サービスの利便性向上のためCookieを使用しています。
              Cookieは、お客様のコンピュータに保存される小さなテキストファイルです。
              ブラウザの設定によりCookieを無効にすることも可能ですが、
              その場合サイトの一部機能が制限される場合があります。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              7. 個人情報の開示・訂正・削除
            </h2>
            <p className="text-gray-700 leading-relaxed">
              お客様は、ご自身の個人情報について、開示、訂正、利用停止、削除を
              求めることができます。これらのご要望は、当社お問い合わせ窓口まで
              ご連絡ください。適切な本人確認を行った上で、合理的な期間内に対応いたします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              8. プライバシーポリシーの変更
            </h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、法令の改正やサービス内容の変更等に伴い、本プライバシーポリシーを
              変更することがあります。変更後のプライバシーポリシーは、当サイトに
              掲載した時点から効力を生じるものとします。
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              9. お問い合わせ窓口
            </h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください：
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <div>
                  <strong>株式会社ECストア</strong>
                </div>
                <div>個人情報保護担当</div>
                <div>メール: privacy@ecstore.com</div>
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
