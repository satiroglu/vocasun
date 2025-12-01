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

    // PERFORMANS İYİLEŞTİRMESİ:
    // getUser() yerine getSession() kullanıyoruz.
    // getSession: Yerel cookie'deki JWT'yi kontrol eder (Çok hızlıdır).
    // getUser: Sunucuya istek atar (Güvenlidir ama yavaştır).
    // Middleware'de sadece session'ı yenilemek (refresh token) yeterlidir.
    // Asıl güvenlik kontrolünü sayfa (page.tsx) tarafında yapmaya devam edeceksiniz.
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;

    const path = request.nextUrl.pathname;

    // Public Routes
    const publicRoutes = ['/', '/login', '/register', '/auth/callback', '/forgot-password', '/update-password'];
    const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route + '/'));

    // Yönlendirme Mantığı (Hala gerekli ama artık daha hızlı çalışacak)

    // 1. Giriş yapmamış kullanıcı korumalı sayfaya girmeye çalışırsa -> Login
    if (!user && !isPublicRoute) {
        // URL'i korumak için redirect yerine rewrite kullanmıyoruz, tam redirect yapıyoruz.
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