/* ChronoAtlas Service Worker（PHASE 离线 PWA）
 * 策略：
 * - 贴图/数据资产：cache-first（本地已入库，永久缓存）
 * - 页面与构建产物：network-first，离线回退缓存
 * - 版本化缓存目录，升级时清理旧缓存
 */
const CACHE_VERSION = 'chrono-v1'
const PRECACHE = [
  '/',
  '/textures/earth-blue-marble.jpg',
  '/textures/earth-night.jpg',
  '/textures/earth-topology.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET') return

  // 贴图：cache-first（大文件，离线必需）
  if (url.pathname.startsWith('/textures/')) {
    event.respondWith(
      caches.match(event.request).then((hit) => hit || fetch(event.request).then((res) => {
        const copy = res.clone()
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy))
        return res
      })),
    )
    return
  }

  // 其余：network-first，失败回退缓存（离线可浏览整站）
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone()
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy))
        return res
      })
      .catch(() => caches.match(event.request).then((hit) => hit || caches.match('/'))),
  )
})
