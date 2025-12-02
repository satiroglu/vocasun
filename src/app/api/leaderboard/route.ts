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

        // 1. Create a Supabase client with service role key to access auth data
        const supabaseAdmin = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                cookies: {
                    getAll() { return [] },
                    setAll() { }
                }
            }
        );

        // 2. Fetch top candidates (we need more than 10 to account for unverified users)
        const { data: profiles, error } = await supabaseAdmin
            .from('profiles')
            .select('id, username, first_name, last_name, total_xp, weekly_xp, level, display_name_preference, leaderboard_visibility, avatar_url')
            .neq('leaderboard_visibility', 'hidden')
            .order(sortColumn, { ascending: false })
            .limit(50);

        if (error) {
            console.error('Error fetching profiles:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!profiles || profiles.length === 0) {
            return NextResponse.json([]);
        }

        // 3. Batch fetch auth users to check email verification
        // This is much more efficient than calling getUserById for each user
        const profileIds = profiles.map(p => p.id);
        const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
            perPage: 1000 // Sufficient for our use case
        });

        if (authError) {
            console.error('Error fetching auth users:', authError);
            return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        // Create a map of verified user IDs for O(1) lookup
        const verifiedUserIds = new Set(
            authUsers
                ?.filter(user => user.email_confirmed_at && profileIds.includes(user.id))
                .map(user => user.id) || []
        );

        // 4. Filter profiles to only verified users and take top 10
        const verifiedProfiles = profiles
            .filter(profile => verifiedUserIds.has(profile.id))
            .slice(0, 10);

        // Add cache headers to reduce server load
        // Cache for 60 seconds, allow stale content for 120 seconds while revalidating
        return NextResponse.json(verifiedProfiles, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            },
        });
    } catch (error: any) {
        console.error('Unexpected error in leaderboard API:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
