/// <reference lib="webworker" />

// BME Research Accelerator Service Worker
// Provides offline caching, background sync, and PWA functionality

const CACHE_NAME = 'bme-accelerator-v2'
const STATIC_CACHE = 'static-v1'
const API_CACHE = 'api-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/icon-dark-32x32.png',
  '/icon-light-32x32.png',
  '/apple-icon.png',
]

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
  '/api/skill-info',
  '/api/health',
  // Note: Don't cache /api/chat, /api/parse-pdf as they need fresh data
]

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing service worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => self.skipWaiting())
      .then(() => {
        console.log('[SW] Installation complete')
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating service worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== API_CACHE && 
                     cacheName !== DYNAMIC_CACHE
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('[SW] Activation complete, now controlling clients')
        return self.clients.claim()
      })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET') return
  if (url.protocol === 'chrome-extension:') return

  // Skip Next.js HMR requests in development
  if (url.hostname === 'localhost' && url.pathname.startsWith('/_next')) {
    return
  }

  // Strategy 1: Cache First for static assets
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Strategy 2: Network First for API calls (with cache fallback)
  if (isAPIEndpoint(url)) {
    event.respondWith(networkFirst(request))
    return
  }

  // Strategy 3: Stale While Revalidate for other resources
  event.respondWith(staleWhileRevalidate(request))
})

// Check if URL is a static asset
function isStaticAsset(url: URL): boolean {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.svg', '.ico', '.woff', '.woff2']
  const pathname = url.pathname.toLowerCase()
  
  return staticExtensions.some(ext => pathname.endsWith(ext)) ||
         pathname.startsWith('/_next/static/')
}

// Check if URL is an API endpoint
function isAPIEndpoint(url: URL): boolean {
  return url.pathname.startsWith('/api/')
}

// Cache First strategy - serve from cache, fallback to network
async function cacheFirst(request: Request): Promise<Response> {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request)
    return cachedResponse
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Return offline fallback for HTML pages
    if (request.headers.get('accept')?.includes('text/html')) {
      return caches.match('/')
    }
    
    throw error
  }
}

// Network First strategy - try network, fallback to cache
async function networkFirst(request: Request): Promise<Response> {
  const cacheName = getCacheNameForURL(new URL(request.url))
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // No cache available
    if (request.headers.get('accept')?.includes('text/html')) {
      return new Response(offlineHTML(), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
    
    throw error
  }
}

// Stale While Revalidate strategy - serve from cache, update in background
async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  // Always try to update cache
  const fetchPromise = fetchAndCache(request).catch(() => {})
  
  // Return cached version immediately (or wait for fetch if no cache)
  if (cachedResponse) {
    return cachedResponse
  }
  
  return fetchPromise
}

// Helper: Determine which cache to use based on URL
function getCacheNameForURL(url: URL): string {
  if (url.pathname.startsWith('/api/skill-info')) {
    return API_CACHE
  }
  return DYNAMIC_CACHE
}

// Fetch and cache helper
async function fetchAndCache(request: Request): Promise<Response | undefined> {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    console.warn('[SW] Failed to fetch and cache:', error.message)
    return undefined
  }
}

// Offline fallback HTML page
function offlineHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BME Research Agent - Offline</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #0a1628 0%, #1e293b 100%);
      color: #94a3b8;
      padding: 20px;
    }
    .container {
      max-width: 400px;
      text-align: center;
      padding: 40px 30px;
      background: rgba(30, 41, 59, 0.5);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }
    .icon { font-size: 48px; margin-bottom: 20px; }
    h1 { font-size: 24px; margin-bottom: 12px; color: #e2e8f0; }
    p { font-size: 14px; line-height: 1.6; margin-bottom: 24px; }
    button {
      padding: 10px 24px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🧬</div>
    <h1>You're Offline</h1>
    <p>
      It looks like you've lost your internet connection. 
      Don't worry - some features may still be available from cache.
    </p>
    <button onclick="window.location.reload()">Try Reconnecting</button>
  </div>
</body>
</html>`
}

// Background Sync for offline actions
self.addEventListener('sync', (event: SyncEvent) => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages())
  }
})

// Push notification handling
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push received:', event)
  
  let data = {}
  if (event.data) {
    data = event.data.json()
  }
  
  const options: NotificationOptions = {
    body: data.body || 'New update available',
    icon: '/icon-dark-32x32.png',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  }
  
  event.showNotification(
    data.title || 'BME Research Agent',
    options
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'view' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/'
    event.waitUntil(
      clients.openWindow(urlToOpen)
    )
  }
})

// Message handling from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data?.type === 'SKIP_WAITING') {
    event.skipWaiting()
  }
  
  if (event.data?.type === 'CACHE_URLS') {
    const urls: string[] = event.data.urls || []
    event.waitUntil(
      Promise.all(urls.map(url => 
        fetchAndCache(new Request(url)).catch(() => {})
      ))
      .then(() => {
        // Notify client that caching is complete
        if (event.source) {
          (event.source as Client).postMessage({ type: 'CACHING_COMPLETE' })
        }
      })
    )
  }
  
  if (event.data?.type === 'CLEAR_CACHE') {
    const cacheNames: string[] | undefined = event.data.cacheNames
    
    event.waitUntil(
      (cacheNames 
        ? Promise.all(cacheNames.map(name => caches.delete(name)))
        : caches.delete(DYNAMIC_CACHE)
      ).then(() => {
        if (event.source) {
          (event.source as Client).postMessage({ type: 'CACHE_CLEARED' })
        }
      })
    )
  }
})

// Sync pending messages when back online
async function syncPendingMessages(): Promise<void> {
  // This would integrate with IndexedDB to store pending operations
  // For now, just log the intent
  console.log('[SW] Would sync pending messages here')
}

// Export types for TypeScript
declare class ExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void
}

declare class ExtendableMessageEvent extends ExtendableEvent {
  source: Client | null
  data: unknown
  ports: ReadonlyArray<MessagePort>
  respondWith(response: Response | Promise<Response>): void
}

declare class FetchEvent extends ExtendableEvent {
  request: Request
  respondWith(response: Response | Promise<Response>): void
}

declare class SyncEvent extends ExtendableEvent {
  tag: string
  lastChance: boolean
}

declare class PushEvent extends ExtendableEvent {
  data: PushMessageData | null
  waitUntil(promise: Promise<unknown>): void
}

interface PushMessageData {
  readonly body?: string
  readonly data?: any
  readonly icon?: string
  readonly image?: string
  readonly lang?: string
  readonly renotify?: number
  requireInteraction?: boolean
  silent?: boolean
  readonly tag?: string
  readonly timestamp?: number
  readonly title?: string
  readonly vibrate?: number[] | null
  readonly visibility?: string
}

interface NotificationOptions {
  actions?: NotificationAction[]
  badge?: string
  body?: string
  data?: any
  dir?: NotificationDirection
  icon?: string
  image?: string
  lang?: string
  renotify?: number
  requireInteraction?: boolean
  silent?: boolean
  tag?: string
  timestamp?: number
  vibrate?: number[] | null
  visibility?: NotificationVisibility
  readonly [key: string]: any
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}
