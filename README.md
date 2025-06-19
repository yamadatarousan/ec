# ECストア - Amazon風ECサイト

モダンな技術スタックを使用して構築されたフルスタックECサイトです。Amazon風のUIデザインとUXを採用し、本格的なEコマース機能を提供します。

## 🌟 主な特徴

- **Amazon風UI/UX**: 使いやすいデザインとナビゲーション
- **フルスタック**: Next.js 15 App RouterとPrisma ORMによる完全なフルスタック実装
- **認証システム**: JWT認証による安全なユーザー管理
- **リアルタイム**: カート機能とリアルタイム在庫管理
- **レスポンシブデザイン**: モバイルファーストでPC/タブレット/スマホに対応
- **パフォーマンス最適化**: React.memo、キャッシュ戦略、バンドル最適化
- **CI/CD**: GitHub Actionsによる自動テストとデプロイ

## 🏗️ システムアーキテクチャ

```mermaid
graph TB
    subgraph "フロントエンド"
        A[Next.js 15 App Router] --> B[React Components]
        B --> C[TailwindCSS]
        B --> D[Context API]
        D --> E[Cart Context]
        D --> F[Auth Context]
    end
    
    subgraph "バックエンド"
        G[API Routes] --> H[Prisma ORM]
        H --> I[PostgreSQL]
        G --> J[JWT認証]
        G --> K[ミドルウェア]
    end
    
    subgraph "外部サービス"
        L[Vercel Deployment]
        M[GitHub Actions CI/CD]
        N[Unsplash Images]
    end
    
    A --> G
    J --> F
    I --> H
    L --> A
    M --> L
    N --> B
```

## 🗂️ プロジェクト構造

```mermaid
graph LR
    subgraph "アプリケーション構造"
        A[src/] --> B[app/]
        A --> C[components/]
        A --> D[contexts/]
        A --> E[lib/]
        A --> F[types/]
        
        B --> G[pages & API routes]
        C --> H[UI Components]
        C --> I[Feature Components]
        D --> J[State Management]
        E --> K[Utilities & Services]
        F --> L[TypeScript Types]
    end
```

## 🛒 主要機能フロー

### ユーザー認証フロー
```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as フロントエンド
    participant A as API
    participant D as データベース
    
    U->>F: ログイン要求
    F->>A: POST /api/auth/login
    A->>D: ユーザー認証
    D-->>A: ユーザー情報
    A-->>F: JWT トークン
    F-->>U: ログイン完了
    
    Note over F,A: JWT はローカルストレージに保存
    Note over F,A: 以降のAPIリクエストで認証ヘッダー使用
```

### 商品購入フロー
```mermaid
sequenceDiagram
    participant U as ユーザー
    participant P as 商品ページ
    participant C as カート
    participant O as 注文
    participant D as データベース
    
    U->>P: 商品を選択
    P->>C: カートに追加
    C->>D: カート更新
    
    U->>C: チェックアウト
    C->>O: 注文作成
    O->>D: 注文データ保存
    D-->>O: 注文確認
    O-->>U: 注文完了
```

## 🔧 技術スタック

### フロントエンド
- **Next.js 15**: React フレームワーク（App Router使用）
- **TypeScript**: 型安全性
- **TailwindCSS**: スタイリング
- **Lucide React**: アイコンライブラリ
- **React Hook Form**: フォーム管理

### バックエンド
- **Next.js API Routes**: サーバーサイドAPI
- **Prisma**: ORM（データベース操作）
- **PostgreSQL**: データベース
- **JWT**: 認証トークン
- **bcryptjs**: パスワードハッシュ化

### 開発・デプロイ
- **GitHub Actions**: CI/CD パイプライン
- **Vercel**: ホスティングプラットフォーム
- **ESLint & Prettier**: コード品質管理

## 📊 データベース設計

```mermaid
erDiagram
    User {
        id String PK
        email String UK
        name String
        password String
        avatar String
        createdAt DateTime
        updatedAt DateTime
    }
    
    Category {
        id String PK
        name String
        slug String UK
        description String
        createdAt DateTime
        updatedAt DateTime
    }
    
    Product {
        id String PK
        name String
        description String
        price Decimal
        comparePrice Decimal
        sku String UK
        stock Int
        categoryId String FK
        status ProductStatus
        createdAt DateTime
        updatedAt DateTime
    }
    
    ProductImage {
        id String PK
        productId String FK
        url String
        alt String
        order Int
    }
    
    CartItem {
        id String PK
        userId String FK
        productId String FK
        quantity Int
        createdAt DateTime
        updatedAt DateTime
    }
    
    Order {
        id String PK
        userId String FK
        status OrderStatus
        total Decimal
        shippingAddressId String FK
        notes String
        createdAt DateTime
        updatedAt DateTime
    }
    
    OrderItem {
        id String PK
        orderId String FK
        productId String FK
        quantity Int
        price Decimal
    }
    
    Address {
        id String PK
        userId String FK
        name String
        zipCode String
        prefecture String
        city String
        address String
        building String
        phone String
        isDefault Boolean
    }
    
    Review {
        id String PK
        userId String FK
        productId String FK
        rating Int
        title String
        comment String
        createdAt DateTime
    }

    User ||--o{ CartItem : has
    User ||--o{ Order : places
    User ||--o{ Address : has
    User ||--o{ Review : writes
    Category ||--o{ Product : contains
    Product ||--o{ ProductImage : has
    Product ||--o{ CartItem : in
    Product ||--o{ OrderItem : in
    Product ||--o{ Review : receives
    Order ||--o{ OrderItem : contains
    Order }o--|| Address : ships_to
```

