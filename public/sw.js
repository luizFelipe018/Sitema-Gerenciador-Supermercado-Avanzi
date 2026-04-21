const CACHE_NAME = 'avanzi-erp-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/login.html',
  '/home.html',
  '/shared.js',
  '/manifest.json'
];

// Instalar - cachear assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Ativar - limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - servir do cache ou buscar da rede
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Não cachear requisições API
  if (request.url.includes('localhost:3000') &&
      !request.url.includes('/imagem') &&
      !request.url.includes('/terca')) {
    return;
  }

  // Estratégia: Cache First, fallback para network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response;

        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      }).catch(() => {
        // Offline fallback para login
        if (request.url.includes('login.html')) {
          return caches.match('/login.html');
        }
      });
    })
  );
});