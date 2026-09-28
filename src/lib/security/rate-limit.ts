import { Ratelimit } from '@upstash/ratelimit'
import { upstashClient } from '@/lib/db/redis'

export const globalRateLimit = new Ratelimit({
  redis: upstashClient,
  limiter: Ratelimit.slidingWindow(100, '10 s'),
  prefix: 'ummati:ratelimit:global',
  timeout: 1000,
})

export const authRateLimit = new Ratelimit({
  redis: upstashClient,
  limiter: Ratelimit.slidingWindow(3, '1 m'),
  prefix: 'ummati:ratelimit:auth',
  timeout: 1000,
})

export function getClientIp(headers: Pick<Headers, 'get'>): string {
  const forwardedFor = headers.get('x-forwarded-for')
  const forwardedIp = forwardedFor?.split(',')[0]?.trim()

  return (
    forwardedIp ||
    headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}
