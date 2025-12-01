import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { }
                }
            }
        );

        // Check admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const query = searchParams.get('q') || '';
        const status = searchParams.get('status') || 'all';
        const sort = searchParams.get('sort') || 'updated_at';
        const order = searchParams.get('order') || 'desc';
        const offset = (page - 1) * limit;

        let supabaseQuery = supabase
            .from('user_progress')
            .select(`
                *,
                vocabulary!inner (
                    word,
                    meaning,
                    level,
                    type
                )
            `, { count: 'exact' })
            .eq('user_id', id);

        if (query) {
            supabaseQuery = supabaseQuery.or(`word.ilike.%${query}%,meaning.ilike.%${query}%`, { foreignTable: 'vocabulary' });
        }

        if (status === 'mastered') {
            supabaseQuery = supabaseQuery.eq('is_mastered', true);
        } else if (status === 'learning') {
            supabaseQuery = supabaseQuery.eq('is_mastered', false);
        }

        const [progressRes, userRes] = await Promise.all([
            supabaseQuery
                .order(sort, { ascending: order === 'asc' })
                .range(offset, offset + limit - 1),
            supabase
                .from('profiles')
                .select('username, email, avatar_url, level, total_xp')
                .eq('id', id)
                .single()
        ]);

        const { data: progress, count, error } = progressRes;
        const { data: userDetails } = userRes;

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({
            progress,
            user: userDetails,
            pagination: {
                total: count,
                totalPages: Math.ceil((count || 0) / limit),
                page,
                limit
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { }
                }
            }
        );

        // Check admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { progressId } = await request.json();

        if (!progressId) {
            return NextResponse.json({ error: 'Progress ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('user_progress')
            .delete()
            .eq('id', progressId)
            .eq('user_id', userId); // Extra safety check

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ message: 'Progress deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: userId } = await params;
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll() { }
                }
            }
        );

        // Check admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { progressId, is_mastered, repetitions, next_review } = body;

        if (!progressId) {
            return NextResponse.json({ error: 'Progress ID is required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('user_progress')
            .update({
                is_mastered,
                repetitions,
                next_review,
                updated_at: new Date().toISOString()
            })
            .eq('id', progressId)
            .eq('user_id', userId);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json({ message: 'Progress updated successfully' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
