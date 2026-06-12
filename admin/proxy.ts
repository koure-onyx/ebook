import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PUBLIC PATHS - skip auth routes, API, static files, and signin page
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signin' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Try to get token with custom admin cookie name
  // NextAuth automatically prefixes with __Secure- in production if secure: true
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token.admin',
  }) || await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: '__Secure-next-auth.session-token.admin',
  });

  const allCookies = request.cookies.getAll().map(c => c.name);
  console.log(`[Admin Proxy] ${request.method} ${pathname}`);
  console.log(` - Available Cookies: ${allCookies.join(', ')}`);
  console.log(` - Token Found: ${!!token}`);
  if (token) console.log(` - User Role: ${token.role}, Email: ${token.email}`);

  // 2. AUTH GUARD - if no token, redirect to signin
  if (!token) {
    console.log(`[Admin Proxy] No token found for ${pathname}. Redirecting to signin.`);
    const signInUrl = new URL('/login', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  // 3. ADMIN ROLE CHECK
  const user = token as any;
  if (user.role !== 'admin' && user.email !== 'admin@studyvault.pk') {
    console.log(`[Admin Proxy] User role is ${user.role}, not admin. Redirecting.`);
    // Instead of redirecting to signin (which causes loop), show access denied
    return NextResponse.json(
      { success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
