// Service Worker for ECストア PWA
// バージョン管理
const SW_VERSION = '1.0.0';
const CACHE_NAME = `ec-store-cache-v${SW_VERSION}`;

// キャッシュするリソース
const STATIC_CACHE_URLS = [
  '/',
  '/products',
  '/cart',
  '/wishlist',
  '/auth/login',
  '/auth/register',
  '/offline',
  '/manifest.json',
  // CSS and JS files will be cached by Next.js
];

// API キャッシュ設定
const API_CACHE_PATTERNS = [
  '/api/products',
  '/api/categories',
  '/api/cart',
  '/api/wishlist',
];

// キャッシュしないパターン
const NO_CACHE_PATTERNS = [
  '/api/auth/',
  '/api/orders',
  '/api/admin/',
  '/api/emails/',
];

// インストール時の処理
self.addEventListener('install', event => {
  console.log(`[SW] Installing version ${SW_VERSION}`);

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Static resources cached successfully');
        // 新しいService Workerを即座にアクティブ化
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static resources:', error);
      })
  );
});

// アクティベート時の処理
self.addEventListener('activate', event => {
  console.log(`[SW] Activating version ${SW_VERSION}`);

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // 古いキャッシュを削除
        return Promise.all(
          cacheNames
            .filter(
              cacheName =>
                cacheName.startsWith('ec-store-cache-') &&
                cacheName !== CACHE_NAME
            )
            .map(cacheName => {
              console.log(`[SW] Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Old caches cleaned up');
        // 全てのクライアントを制御下に置く
        return self.clients.claim();
      })
      .catch(error => {
        console.error('[SW] Failed to clean up old caches:', error);
      })
  );
});

// フェッチイベントの処理
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  // HTTPSまたはlocalhostのリクエストのみ処理
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== self.location.origin) {
    return;
  }

  // キャッシュしないパターンをチェック
  if (NO_CACHE_PATTERNS.some(pattern => url.pathname.includes(pattern))) {
    return;
  }

  event.respondWith(handleFetch(request));
});

/**
 * フェッチリクエストを処理する
 */
async function handleFetch(request) {
  const url = new URL(request.url);

  try {
    // GET リクエストのみキャッシュ対象
    if (request.method !== 'GET') {
      return await fetch(request);
    }

    // API リクエストの処理
    if (url.pathname.startsWith('/api/')) {
      return await handleApiRequest(request);
    }

    // 静的リソースの処理
    return await handleStaticRequest(request);
  } catch (error) {
    console.error('[SW] Fetch error:', error);
    return await handleOfflineResponse(request);
  }
}

/**
 * API リクエストを処理する
 */
async function handleApiRequest(request) {
  const url = new URL(request.url);

  // キャッシュ可能なAPIかチェック
  const isCacheable = API_CACHE_PATTERNS.some(pattern =>
    url.pathname.includes(pattern)
  );

  if (!isCacheable) {
    return await fetch(request);
  }

  try {
    // ネットワークファーストで試行
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // 成功時はキャッシュに保存
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error(`Network response not ok: ${networkResponse.status}`);
  } catch (error) {
    console.log('[SW] Network failed, trying cache for API:', url.pathname);

    // ネットワーク失敗時はキャッシュから取得
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // キャッシュもない場合はオフライン用レスポンス
    return new Response(
      JSON.stringify({
        error: 'オフラインです。インターネット接続を確認してください。',
        offline: true,
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * 静的リソースリクエストを処理する
 */
async function handleStaticRequest(request) {
  // キャッシュファーストで試行
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // キャッシュにない場合はネットワークから取得
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // 成功時はキャッシュに保存
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed for static resource:', request.url);
    return await handleOfflineResponse(request);
  }
}

/**
 * オフライン時のレスポンスを処理する
 */
async function handleOfflineResponse(request) {
  const url = new URL(request.url);

  // HTMLページの場合はオフラインページを返す
  if (
    request.destination === 'document' ||
    request.headers.get('accept')?.includes('text/html')
  ) {
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }

    // オフラインページもない場合は簡易HTMLを返す
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>オフライン - ECストア</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            max-width: 400px;
          }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #333; margin-bottom: 10px; }
          p { color: #666; margin-bottom: 20px; }
          button {
            background: #2563eb;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
          }
          button:hover { background: #1d4ed8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">📱</div>
          <h1>オフラインです</h1>
          <p>インターネット接続を確認して、もう一度お試しください。</p>
          <button onclick="window.location.reload()">再読み込み</button>
        </div>
      </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  // その他のリソースの場合は404を返す
  return new Response('リソースが見つかりません', {
    status: 404,
    statusText: 'Not Found',
  });
}

// プッシュ通知の処理
self.addEventListener('push', event => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '新しい通知があります',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: data.tag || 'general',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'ECストア', options)
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);
  }
});

// 通知クリック時の処理
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // 既存のウィンドウがあればそれにフォーカス
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // 新しいウィンドウを開く
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// バックグラウンド同期
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

/**
 * バックグラウンド同期を処理する
 */
async function handleBackgroundSync() {
  try {
    console.log('[SW] Background sync started');

    // オフライン時に蓄積されたデータを同期
    // 例: カートの更新、お気に入りの同期など

    // 実装例（実際のデータ同期ロジックに置き換え）
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();

    for (const request of requests) {
      if (
        request.url.includes('/api/cart') ||
        request.url.includes('/api/wishlist')
      ) {
        try {
          await fetch(request);
        } catch (error) {
          console.log('[SW] Sync failed for:', request.url);
        }
      }
    }

    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync error:', error);
  }
}

// メッセージイベントの処理
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: SW_VERSION });
  }
});

console.log(`[SW] Service Worker version ${SW_VERSION} loaded`);
