import Link from 'next/link';

/**
 * サイトフッターコンポーネント
 * Amazon風のフッターレイアウトを採用
 * 会社情報、リンク、著作権情報を含む
 */
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* メインフッターコンテンツ */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 会社情報 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">ECストア</h3>
            <p className="text-gray-400 text-sm mb-4">
              Amazon風のECサイトサンプル。
              <br />
              学習・実験用のプロジェクトです。
            </p>
            <div className="flex items-center space-x-2">
              <div className="bg-orange-400 text-gray-900 px-2 py-1 rounded text-sm font-bold">
                EC
              </div>
              <span className="text-sm">ストア</span>
            </div>
          </div>

          {/* サービス情報 */}
          <div>
            <h4 className="text-md font-medium mb-4">サービス</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  会社概要
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  配送について
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  返品・交換
                </Link>
              </li>
            </ul>
          </div>

          {/* アカウント */}
          <div>
            <h4 className="text-md font-medium mb-4">アカウント</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  マイアカウント
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  注文履歴
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  お気に入り
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  配送先住所
                </Link>
              </li>
            </ul>
          </div>

          {/* ヘルプ */}
          <div>
            <h4 className="text-md font-medium mb-4">ヘルプ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ヘルプセンター
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  利用規約
                </Link>
              </li>
              <li>
                <Link
                  href={'#' as any}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  セキュリティ
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 著作権情報 */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © 2025 ECストア. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              このサイトは学習目的で作成されたサンプルです
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
