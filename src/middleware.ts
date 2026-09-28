import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, type SessionPayload } from '@/lib/auth/session'
import { globalRateLimit, authRateLimit, getClientIp } from '@/lib/security/rate-limit'

// Routes that require standard user authentication
const protectedRoutes = ['/profile', '/checkout', '/orders']

// Routes that require admin privileges
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const ip = getClientIp(request.headers)
  const isAuthEndpoint =
    pathname.startsWith('/api/actions/auth') ||
    pathname.startsWith('/api/auth')

  try {
    const rateLimit = isAuthEndpoint ? authRateLimit : globalRateLimit
    const result = await rateLimit.limit(ip)

    if (!result.success) {
      return rateLimitedResponse(result.limit, result.remaining, result.reset)
    }
  } catch (error) {
    // Keep a Redis outage from taking down the storefront. Auth Server
    // Actions enforce the strict auth limiter independently below.
    console.error('[RateLimit] Redis check failed:', error)
  }

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute && !isAdminRoute) {
    return NextResponse.next()
  }

  const sessionToken = request.cookies.get('session')?.value
  
  if (!sessionToken) {
    return handleUnauthorized(request)
  }

  const payload = await verifyToken(sessionToken) as SessionPayload | null
  
  if (!payload) {
    // Invalid or expired token
    const response = handleUnauthorized(request)
    response.cookies.delete('session')
    return response
  }

  // Admin route check
  if (isAdminRoute && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

function rateLimitedResponse(limit: number, remaining: number, reset: number) {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))

  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': String(limit),
        'X-RateLimit-Remaining': String(Math.max(0, remaining)),
        'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
      },
    },
  )
}

function handleUnauthorized(request: NextRequest) {
  // If trying to access admin without login, just go to home
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // Normal protected routes redirect to home with a query param to open the login modal
  const url = new URL('/', request.url)
  url.searchParams.set('login', 'true')
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    // Apply rate limiting to application/API traffic, excluding Next internals.
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs',
}
