const CACHE_NAME = 'romq-gallery-cache-1.1';
const urlsToCache = [];

console.log('[SW] Service Worker скрипт загружен');

self.addEventListener('install', event => {
  console.log('[SW] Установка Service Worker, cache name:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Кэш открыт, добавление статических ресурсов:', urlsToCache);
      return cache.addAll(urlsToCache).catch(err => {
        console.error('[SW] Ошибка при добавлении ресурсов в кэш:', err);
      });
    }).then(() => {
      console.log('[SW] Установка завершена, активация...');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] Активация Service Worker');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Удаление старого кэша:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Активация завершена, управление страницами установлено');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const isImage = url.pathname.includes('/images/') || url.pathname.includes('/thumbnails/');
  
  if (isImage) {
    console.log('[SW] Перехват запроса к изображению:', url.pathname);
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Отдача из кэша:', url.pathname);
          return cachedResponse;
        }
        console.log('[SW] Загрузка из сети и кэширование:', url.pathname);
        return fetch(event.request).then(response => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
            console.log('[SW] Изображение добавлено в кэш:', url.pathname);
          }).catch(err => console.error('[SW] Ошибка кэширования:', err));
          return response;
        }).catch(err => {
          console.error('[SW] Ошибка загрузки из сети:', url.pathname, err);
          return new Response('Изображение не найдено', { status: 404, statusText: 'Not Found' });
        });
      })
    );
  } else {
    // console.log('[SW] Пропуск запроса (не изображение):', url.pathname);
  }
});