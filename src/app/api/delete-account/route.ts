import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
    try {
        // 1. Çerez deposunu al
        const cookieStore = await cookies();

        // 2. İsteği yapan kullanıcının oturumunu doğrula
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Server Component context'inde cookie set edilemeyebilir, güvenli yoksayma
                        }
                    },
                },
            }
        );

        // 3. Oturum açmış kullanıcıyı al
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Oturum açmanız gerekiyor.' }, { status: 401 });
        }

        // 4. Body'den gelen ID'yi al (opsiyonel, çünkü zaten user.id'yi kullanacağız)
        // Güvenlik için body'deki ID'ye güvenmek yerine, token'dan gelen user.id'yi kullanıyoruz.
        // Ancak admin işlemi için service role gerekiyorsa, ID kontrolü şarttır.

        // Kendi hesabını silme senaryosu:
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // .env dosyasında olduğundan emin olun
            {
                cookies: {
                    getAll() { return [] },
                    setAll() { }
                }
            }
        );

        // Kullanıcıyı sil
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error("Silme hatası:", deleteError);
            return NextResponse.json({ error: 'Silme işlemi başarısız.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Hesap başarıyla silindi.' });

    } catch (error: any) {
        return NextResponse.json({ error: 'Sunucu hatası: ' + error.message }, { status: 500 });
    }
}