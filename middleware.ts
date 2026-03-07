import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that logged-in users should NOT be able to visit
const AUTH_ROUTES = ['/login', '/register'];

// Routes that require a token — everything under (dashboard)
const PROTECTED_PREFIXES = [
    '/dashboard',
    '/resume',
    '/interview',
    '/practice',
    '/learning-paths',
    '/notes',
    '/content',
    '/settings',
    '/topics',
    '/workspaces',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // 1. Logged-in user tries to visit /login or /register → send to dashboard
    if (token && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // 2. Unauthenticated user tries to visit a protected route → send to login
    if (!token && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        const loginUrl = new URL('/login', request.url);
        // Preserve the original destination so we can redirect back after login
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Run on all routes except Next.js internals and static files
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
