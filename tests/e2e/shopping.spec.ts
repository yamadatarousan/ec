import { test, expect } from '@playwright/test';

test.describe('ショッピング機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('商品検索から購入までの流れ', async ({ page }) => {
    // 商品検索
    await page.fill('input[placeholder*="商品を検索"]', 'テスト商品');
    await page.press('input[placeholder*="商品を検索"]', 'Enter');

    // 検索結果ページ
    await expect(page).toHaveURL(/\/products\?.*search=/);
    await expect(page.locator('text=検索結果')).toBeVisible();

    // 商品カードをクリックして詳細ページへ
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page).toHaveURL(/\/products\//);

    // 商品詳細ページで情報を確認
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=¥')).toBeVisible();
    await expect(page.locator('text=在庫')).toBeVisible();

    // カートに追加
    await page.click('button:has-text("カートに追加")');

    // カート追加成功メッセージ
    await expect(page.locator('text=カートに追加しました')).toBeVisible();

    // カートアイコンのバッジが更新される
    await expect(page.locator('[data-testid="cart-badge"]')).toHaveText('1');

    // カートページに移動
    await page.click('[data-testid="cart-button"]');
    await expect(page).toHaveURL('/cart');

    // カート内容を確認
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    await expect(page.locator('text=合計')).toBeVisible();

    // 数量変更
    await page.click('[data-testid="quantity-increase"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue(
      '2'
    );

    // チェックアウトページへ
    await page.click('text=チェックアウト');

    // 未ログインの場合、ログインページにリダイレクト
    if (await page.locator('text=ログイン').isVisible()) {
      // テストユーザーでログイン
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
    }

    // チェックアウトページ
    await expect(page).toHaveURL('/checkout');

    // 配送先住所入力
    await page.fill('input[name="name"]', 'テスト太郎');
    await page.fill('input[name="address1"]', '東京都渋谷区1-1-1');
    await page.fill('input[name="city"]', '渋谷区');
    await page.fill('input[name="state"]', '東京都');
    await page.fill('input[name="zipCode"]', '150-0001');
    await page.fill('input[name="phone"]', '090-1234-5678');

    // 注文確定
    await page.click('text=注文を確定');

    // 注文完了ページ
    await expect(page).toHaveURL(/\/orders\//);
    await expect(page.locator('text=注文が完了しました')).toBeVisible();
    await expect(page.locator('text=注文番号')).toBeVisible();
  });

  test('商品フィルタリング機能', async ({ page }) => {
    // 商品一覧ページに移動
    await page.goto('/products');

    // カテゴリーフィルター
    await page.click('text=カテゴリー');
    await page.click('text=エレクトロニクス');
    await expect(page).toHaveURL(/\/products\?.*category=/);

    // 価格フィルター
    await page.click('text=価格');
    await page.fill('input[placeholder="最低価格"]', '1000');
    await page.fill('input[placeholder="最高価格"]', '5000');
    await page.click('text=適用');
    await expect(page).toHaveURL(/\/products\?.*minPrice=/);

    // 評価フィルター
    await page.click('text=評価');
    await page.click('[data-testid="rating-filter-4"]');
    await expect(page).toHaveURL(/\/products\?.*rating=/);

    // ソート機能
    await page.selectOption('select[name="sort"]', 'price-asc');
    await expect(page).toHaveURL(/\/products\?.*sort=/);

    // フィルターをクリア
    await page.click('text=フィルターをクリア');
    await expect(page).toHaveURL('/products');
  });

  test('ウィッシュリスト機能', async ({ page }) => {
    // 商品詳細ページに移動
    await page.goto('/products/test-product-id');

    // ウィッシュリストに追加（ログインが必要）
    await page.click('[data-testid="wishlist-button"]');

    // ログインページにリダイレクトされる場合
    if (await page.locator('text=ログイン').isVisible()) {
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // 商品詳細ページに戻る
      await page.goto('/products/test-product-id');
      await page.click('[data-testid="wishlist-button"]');
    }

    // ウィッシュリスト追加成功
    await expect(
      page.locator('text=ウィッシュリストに追加しました')
    ).toBeVisible();

    // ウィッシュリストページに移動
    await page.goto('/wishlist');
    await expect(page.locator('[data-testid="wishlist-item"]')).toBeVisible();

    // ウィッシュリストから削除
    await page.click('[data-testid="remove-wishlist"]');
    await expect(
      page.locator('text=ウィッシュリストから削除しました')
    ).toBeVisible();
  });

  test('商品レビュー機能', async ({ page }) => {
    // 商品詳細ページに移動
    await page.goto('/products/test-product-id');

    // レビューセクションまでスクロール
    await page.locator('text=レビュー').scrollIntoViewIfNeeded();

    // ログインが必要な場合
    if (await page.locator('text=ログインしてレビューを投稿').isVisible()) {
      // ログイン
      await page.goto('/auth/login');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // 商品詳細ページに戻る
      await page.goto('/products/test-product-id');
      await page.locator('text=レビュー').scrollIntoViewIfNeeded();
    }

    // レビューを投稿
    await page.click('[data-testid="rating-5"]'); // 5つ星
    await page.fill('textarea[name="comment"]', 'とても良い商品でした！');
    await page.click('text=レビューを投稿');

    // レビュー投稿成功
    await expect(page.locator('text=レビューを投稿しました')).toBeVisible();
    await expect(page.locator('text=とても良い商品でした！')).toBeVisible();
  });

  test('レスポンシブデザイン（モバイル）', async ({ page }) => {
    // モバイルビューポートに設定
    await page.setViewportSize({ width: 375, height: 667 });

    // ホームページでモバイルメニューを確認
    await page.goto('/');
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // 商品一覧のモバイル表示
    await page.goto('/products');
    await expect(page.locator('[data-testid="product-grid"]')).toBeVisible();

    // 商品詳細のモバイル表示
    await page.click('[data-testid="product-card"]:first-child');
    await expect(page.locator('[data-testid="product-image"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="add-to-cart-mobile"]')
    ).toBeVisible();
  });
});
