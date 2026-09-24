// Age of Empires service worker: precaches the app shell and caches everything else on first use,
// so revisits (and every era already seen) load instantly, even offline.
const VERSION = 'v6';
const CORE = `core-${VERSION}`;
const STATIC = `static-${VERSION}`;
const TILES = `tiles-${VERSION}`;
const WIKI = `wiki-${VERSION}`;
const KEEP = [CORE, STATIC, TILES, WIKI];
const MAX_TILES = 2500;
const MAX_WIKI = 400;

const PRECACHE = ['/', '/data/index.json', '/data/world_100.topo.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CORE)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const cacheable = (res) => res && (res.ok || res.type === 'opaque');

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}

async function cacheFirst(request, cacheName, max) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (cacheable(res)) {
    const cache = await caches.open(cacheName);
    await cache.put(request, res.clone());
    if (max && Math.random() < 0.05) trim(cacheName, max);
  }
  return res;
}

async function staleWhileRevalidate(request, cacheName, event, max) {
  const cached = await caches.match(request);
  const network = fetch(request)
    .then(async (res) => {
      if (cacheable(res)) {
        const cache = await caches.open(cacheName);
        await cache.put(request, res.clone());
        if (max && Math.random() < 0.05) trim(cacheName, max);
      }
      return res;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return network;
}

async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.ok) (await caches.open(CORE)).put('/', res.clone());
    return res;
  } catch {
    return (await caches.match('/')) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') return event.respondWith(networkFirst(request));

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/assets/')) return event.respondWith(cacheFirst(request, STATIC));
    if (url.pathname.startsWith('/fonts/')) return event.respondWith(cacheFirst(request, STATIC));
    if (url.pathname.startsWith('/data/') || url.pathname.startsWith('/textures/') || url.pathname.startsWith('/intro/'))
      return event.respondWith(staleWhileRevalidate(request, STATIC, event));
    return;
  }

  if (url.hostname.endsWith('arcgisonline.com')) return event.respondWith(cacheFirst(request, TILES, MAX_TILES));
  if (url.hostname === 'upload.wikimedia.org') return event.respondWith(cacheFirst(request, WIKI, MAX_WIKI));
  if (url.hostname === 'en.wikipedia.org') return event.respondWith(staleWhileRevalidate(request, WIKI, event, MAX_WIKI));
});
