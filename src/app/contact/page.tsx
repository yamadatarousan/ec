'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';

/**
 * お問い合わせページコンポーネント
 * お問い合わせフォームと会社情報を表示
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * フォーム送信処理
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 実際の実装では、ここでAPIにデータを送信
    await new Promise(resolve => setTimeout(resolve, 2000)); // 仮の待機

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  /**
   * 入力値変更処理
   */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              お問い合わせを受け付けました
            </h1>
            <p className="text-gray-600">
              お問い合わせありがとうございます。
              <br />
              通常2-3営業日以内にご返信いたします。
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900">
                ホームに戻る
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => setIsSubmitted(false)}
              className="text-gray-600"
            >
              別のお問い合わせをする
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold text-gray-900">お問い合わせ</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* お問い合わせフォーム */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                お問い合わせフォーム
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* お名前 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="田中 太郎"
                    className="w-full"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="example@email.com"
                    className="w-full"
                  />
                </div>

                {/* お問い合わせ種類 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ種類 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="general">一般的なお問い合わせ</option>
                    <option value="product">商品について</option>
                    <option value="order">注文について</option>
                    <option value="shipping">配送について</option>
                    <option value="return">返品・交換について</option>
                    <option value="technical">技術的な問題</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                {/* 件名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    件名 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    placeholder="お問い合わせの件名を入力してください"
                    className="w-full"
                  />
                </div>

                {/* メッセージ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    メッセージ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="お問い合わせ内容を詳しくご記入ください"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* 送信ボタン */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                >
                  {isSubmitting ? (
                    <>送信中...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      送信する
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 会社情報・連絡先 */}
        <div className="space-y-6">
          {/* 基本情報 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                お問い合わせ先
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">電話番号</div>
                    <div className="text-gray-600">03-1234-5678</div>
                    <div className="text-sm text-gray-500">
                      受付時間: 平日 9:00-18:00
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">
                      メールアドレス
                    </div>
                    <div className="text-gray-600">support@ecstore.com</div>
                    <div className="text-sm text-gray-500">
                      24時間受付（返信は営業時間内）
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-orange-500 mt-0.5" />
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

                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">営業時間</div>
                    <div className="text-gray-600">
                      平日: 9:00 - 18:00
                      <br />
                      土日祝: 定休日
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* よくある質問 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                よくある質問
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Q. 配送料はいくらですか？
                  </div>
                  <div className="text-gray-600 text-sm">
                    A. 全国一律送料無料です。
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Q. 返品はできますか？
                  </div>
                  <div className="text-gray-600 text-sm">
                    A. 商品到着後30日以内であれば返品可能です。
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    Q. 支払い方法は何がありますか？
                  </div>
                  <div className="text-gray-600 text-sm">
                    A.
                    クレジットカード、銀行振込、コンビニ払いに対応しています。
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
