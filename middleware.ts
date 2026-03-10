import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/constants';

const publicPaths = [
  '/login',
  '/setup',
  '/api/setup',
  '/api/auth/login',
  '/api/auth/logout',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname === '/api/health'
  ) {
    return NextResponse.next();
  }

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  );
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    if (pathname !== '/') url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*).*)'],
};