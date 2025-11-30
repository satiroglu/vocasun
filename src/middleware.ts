import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/middleware-utils';

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
        /*
         * Sadece şu yollarla başlayan istekleri yakala:
         * - /dashboard
         * - /settings
         * - /learn
         * - /history
         * - /leaderboard
         * - /login (Giriş yapmış kullanıcıyı yönlendirmek için)
         * - /register (Giriş yapmış kullanıcıyı yönlendirmek için)
         * - /auth (Auth callback işlemleri için)
         */
        '/dashboard/:path*',
        '/settings/:path*',
        '/learn/:path*',
        '/history/:path*',
        '/leaderboard/:path*',
        '/login',
        '/register',
        '/auth/:path*',
        '/update-password',
        '/welcome',
    ],
};
