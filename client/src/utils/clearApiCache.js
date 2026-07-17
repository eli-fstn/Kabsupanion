export async function clearApiCache() {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((name) => name.includes('api-cache'))
        .map((name) => caches.delete(name))
    );
  }
}