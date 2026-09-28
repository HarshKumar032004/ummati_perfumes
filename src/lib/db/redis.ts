/**
 * Redis client using @upstash/redis (REST API over HTTP)
 *
 * This completely resolves TCP port 6380 ETIMEDOUT errors caused by restrictive firewalls,
 * because it connects over standard port 443 via HTTPS.
 */

import { Redis } from '@upstash/redis';

const upstashClient = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || 'https://placeholder.invalid',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || 'placeholder',
});

export { upstashClient };

/**
 * We export a wrapper that maps standard ioredis method signatures to @upstash/redis syntax.
 * This prevents us from having to rewrite the entire codebase's Redis calls.
 */
const redis = {
  get: async (key: string) => {
    return await upstashClient.get<string | number>(key);
  },
  
  del: async (...keys: string[]) => {
    return await upstashClient.del(...keys);
  },
  
  setex: async (key: string, ttl: number, value: any) => {
    return await upstashClient.setex(key, ttl, value);
  },
  
  set: async (key: string, value: any, opt1?: string, ttl?: number, opt2?: string) => {
    // Handle: redis.set(key, value, 'EX', 300)
    // Handle: redis.set(key, value, 'EX', 300, 'NX')
    
    const options: any = {};
    if (opt1 === 'EX' && ttl !== undefined) {
      options.ex = ttl;
    }
    if (opt2 === 'NX' || opt1 === 'NX') {
      options.nx = true;
    }

    if (Object.keys(options).length > 0) {
      return await upstashClient.set(key, value, options);
    }
    return await upstashClient.set(key, value);
  }
};

export default redis;

// ─── Typed helper utilities ─────────────────────────────────────────────────

export async function setJSON<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
  if (ttlSeconds) {
    await upstashClient.set(key, value, { ex: ttlSeconds });
  } else {
    await upstashClient.set(key, value);
  }
}

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await upstashClient.get<T>(key);
  if (!raw) return null;
  return raw as T;
}

export async function deleteKeys(...keys: string[]): Promise<void> {
  if (keys.length > 0) await upstashClient.del(...keys);
}

export async function acquireLock(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  const result = await upstashClient.set(key, value, { ex: ttlSeconds, nx: true });
  return result === 'OK';
}

export async function releaseLock(key: string): Promise<void> {
  await upstashClient.del(key);
}