## 🚀 パフォーマンス最適化

### React最適化
```mermaid
graph TD
    A[React最適化] --> B[React.memo]
    A --> C[useMemo]
    A --> D[useCallback]
    
    B --> E[ProductCard]
    B --> F[Header]
    B --> G[SearchSuggestions]
    
    C --> H[高コスト計算のメモ化]
    C --> I[画像処理]
    C --> J[価格計算]
    
    D --> K[イベントハンドラー]
    D --> L[API呼び出し]
    D --> M[状態更新関数]
```

### キャッシュ戦略
```mermaid
graph TB
    A[キャッシュシステム] --> B[メモリキャッシュ]
    A --> C[localStorage]
    
    B --> D[商品データ: 30秒]
    B --> E[商品詳細: 5分]
    B --> F[カート情報: 30秒]
    
    C --> G[カテゴリ: 30分]
    C --> H[検索結果: 1分]
    
    I[API Client] --> A
    J[Context API] --> A
```

## 📱 レスポンシブデザイン

```mermaid
graph LR
    A[デバイス対応] --> B[スマホ: ~768px]
    A --> C[タブレット: 768px~1024px]
    A --> D[PC: 1024px~]
    
    B --> E[モバイルメニュー]
    B --> F[縦型レイアウト]
    
    C --> G[グリッドレイアウト]
    C --> H[サイドバー折りたたみ]
    
    D --> I[フルレイアウト]
    D --> J[ホバーエフェクト]
```

## 🔒 セキュリティ機能

- **JWT認証**: 安全なトークンベース認証
- **パスワードハッシュ化**: bcryptによるパスワード暗号化
- **CORS設定**: 適切なクロスオリジン制御
- **入力検証**: Zodによるバリデーション
- **SQLインジェクション対策**: Prisma ORMによる安全なクエリ

## 🛠️ 開発環境セットアップ

### 前提条件
- Node.js 18+
- PostgreSQL
- npm または yarn

### インストール

```bash
# リポジトリのクローン
git clone <repository-url>
cd ec

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してデータベース接続情報等を設定

# データベースのセットアップ
npx prisma migrate dev
npx prisma db seed

# 開発サーバーの起動
npm run dev
```

### 利用可能なスクリプト

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run start        # 本番サーバー起動
npm run lint         # ESLintチェック
npm run lint:fix     # ESLint自動修正
npm run type-check   # TypeScriptチェック
```

## 🔧 CI/CD パイプライン

```mermaid
graph LR
    A[GitHub Push] --> B[GitHub Actions]
    B --> C[依存関係インストール]
    C --> D[TypeScript チェック]
    D --> E[ESLint チェック]
    E --> F[テスト実行]
    F --> G[ビルド]
    G --> H[Vercel デプロイ]
    
    subgraph "セキュリティ"
        I[依存関係スキャン]
        J[コード解析]
    end
    
    B --> I
    B --> J
```

## 📋 API エンドポイント

### 認証
- `POST /api/auth/login` - ユーザーログイン
- `POST /api/auth/register` - ユーザー登録
- `GET /api/auth/me` - 現在のユーザー情報取得

### 商品
- `GET /api/products` - 商品一覧取得
- `GET /api/products/[id]` - 商品詳細取得
- `GET /api/categories` - カテゴリ一覧取得

### カート
- `GET /api/cart` - カート内容取得
- `POST /api/cart` - カートに商品追加
- `PATCH /api/cart/[productId]` - カート内商品数量更新
- `DELETE /api/cart/[productId]` - カートから商品削除

### 注文
- `GET /api/orders` - 注文履歴取得
- `POST /api/orders` - 新規注文作成
- `GET /api/orders/[id]` - 注文詳細取得

## 🎯 今後の拡張予定

- [ ] 決済システム統合（Stripe等）
- [ ] 商品レビュー・評価システム
- [ ] ウィッシュリスト機能
- [ ] 商品推薦エンジン
- [ ] 管理者ダッシュボード
- [ ] 在庫管理システム
- [ ] メール通知機能
- [ ] PWA対応

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。大きな変更を行う前に、まずイシューを作成して議論してください。

---

**開発者**: Claude Code Assistant  
**技術スタック**: Next.js 15, TypeScript, Prisma, PostgreSQL, TailwindCSS  
**デプロイ**: Vercel  
