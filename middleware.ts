import { updateSession } from './lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'it', 'ar'],
  defaultLocale: 'it',
  localePrefix: 'always',
  localeDetection: false
});

export async function middleware(request: NextRequest) {
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');

  // First run the intl middleware only if it's not an API route
  const response = isApiRoute
    ? NextResponse.next()
    : intlMiddleware(request);

  // Then run the supabase middleware
  return await updateSession(request, response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes (login, register) - wait, we might want i18n on auth routes too? 
     *   Usually yes. But the matcher excludes them. 
     *   Let's keep the existing exclusion for now to avoid breaking auth flow immediately, 
     *   but we should probably include them later. 
     *   For this task, we focus on home route.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?!js|jsx|ts|tsx$)[^/]*$).*)',
    '/(api|trpc)(.*)',
  ],
};
