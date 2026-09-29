/**
 * AI Travel Planner - PWA Service Worker
 * 오프라인 자산 캐싱 및 네트워크 패스스루
 */

const CACHE_NAME = 'ai-travel-pwa-v1';
const PRECACHE_ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/js/app.js',
  '/static/manifest.json',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/favicon.svg'
];

// 1. 서비스 워커 설치 시 핵심 정적 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. 서비스 워커 활성화 시 이전 버전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. 네트워크 요청 처리 (/generate API 및 POST 요청은 캐시하지 않고 항상 네트워크로 직접 전송)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Gemini 생성 API(/generate), 로그아웃 및 비-GET 요청은 네트워크 전용
  if (event.request.method !== 'GET' || url.pathname.startsWith('/generate') || url.pathname.startsWith('/logout') || url.searchParams.has('action')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 외부 타사 CDN(지도 타일, unpkg, jsdelivr 등)은 캐싱 개입 없이 직접 네트워크 패스스루
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
    return;
  }

  // 일반 내부 정적 자산 및 페이지: Network-First 전략
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
