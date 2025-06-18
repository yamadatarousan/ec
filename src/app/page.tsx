/**
 * ホームページコンポーネント
 * ECサイトのメインページを表示
 */
export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="container-custom py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          ECサイトへようこそ
        </h1>
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-6">
            Amazon風のECサイトを構築中です
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn-primary">商品を見る</button>
            <button className="btn-secondary">ログイン</button>
          </div>
        </div>
      </div>
    </main>
  );
}
