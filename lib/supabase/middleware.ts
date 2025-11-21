import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // Maintenance Mode Check
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    const url = request.nextUrl.clone();
    const { pathname } = url;

    if (isMaintenanceMode) {
        // Allowed paths during maintenance
        const isAllowedPath =
            pathname === '/add-client' ||
            pathname === '/under-construction' ||
            pathname.startsWith('/api') ||
            pathname.startsWith('/_next') ||
            pathname === '/favicon.ico' ||
            pathname === '/logo.jpeg'; // Allow logo

        if (!isAllowedPath) {
            url.pathname = '/under-construction';
            return NextResponse.redirect(url);
        }
    }

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

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
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Protected routes logic
    // Reuse existing url object
    const isAdminRoute = url.pathname.startsWith('/admin')

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

    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/api/customer')) {
        if (!user) {
            url.pathname = '/auth/login'
            url.search = `?redirect=${encodeURIComponent(request.nextUrl.pathname)}`
            return NextResponse.redirect(url)
        }
    }

    return response
}
