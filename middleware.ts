import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // Create a Supabase client using the request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
          });
        },
      },
    }
  );

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Get URL for routing
  const url = request.nextUrl.clone();

  // Define protected routes (admin routes)
  const isAdminRoute = url.pathname.startsWith('/admin');
  const isAuthRoute = url.pathname.startsWith('/auth');
  const isApiRoute = url.pathname.startsWith('/api');
  
  // Handle API routes with more specific authentication
  if (isApiRoute && !url.pathname.includes('/api/auth') && !url.pathname.includes('/api/register') && !url.pathname.includes('/api/offers')) {
    // For non-public API routes, check authentication
    const isProtectedApi = !url.pathname.includes('/api/login') && !url.pathname.includes('/api/register');
    
    if (isProtectedApi) {
      if (!session) {
        // Return 401 for API routes
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      
      // For admin API routes, check if user is an admin
      if (url.pathname.includes('/api/admin')) {
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('auth_id', session.user.id)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }
      }
    }
  }

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
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/api/customer')) {
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
  return await updateSession(request);
}

// Define which routes the middleware should run for
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - auth routes (login, register)
     * - public API endpoints
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?!js|jsx|ts|tsx$)[^/]*$).*)',
    '/(api|trpc)(.*)',
  ],
};