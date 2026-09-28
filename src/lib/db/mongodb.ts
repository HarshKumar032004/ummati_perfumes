/**
 * MongoDB connection utility for Next.js (App Router)
 *
 * Caches the Mongoose connection across hot reloads in development to prevent
 * connection pool exhaustion. In production, each serverless instance maintains
 * its own persistent connection (Vercel function warm starts).
 *
 * Usage:
 *   import dbConnect from '@/lib/db/mongodb';
 *   await dbConnect();
 */

import mongoose, { Mongoose } from 'mongoose';

const getMongoDbUri = () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      'MONGODB_URI is not defined. Add it to your environment variables.'
    );
  }

  return uri;
};

/**
 * Global cache interface to persist connection across hot reloads in dev.
 * We attach to `global` because Next.js module cache is cleared on each reload.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var __mongooseCache: MongooseCache | undefined;
}

const cache: MongooseCache = (global.__mongooseCache ??= {
  conn: null,
  promise: null,
});

const opts: mongoose.ConnectOptions = {
  bufferCommands: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

async function dbConnect(): Promise<Mongoose> {
  // Reuse a healthy connection for all requests handled by this instance.
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // Reuse the in-flight promise so concurrent requests cannot create multiple
  // connections during a cold start or development hot reload.
  if (cache.promise) {
    return cache.promise;
  }

  // Do not retain a stale connection after an unexpected disconnect.
  cache.conn = null;
  const connectionPromise = mongoose.connect(getMongoDbUri(), opts);
  cache.promise = connectionPromise;

  try {
    cache.conn = await connectionPromise;

    // Register diagnostics only when a new connection is established.
    if (process.env.NODE_ENV === 'development') {
      mongoose.connection.on('connected', () =>
        console.log('[MongoDB] Connected to', mongoose.connection.name)
      );
      mongoose.connection.on('error', (err) =>
        console.error('[MongoDB] Connection error:', err)
      );
      mongoose.connection.on('disconnected', () =>
        console.warn('[MongoDB] Disconnected')
      );
    }

    return cache.conn;
  } catch (error) {
    // Allow a later request to retry after a transient connection failure.
    cache.conn = null;
    throw error;
  } finally {
    // The resolved connection is cached in `conn`; only the in-flight promise
    // needs to be cleared.
    if (cache.promise === connectionPromise) {
      cache.promise = null;
    }
  }
}

export default dbConnect;
