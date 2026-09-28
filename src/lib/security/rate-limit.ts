import { Ratelimit } from '@upstash/ratelimit'
import { upstashClient } from '@/lib/db/redis'

const disabledRateLimit = {
  limit: async () => ({ success: true, limit: 0, remaining: 0, reset: Date.now() }),
}

const createRateLimit = (limiter: ReturnType<typeof Ratelimit.slidingWindow>, prefix: string) =>
  upstashClient
    ? new Ratelimit({
        redis: upstashClient,
        limiter,
        prefix,
        timeout: 1000,
      })
    : disabledRateLimit

export const globalRateLimit = createRateLimit(
  Ratelimit.slidingWindow(100, '10 s'),
  'ummati:ratelimit:global',
)

export const authRateLimit = createRateLimit(
  Ratelimit.slidingWindow(3, '1 m'),
  'ummati:ratelimit:auth',
)

export function getClientIp(headers: Pick<Headers, 'get'>): string {
  const forwardedFor = headers.get('x-forwarded-for')
  const forwardedIp = forwardedFor?.split(',')[0]?.trim()

  return (
    forwardedIp ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}
