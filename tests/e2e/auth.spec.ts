import { test, expect } from '@playwright/test';

test.describe('認証機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ユーザー登録からログインまでの流れ', async ({ page }) => {
    // ユーザー登録ページに移動
    await page.click('text=サインアップ');
    await expect(page).toHaveURL('/auth/register');

    // 登録フォームに入力
    const timestamp = Date.now();
    const testEmail = `test-${timestamp}@example.com`;

    await page.fill('input[name="name"]', 'テストユーザー');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');

    // 利用規約に同意
    await page.check('input[type="checkbox"]');

    // 登録ボタンをクリック
    await page.click('button[type="submit"]');

    // 登録成功後、ホームページにリダイレクト
    await expect(page).toHaveURL('/');

    // ログイン状態を確認（ユーザー名が表示される）
    await expect(page.locator('text=テストユーザー')).toBeVisible();

    // ログアウト
    await page.click('text=ログアウト');
    await expect(page.locator('text=ログイン')).toBeVisible();

    // 再度ログイン
    await page.click('text=ログイン');
    await expect(page).toHaveURL('/auth/login');

    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // ログイン成功を確認
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=テストユーザー')).toBeVisible();
  });

  test('ログインエラーハンドリング', async ({ page }) => {
    // ログインページに移動
    await page.click('text=ログイン');
    await expect(page).toHaveURL('/auth/login');

    // 間違ったメールアドレスとパスワードでログイン試行
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示される
    await expect(page.locator('text=認証情報が正しくありません')).toBeVisible();

    // ログインページに留まる
    await expect(page).toHaveURL('/auth/login');
  });

  test('ユーザー登録バリデーション', async ({ page }) => {
    // ユーザー登録ページに移動
    await page.click('text=サインアップ');
    await expect(page).toHaveURL('/auth/register');

    // 空のフォームで送信
    await page.click('button[type="submit"]');

    // バリデーションエラーが表示される
    await expect(page.locator('text=名前は必須です')).toBeVisible();
    await expect(page.locator('text=メールアドレスは必須です')).toBeVisible();
    await expect(page.locator('text=パスワードは必須です')).toBeVisible();

    // 無効なメールアドレス
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(
      page.locator('text=有効なメールアドレスを入力してください')
    ).toBeVisible();

    // パスワードの不一致
    await page.fill('input[name="name"]', 'テストユーザー');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'different-password');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=パスワードが一致しません')).toBeVisible();
  });

  test('認証が必要なページの保護', async ({ page }) => {
    // 認証が必要なページに直接アクセス
    await page.goto('/account');

    // ログインページにリダイレクトされる
    await expect(page).toHaveURL('/auth/login');

    // アクセス拒否メッセージが表示される
    await expect(page.locator('text=ログインが必要です')).toBeVisible();
  });

  test('管理者ページの保護', async ({ page }) => {
    // 管理者ページに直接アクセス
    await page.goto('/admin');

    // 管理者ログインページにリダイレクトされる
    await expect(page).toHaveURL('/admin/login');
  });
});
