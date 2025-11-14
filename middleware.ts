import { createSupabaseServerClient } from './lib/supabase/server.js';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';

const i18nConfig = require('./i18n.config.js');

const I18nMiddleware = createI18nMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
});

export async function updateSession(request: NextRequest) {
  const supabase = await createSupabaseServerClient(request.cookies);

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get URL for routing
  const url = request.nextUrl.clone();

  const locale = request.headers.get('x-next-international-locale');
  let pathname = request.nextUrl.pathname;
  if (locale) {
      if (pathname.startsWith(`/${locale}/`)) {
          pathname = pathname.substring(`/${locale}`.length);
      } else if (pathname === `/${locale}`) {
          pathname = '/';
      }
  }

  // Define protected routes (admin routes)
  const isAdminRoute = pathname.startsWith('/admin');
  
  // For admin pages, redirect if not authenticated as admin
  if (isAdminRoute) {
    if (!session) {
      // Redirect to login page
      url.pathname = '/auth/login';
      url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }

    // Check if the user is an admin
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('auth_id', session.user.id)
      .eq('is_active', true)
      .single();

    if (adminError || !adminData) {
      // If not an admin, redirect to unauthorized page or home
      url.pathname = '/unauthorized';
      return NextResponse.redirect(url);
    }
  }

  // For dashboard pages, ensure user is authenticated
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/customer')) {
    if (!session) {
      url.pathname = '/auth/login';
      url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  // Continue with the request
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export async function middleware(request: NextRequest) {
  const supabase = await createSupabaseServerClient(request.cookies);
  const { data: { user } } = await supabase.auth.getUser();
  const preferredLocale = user?.user_metadata?.language_preference || i18nConfig.defaultLocale;

  const I18nMiddleware = createI18nMiddleware({
    locales: i18nConfig.locales,
    defaultLocale: preferredLocale,
  });

  const i18nResponse = I18nMiddleware(request);

  if (i18nResponse.status >= 300 && i18nResponse.status < 400) {
    return i18nResponse;
  }

  const finalRequest = new NextRequest(i18nResponse.url, request);
  i18nResponse.headers.forEach((v, k) => finalRequest.headers.set(k, v));

  return await updateSession(finalRequest);
}

// Define which routes the middleware should run for
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
