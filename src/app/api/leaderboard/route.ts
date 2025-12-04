import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const timeframe = searchParams.get('timeframe') || 'weekly';

        // Input validation
        if (!['weekly', 'all-time'].includes(timeframe)) {
            return NextResponse.json({ error: 'Invalid timeframe' }, { status: 400 });
        }

        const sortColumn = timeframe === 'weekly' ? 'weekly_xp' : 'total_xp';

        // Create Supabase client with ANON key (RLS will handle security)
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll() },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    }
                }
            }
        );

        // Fetch profiles using RLS policies
        // NOTE: Supabase RLS policy should:
        // 1. Filter out users with leaderboard_visibility = 'hidden'
        // 2. Only return verified users (email_confirmed_at IS NOT NULL)
        // 3. Allow public read access to leaderboard data
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, username, first_name, last_name, total_xp, weekly_xp, level, display_name_preference, leaderboard_visibility, avatar_url')
            .neq('leaderboard_visibility', 'hidden')
            .order(sortColumn, { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error fetching profiles:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Add cache headers to reduce server load
        // Cache for 60 seconds, allow stale content for 120 seconds while revalidating
        return NextResponse.json(profiles || [], {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch (error: any) {
        console.error('Unexpected error in leaderboard API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
