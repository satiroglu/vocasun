import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Tüm setleri ve kullanıcının durumunu çek
    // Left Join mantığı: Setlerin hepsi gelsin, kullanıcıda ekli ise aktiflik durumu gelsin
    const { data, error } = await supabase
        .from('vocabulary_sets')
        .select(`
      id,
      title,
      description,
      slug,
      user_active_sets!left (
        is_active,
        user_id
      )
    `)
        .eq('user_active_sets.user_id', user.id) // Sadece bu kullanıcının aktiflik durumunu eşle
        .or(`user_id.eq.${user.id},user_id.is.null`, { foreignTable: 'user_active_sets' });
    // Not: Supabase join syntax'ı bazen karışıktır. Daha temiz yöntem:
    // İki sorgu atıp birleştirmek veya RPC yazmaktır. Ama şimdilik basit ilerleyelim.

    // Basit Yöntem (Performanslı): Raw SQL veya iki ayrı sorgu.
    // Frontend tarafında birleştirme yapabiliriz daha temiz olur.

    // Düzeltme: En temiz yöntem view veya rpc kullanmaktır ama burada JS ile mapleyeceğiz.
    const { data: allSets } = await supabase.from('vocabulary_sets').select('*').order('id');
    const { data: userSets } = await supabase.from('user_active_sets').select('set_id, is_active').eq('user_id', user.id);

    // Veriyi birleştir
    const sets = allSets?.map(set => {
        const userSet = userSets?.find(us => us.set_id === set.id);
        return {
            ...set,
            is_active: userSet ? userSet.is_active : false // Varsayılan kapalı olsun veya genel seti açıksa true
        };
    });

    return NextResponse.json(sets);
}

export async function POST(request: Request) {
    const { setId, isActive } = await request.json();

    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll() { return cookieStore.getAll() }, setAll() { } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Upsert (Varsa güncelle, yoksa ekle)
    const { error } = await supabase
        .from('user_active_sets')
        .upsert({
            user_id: user.id,
            set_id: setId,
            is_active: isActive
        }, { onConflict: 'user_id, set_id' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}