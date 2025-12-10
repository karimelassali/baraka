import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response?: NextResponse) {
    // Maintenance Mode Check
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    const url = request.nextUrl.clone();
    const { pathname } = url;

    if (isMaintenanceMode) {
        // Allowed paths during maintenance
        // We need to handle locale prefixes (e.g. /en/under-construction)
        const cleanPath = pathname.replace(/^\/(en|it|ar)/, '');

        const isAllowedPath =
            cleanPath === '' || // Allow empty path (e.g. /en)
            cleanPath === '/' || // Allow root (which shows waitlist)
            cleanPath === '/add-client' ||
            pathname === '/' ||
            pathname === '/add-client' ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/_next') ||
            pathname === '/favicon.ico' ||
            pathname === '/logo.jpeg'; // Allow logo

        if (!isAllowedPath) {
            // Redirect to root (preserving locale if possible, or just /)
            // If we redirect to just '/', next-intl middleware (which runs before or after depending on config) 
            // might handle the locale. 
            // Since this middleware runs AFTER intl middleware in the chain (in middleware.ts), 
            // we should try to keep the locale if present.

            const localeMatch = pathname.match(/^\/(en|it|ar)/);
            const locale = localeMatch ? localeMatch[0] : '';

            url.pathname = locale + '/';
            return NextResponse.redirect(url);
        }
    }

    // Use the passed response or create a new one
    let finalResponse = response || NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    // If we created a new response above, we might need to recreate it here to ensure cookies are set on the latest response
                    // But since we are using finalResponse which is a reference, we can just set cookies on it.
                    // However, the original code recreated the response. 
                    // Let's just set the cookies on the finalResponse.

                    finalResponse = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    // Copy existing headers/cookies if needed? 
                    // Actually, the supabase ssr pattern usually wants to recreate the response to ensure the request cookies are updated.
                    // But if we are chaining middleware, we might lose the intl headers if we recreate it completely without care.
                    // For now, let's try to just set cookies on the existing response object if possible, 
                    // OR if we must recreate, we should copy headers.

                    // The safest way with next-intl is to NOT recreate the response if it was passed in, 
                    // but supabase auth helpers often insist on it.
                    // Let's try to just set the cookies on the finalResponse object directly.

                    cookiesToSet.forEach(({ name, value, options }) =>
                        finalResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes logic
    // Reuse existing url object
    // Strip locale for route checks
    const cleanPath = pathname.replace(/^\/(en|it|ar)/, '');

    // Protected routes logic
    const isAdminRoute = cleanPath.startsWith('/admin');

    if (isAdminRoute) {
        if (!user) {
            url.pathname = '/auth/login'
            url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`
            return NextResponse.redirect(url)
        }

        // Check admin status
        const { data: adminData } = await supabase
            .from('admin_users')
            .select('id')
            .eq('auth_id', user.id)
            .eq('is_active', true)
            .single()

        if (!adminData) {
            url.pathname = '/unauthorized'
            return NextResponse.redirect(url)
        }
    }

    if (cleanPath.startsWith('/dashboard') || cleanPath.startsWith('/api/customer')) {
        if (!user) {
            url.pathname = '/auth/login'
            url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`
            return NextResponse.redirect(url)
        }
    }

    return finalResponse
}
