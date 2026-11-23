// Retired service worker. An old version of this game cached itself offline through a service worker,
// so devices that installed it kept showing the old game. This replacement clears those caches,
// removes itself and reloads open pages so they get the current version from the server.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const wins = await self.clients.matchAll({ type: 'window' });
    wins.forEach((c) => { try { c.navigate(c.url); } catch (err) {} });
  })());
});
