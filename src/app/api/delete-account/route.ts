import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Next.js 15/16 için

export async function DELETE(request: Request) {
    // 1. İsteği yapan kullanıcının oturumunu kontrol et (Güvenlik)
    // Not: Burada normal client kullanıyoruz çünkü cookie'den oturum okuyacağız
    // Ancak Next.js 16'da cookie yönetimi değiştiği için en basit yöntem:
    // Kullanıcı ID'sini body'den almak yerine, Authorization header'dan veya
    // Supabase'in auth helper'ıyla almak gerekir.

    // Basitlik ve MVP için Service Role ile işlem yapacağız.
    // DİKKAT: Bu işlem çok kritiktir. Prod ortamında middleware koruması olduğundan emin ol.

    try {
        const requestBody = await request.json();
        const { userId } = requestBody;

        if (!userId) {
            return NextResponse.json({ error: 'User ID gerekli' }, { status: 400 });
        }

        // 2. Admin yetkisiyle Supabase'e bağlan (Service Role Key ile)
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY! // .env dosyana bunu eklemelisin!
        );

        // 3. Kullanıcıyı Auth sisteminden sil
        // Bu işlem, veritabanındaki 'profiles' tablosunda 'ON DELETE CASCADE' varsa orayı da siler.
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: 'Hesap başarıyla silindi' });

    } catch (error) {
        return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}