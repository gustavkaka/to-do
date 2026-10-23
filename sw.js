// 【全アプリ共通】自動更新 ＆ 動的キャッシュ型 Service Worker

// インストール時：待機せずに即座に新しいSWを有効化
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// アクティベート時：すぐにすべてのページを制御下に置く
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// リクエスト時：ネットワーク優先（常に最新を取得）＋ 自動キャッシュ
self.addEventListener('fetch', (event) => {
  // GETリクエスト以外（POST処理や外部APIなど）は対象外
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // 正常に取得できた場合、裏で自動的にキャッシュを最新化
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open('auto-dynamic-cache').then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // 圏外・オフラインの時だけ、保存されているキャッシュから表示
        return caches.match(event.request);
      })
  );
});
