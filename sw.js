[file name]: sw.js
[file content begin]
// sw.js
// Расширенный Service Worker с поддержкой офлайн-работы и push-уведомлений
const CACHE_NAME = 'fruity-chat-v2.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/config.js',
    '/api-config.js',
    '/state-manager.js',
    '/i18n.js',
    '/performance-monitor.js',
    '/achievements.js',
    '/games.js',
    '/voice-recorder.js',
    '/export-utils.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Стратегии кэширования
const CACHE_STRATEGIES = {
    STATIC: 'cache-first',
    API: 'network-first',
    FALLBACK: 'cache-only'
};

self.addEventListener('install', function(event) {
    console.log('🚀 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('📦 Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', function(event) {
    console.log('🔥 Service Worker activating...');
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', function(event) {
    // Пропускаем non-GET запросы и API запросы
    if (event.request.method !== 'GET') return;
    
    const url = new URL(event.request.url);
    
    // API запросы - network-first стратегия
    if (url.pathname.includes('/api/') || url.hostname.includes('huggingface.co')) {
        event.respondWith(networkFirstStrategy(event));
        return;
    }
    
    // Статические ресурсы - cache-first стратегия
    event.respondWith(cacheFirstStrategy(event));
});

// Network-first стратегия для API
async function networkFirstStrategy(event) {
    try {
        // Пытаемся получить свежие данные из сети
        const networkResponse = await fetch(event.request);
        
        // Кэшируем успешные ответы
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Если сеть недоступна, пытаемся получить из кэша
        console.log('🌐 Network failed, trying cache...');
        const cachedResponse = await caches.match(event.request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Если нет в кэше, возвращаем fallback
        return new Response(JSON.stringify({
            error: 'Network unavailable and no cached response',
            offline: true
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Cache-first стратегия для статических ресурсов
async function cacheFirstStrategy(event) {
    const cachedResponse = await caches.match(event.request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(event.request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback для главной страницы
        if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        return new Response('Network error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Обработка сообщений от основного потока
self.addEventListener('message', function(event) {
    const data = event.data;
    
    switch (data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'CACHE_NEW_RESOURCE':
            event.waitUntil(
                caches.open(CACHE_NAME).then(cache => {
                    return cache.add(data.url);
                })
            );
            break;
            
        case 'GET_CACHE_STATUS':
            event.ports[0].postMessage({
                type: 'CACHE_STATUS',
                cachedUrls: urlsToCache
            });
            break;
    }
});

// Обработка push-уведомлений
self.addEventListener('push', function(event) {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body || 'Новое сообщение от Фруктик Чата',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'open',
                title: 'Открыть'
            },
            {
                action: 'close',
                title: 'Закрыть'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title || 'Фруктик Чат', options)
    );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(windowClients => {
                // Фокусируем существующее окно или открываем новое
                for (let client of windowClients) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Фоновая синхронизация
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        console.log('🔄 Background sync triggered');
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Здесь может быть логика синхронизации данных
    // Например, отправка отложенных сообщений
    console.log('🔄 Performing background sync...');
}

// Периодическая синхронизация (если поддерживается)
if ('periodicSync' in self.registration) {
    self.addEventListener('periodicsync', event => {
        if (event.tag === 'content-update') {
            event.waitUntil(updateContent());
        }
    });
}

async function updateContent() {
    // Обновление контента в фоне
    console.log('🔄 Periodic sync: updating content');
}

console.log('🛠️ Enhanced Service Worker registered');
[file content end]