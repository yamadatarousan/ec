export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  orderDate: Date;
}

export interface InventoryAlertData {
  productName: string;
  productSku: string;
  currentStock: number;
  threshold: number;
  categoryName: string;
}

export interface PasswordResetData {
  customerName: string;
  resetLink: string;
  expiresAt: Date;
}

export interface WelcomeEmailData {
  customerName: string;
  customerEmail: string;
}

/**
 * 注文確認メールテンプレート
 */
export function generateOrderConfirmationEmail(
  data: OrderConfirmationData
): EmailTemplate {
  const {
    orderNumber,
    customerName,
    items,
    totalAmount,
    shippingCost,
    taxAmount,
    shippingAddress,
    orderDate,
  } = data;

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;
  const formatDate = (date: Date) => date.toLocaleDateString('ja-JP');

  const subject = `ご注文確認 - 注文番号: ${orderNumber}`;

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Hiragino Sans', 'Yu Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .order-info { background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background: #f8f9fa; font-weight: bold; }
        .total-row { font-weight: bold; background: #f8f9fa; }
        .shipping-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ご注文ありがとうございます</h1>
          <p>注文番号: <strong>${orderNumber}</strong></p>
        </div>

        <p>${customerName} 様</p>
        <p>この度は当店をご利用いただき、誠にありがとうございます。<br>
        ご注文の詳細をお知らせいたします。</p>

        <div class="order-info">
          <h3>注文情報</h3>
          <p><strong>注文日:</strong> ${formatDate(orderDate)}</p>
          <p><strong>注文番号:</strong> ${orderNumber}</p>
        </div>

        <h3>ご注文商品</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>商品名</th>
              <th>数量</th>
              <th>単価</th>
              <th>小計</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">商品合計</td>
              <td>${formatPrice(totalAmount - shippingCost - taxAmount)}</td>
            </tr>
            <tr>
              <td colspan="3">送料</td>
              <td>${formatPrice(shippingCost)}</td>
            </tr>
            <tr>
              <td colspan="3">消費税</td>
              <td>${formatPrice(taxAmount)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">合計金額</td>
              <td>${formatPrice(totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div class="shipping-info">
          <h3>お届け先</h3>
          <p><strong>${shippingAddress.name}</strong></p>
          <p>〒${shippingAddress.zipCode}</p>
          <p>${shippingAddress.state} ${shippingAddress.city}</p>
          <p>${shippingAddress.address1}</p>
          ${shippingAddress.address2 ? `<p>${shippingAddress.address2}</p>` : ''}
        </div>

        <p>商品の発送準備が整い次第、発送完了のお知らせをお送りいたします。</p>
        
        <div class="footer">
          <p>ご不明な点がございましたら、お気軽にお問い合わせください。</p>
          <p>ECストア カスタマーサポート</p>
          <p>support@example.com | 03-1234-5678</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
ご注文ありがとうございます

${customerName} 様

この度は当店をご利用いただき、誠にありがとうございます。
ご注文の詳細をお知らせいたします。

■ 注文情報
注文日: ${formatDate(orderDate)}
注文番号: ${orderNumber}

■ ご注文商品
${items
  .map(
    item =>
      `${item.name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}`
  )
  .join('\n')}

商品合計: ${formatPrice(totalAmount - shippingCost - taxAmount)}
送料: ${formatPrice(shippingCost)}
消費税: ${formatPrice(taxAmount)}
合計金額: ${formatPrice(totalAmount)}

■ お届け先
${shippingAddress.name}
〒${shippingAddress.zipCode}
${shippingAddress.state} ${shippingAddress.city}
${shippingAddress.address1}
${shippingAddress.address2 || ''}

商品の発送準備が整い次第、発送完了のお知らせをお送りいたします。

ご不明な点がございましたら、お気軽にお問い合わせください。

ECストア カスタマーサポート
support@example.com | 03-1234-5678
  `;

  return { subject, html, text };
}

/**
 * 在庫アラートメールテンプレート
 */
export function generateInventoryAlertEmail(
  data: InventoryAlertData
): EmailTemplate {
  const { productName, productSku, currentStock, threshold, categoryName } =
    data;

  const subject = `【在庫アラート】${productName} の在庫が不足しています`;

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Hiragino Sans', 'Yu Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .critical { background: #f8d7da; border: 1px solid #f5c6cb; }
        .product-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>在庫アラート通知</h1>
        
        <div class="alert ${currentStock === 0 ? 'critical' : ''}">
          <h2>${currentStock === 0 ? '⚠️ 在庫切れ' : '⚡ 在庫不足'}</h2>
          <p>以下の商品の在庫が${currentStock === 0 ? '切れました' : '不足しています'}。</p>
        </div>

        <div class="product-info">
          <h3>商品情報</h3>
          <p><strong>商品名:</strong> ${productName}</p>
          <p><strong>SKU:</strong> ${productSku}</p>
          <p><strong>カテゴリ:</strong> ${categoryName}</p>
          <p><strong>現在の在庫数:</strong> ${currentStock}個</p>
          <p><strong>アラート閾値:</strong> ${threshold}個</p>
        </div>

        <p>適切な在庫管理のため、速やかに補充をご検討ください。</p>
        
        <div class="footer">
          <p>ECストア 在庫管理システム</p>
          <p>このメールは自動送信されています。</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
在庫アラート通知

${currentStock === 0 ? '在庫切れ' : '在庫不足'}が発生しました。

■ 商品情報
商品名: ${productName}
SKU: ${productSku}
カテゴリ: ${categoryName}
現在の在庫数: ${currentStock}個
アラート閾値: ${threshold}個

適切な在庫管理のため、速やかに補充をご検討ください。

ECストア 在庫管理システム
このメールは自動送信されています。
  `;

  return { subject, html, text };
}

/**
 * パスワードリセットメールテンプレート
 */
export function generatePasswordResetEmail(
  data: PasswordResetData
): EmailTemplate {
  const { customerName, resetLink, expiresAt } = data;

  const subject = 'パスワードリセットのご案内';

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Hiragino Sans', 'Yu Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background: #007bff; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>パスワードリセットのご案内</h1>
        
        <p>${customerName} 様</p>
        
        <p>パスワードリセットのご依頼を承りました。<br>
        下記のボタンをクリックして、新しいパスワードを設定してください。</p>

        <a href="${resetLink}" class="button">パスワードをリセット</a>

        <div class="warning">
          <p><strong>重要:</strong> このリンクは ${expiresAt.toLocaleString('ja-JP')} まで有効です。</p>
          <p>もしパスワードリセットを依頼していない場合は、このメールを無視してください。</p>
        </div>

        <p>リンクがクリックできない場合は、以下のURLをブラウザのアドレスバーにコピーしてアクセスしてください。</p>
        <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px;">${resetLink}</p>
        
        <div class="footer">
          <p>ECストア カスタマーサポート</p>
          <p>support@example.com | 03-1234-5678</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
パスワードリセットのご案内

${customerName} 様

パスワードリセットのご依頼を承りました。
下記のURLにアクセスして、新しいパスワードを設定してください。

${resetLink}

重要: このリンクは ${expiresAt.toLocaleString('ja-JP')} まで有効です。
もしパスワードリセットを依頼していない場合は、このメールを無視してください。

ECストア カスタマーサポート
support@example.com | 03-1234-5678
  `;

  return { subject, html, text };
}

/**
 * ウェルカムメールテンプレート
 */
export function generateWelcomeEmail(data: WelcomeEmailData): EmailTemplate {
  const { customerName } = data;

  const subject = 'ECストアへようこそ！アカウント作成完了のお知らせ';

  const html = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Hiragino Sans', 'Yu Gothic', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px; }
        .feature { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .button { display: inline-block; padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ECストアへようこそ！</h1>
        </div>
        
        <p>${customerName} 様</p>
        
        <p>ECストアへのご登録、誠にありがとうございます！<br>
        アカウントの作成が完了いたしました。</p>

        <h3>ご利用いただける機能</h3>
        
        <div class="feature">
          <h4>🛒 ショッピング体験</h4>
          <p>豊富な商品ラインナップからお気に入りの商品をお選びいただけます。</p>
        </div>

        <div class="feature">
          <h4>❤️ ウィッシュリスト</h4>
          <p>気になる商品をウィッシュリストに保存して、後でまとめて購入できます。</p>
        </div>

        <div class="feature">
          <h4>📦 注文履歴</h4>
          <p>過去のご注文履歴や配送状況をいつでも確認できます。</p>
        </div>

        <div class="feature">
          <h4>🎯 パーソナライズ推薦</h4>
          <p>あなたの興味に合わせた商品をおすすめいたします。</p>
        </div>

        <a href="/products" class="button">ショッピングを始める</a>

        <p>ご不明な点がございましたら、お気軽にカスタマーサポートまでお問い合わせください。</p>
        
        <div class="footer">
          <p>ECストア カスタマーサポート</p>
          <p>support@example.com | 03-1234-5678</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
ECストアへようこそ！

${customerName} 様

ECストアへのご登録、誠にありがとうございます！
アカウントの作成が完了いたしました。

■ ご利用いただける機能
🛒 ショッピング体験
  豊富な商品ラインナップからお気に入りの商品をお選びいただけます。

❤️ ウィッシュリスト
  気になる商品をウィッシュリストに保存して、後でまとめて購入できます。

📦 注文履歴
  過去のご注文履歴や配送状況をいつでも確認できます。

🎯 パーソナライズ推薦
  あなたの興味に合わせた商品をおすすめいたします。

ショッピングを始める: /products

ご不明な点がございましたら、お気軽にカスタマーサポートまでお問い合わせください。

ECストア カスタマーサポート
support@example.com | 03-1234-5678
  `;

  return { subject, html, text };
}
