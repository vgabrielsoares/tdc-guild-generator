// Service Worker para o Gerador de Guildas
// Configuração de cache para funcionamento offline

const CACHE_NAME = 'guild-generator-v1';
const STATIC_CACHE_NAME = 'guild-generator-static-v1';

// Recursos críticos que devem ser sempre cacheados
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/guild-logo.png'
];

// Recursos estáticos para cache
const STATIC_RESOURCES = [
  '/assets/',
  '/icons/',
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap'
];

// URLs que devem ser sempre buscadas da rede
const NETWORK_FIRST = [
  '/api/',
  '/data/'
];

// URLs que podem usar cache primeiro
const CACHE_FIRST = [
  '/icons/',
  '/assets/',
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.svg',
  '.woff2'
];

// Install event - cache recursos críticos
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(CRITICAL_RESOURCES).catch((error) => {
          // Ignore errors for resources that might not exist in development
          console.warn('Some resources could not be cached:', error);
          return Promise.resolve();
        });
      }),
      // Pular waiting para ativar imediatamente
      self.skipWaiting()
    ])
  );
});

// Activate event - limpar caches antigos
self.addEventListener('activate', (event) => {
  // Immediately claim all clients to avoid InvalidStateError
  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar controle de todas as páginas
      self.clients.claim()
    ])
  );
});

// Fetch event - estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Só interceptar requests HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // Estratégia baseada no tipo de recurso
  if (isNetworkFirst(request.url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isCacheFirst(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Verifica se deve usar network first
function isNetworkFirst(url) {
  return NETWORK_FIRST.some(pattern => url.includes(pattern));
}

// Verifica se deve usar cache first
function isCacheFirst(url) {
  return CACHE_FIRST.some(pattern => url.includes(pattern));
}

// Estratégia Network First (para dados dinâmicos)
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback para página offline se disponível
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline - Sem conexão com a internet', {
        status: 503,
        statusText: 'Service Unavailable'
      });
    }
    
    throw error;
  }
}

// Estratégia Cache First (para recursos estáticos)
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch resource:', request.url);
    throw error;
  }
}

// Estratégia Stale While Revalidate (para recursos gerais)
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    console.log('[SW] Network failed for:', request.url);
  });
  
  return cachedResponse || fetchPromise;
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      case 'CACHE_URLS':
        event.waitUntil(
          caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(event.data.payload);
          })
        );
        break;
      case 'CLEAR_CACHE':
        event.waitUntil(
          caches.keys().then((cacheNames) => {
            return Promise.all(
              cacheNames.map((cacheName) => caches.delete(cacheName))
            );
          })
        );
        break;
      case 'GET_VERSION':
        event.ports[0].postMessage({
          type: 'VERSION',
          payload: CACHE_NAME
        });
        break;
    }
  }
});

// Background Sync para quando voltar online
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'guild-data-sync') {
    event.waitUntil(syncGuildData());
  }
});

// Função para sincronizar dados da guilda
async function syncGuildData() {
  try {
    // Aqui seria implementada a lógica de sync
    // Por enquanto apenas log
    console.log('[SW] Syncing guild data...');
    
    // Broadcast para clientes que o sync foi completado
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        payload: { success: true }
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

console.log('[SW] Guild Generator Service Worker loaded!');
