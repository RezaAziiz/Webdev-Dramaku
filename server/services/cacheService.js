const Redis = require('ioredis');
const env = require('../config/env');

// In-memory fallback storage
const memoryStore = new Map();

// Periodically purge expired items from in-memory store every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of memoryStore.entries()) {
    if (item.expiresAt && item.expiresAt <= now) {
      memoryStore.delete(key);
    }
  }
}, 5 * 60 * 1000).unref();

let redisClient = null;
let isRedisReady = false;
let hasLoggedRedisStatus = false;

// Initialize Redis client if configuration exists or attempt local
try {
  const redisOptions = {
    lazyConnect: true,
    connectTimeout: 2000,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy(times) {
      // Retry every 30 seconds if disconnected, don't spam
      if (times > 3) {
        return 30000;
      }
      return 5000;
    },
  };

  if (env.REDIS_URL) {
    redisClient = new Redis(env.REDIS_URL, redisOptions);
  } else {
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      ...redisOptions,
    });
  }

  redisClient.on('connect', () => {
    isRedisReady = true;
    console.log('✅ [Cache] Connected to Redis successfully.');
  });

  redisClient.on('ready', () => {
    isRedisReady = true;
  });

  redisClient.on('error', (err) => {
    isRedisReady = false;
    if (!hasLoggedRedisStatus) {
      console.warn(
        'ℹ️ [Cache] Redis not available (' + err.message + '). Using In-Memory fallback cache.'
      );
      hasLoggedRedisStatus = true;
    }
  });

  redisClient.on('close', () => {
    isRedisReady = false;
  });

  // Try initial connection in background (non-blocking)
  redisClient.connect().catch(() => {
    // Error event listener above handles logging
  });
} catch (err) {
  isRedisReady = false;
  console.warn('ℹ️ [Cache] Redis initialization error. Using In-Memory fallback cache.');
}

/**
 * Get item from cache (Redis if connected, else In-Memory)
 * @param {string} key
 * @returns {Promise<any|null>}
 */
async function get(key) {
  if (isRedisReady && redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (err) {
      // Redis error, fallback to memory
    }
  }

  // Memory fallback
  const item = memoryStore.get(key);
  if (!item) return null;
  if (item.expiresAt && item.expiresAt <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return item.value;
}

/**
 * Set item in cache
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds - Time-To-Live in seconds
 */
async function set(key, value, ttlSeconds = 3600) {
  // Always update memory store as safe fallback
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });

  if (isRedisReady && redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      // Redis set error, in-memory already saved
    }
  }
}

/**
 * Delete item from cache
 * @param {string} key
 */
async function del(key) {
  memoryStore.delete(key);
  if (isRedisReady && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      // Ignore
    }
  }
}

/**
 * High-level helper: returns cached data if exists,
 * otherwise executes fetchFn(), caches the result, and returns it.
 *
 * @param {string} key
 * @param {number} ttlSeconds
 * @param {Function} fetchFn - Async function returning data to cache
 * @returns {Promise<any>}
 */
async function getOrSet(key, ttlSeconds, fetchFn) {
  const cached = await get(key);
  if (cached !== null && cached !== undefined) {
    return cached;
  }

  const freshData = await fetchFn();
  if (freshData !== null && freshData !== undefined) {
    // Do not await set, fire and forget to maximize response speed
    set(key, freshData, ttlSeconds).catch(() => {});
  }
  return freshData;
}

module.exports = {
  get,
  set,
  del,
  getOrSet,
  isRedisConnected: () => isRedisReady,
};
