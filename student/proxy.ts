import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. PUBLIC PATHS
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname === '/' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: 'next-auth.session-token.student'
  }) || await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: '__Secure-next-auth.session-token.student'
  });

  console.log(`[Student Proxy] ${request.method} ${pathname} - Token: ${!!token}, Role: ${token?.role}`);

  // 2. AUTH GUARD
  if (!token) {
    if (pathname !== '/onboarding') {
      console.log(`[Student Proxy] No token found for ${pathname}. Redirecting to signin.`);
      const url = new URL('/api/auth/signin', request.url);
      url.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 3. STUDENT PROFILE COMPLETENESS:
  const user = token as any;
  const isStudent = user.role === 'student';
  const hasBoard = !!user?.board || !!user?.board_id || !!user?.profile?.board;
  const hasGrade = !!user?.grade || !!user?.grade_level || !!user?.profile?.grade;

  if (isStudent && (!hasBoard || !hasGrade)) {
    if (pathname !== '/onboarding') {
      console.log(`[Student Proxy] Student profile incomplete. Redirecting to onboarding.`);
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  if (isStudent && hasBoard && hasGrade && pathname === '/onboarding') {
    console.log(`[Student Proxy] Student profile complete. Redirecting from onboarding to dashboard.`);
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
