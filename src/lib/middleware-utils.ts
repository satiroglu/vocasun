import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    // 1. Response oluştur (Cookie işlemleri için gerekli)
    let response = NextResponse.next({
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
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // GÜVENLİK VE GÜNCELLEME:
    // getSession() yerine getUser() kullanıyoruz.
    // getUser: Sunucuya istek atar ve token'ı doğrular. Token süresi dolmuşsa yeniler.
    // Bu, middleware'de session'ın her zaman güncel ve geçerli olmasını sağlar.
    const { data: { user }, error } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Public Routes
    const publicRoutes = ['/', '/login', '/register', '/auth/callback', '/forgot-password', '/update-password', '/changelog', '/about', '/privacy', '/terms', '/contact', '/kvkk', '/features'];
    const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route + '/'));

    // Yönlendirme Mantığı

    // 1. Giriş yapmamış kullanıcı korumalı sayfaya girmeye çalışırsa -> Login
    if (!user && !isPublicRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // 2. Giriş yapmış kullanıcı Login/Register sayfasına girmeye çalışırsa -> Dashboard
    if (user && (path === '/login' || path === '/register' || path === '/')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }

    // 3. Admin Route Protection
    if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }
    }

    return response;
}