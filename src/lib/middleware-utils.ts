import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
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

    // Kullanıcıyı kontrol et
    const { data: { user } } = await supabase.auth.getUser();

    const path = request.nextUrl.pathname;

    // Public Routes (Herkesin erişebileceği sayfalar)
    const publicRoutes = ['/', '/login', '/register', '/auth/callback', '/forgot-password', '/update-password'];

    // Statik dosyalar ve API route'ları hariç tutulmalı mı? 
    // Matcher zaten statik dosyaları eliyor. API route'ları için ayrı kontrol gerekebilir ama şimdilik basit tutalım.

    const isPublicRoute = publicRoutes.some(route => path === route || path.startsWith(route + '/'));

    // 1. Kullanıcı giriş yapmamışsa ve korumalı bir sayfaya girmeye çalışıyorsa -> Login'e at
    if (!user && !isPublicRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Kullanıcı giriş yapmışsa ve Login/Register gibi sayfalara girmeye çalışıyorsa -> Dashboard'a at
    if (user && (path === '/login' || path === '/register' || path === '/')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Güvenlik Header'ları Ekle
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}