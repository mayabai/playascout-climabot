/**
 * Cache en memoria para datos de clima — node-cache con fallback stale
 */
const NodeCache = require('node-cache');

const TTL = parseInt(process.env.CACHE_TTL) || 900;
const cache = new NodeCache({ stdTTL: TTL, checkperiod: 60, useClones: false });
const cacheStale = new NodeCache({ stdTTL: 0, useClones: false }); // sin expiración

function get(zonaId) {
  return cache.get(`clima_${zonaId}`) || null;
}

function getStale(zonaId) {
  return cacheStale.get(`clima_${zonaId}`) || null;
}

function set(zonaId, datos) {
  const key = `clima_${zonaId}`;
  cache.set(key, datos);
  cacheStale.set(key, { ...datos, _staleAt: new Date().toISOString() });
}

function getStats() {
  const stats = cache.getStats();
  return { hits: stats.hits, misses: stats.misses, keys: cache.keys().length, ttl: TTL };
}

function flush() {
  cache.flushAll();
  cacheStale.flushAll();
}

module.exports = { get, getStale, set, getStats, flush };
