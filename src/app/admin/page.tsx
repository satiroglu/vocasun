import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import AdminDashboardContent from '@/components/admin/DashboardContent';

export default async function AdminPage() {
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

    // 1. Basic Counts
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: wordCount } = await supabase.from('vocabulary').select('*', { count: 'exact', head: true });

    // 2. Recent Users & Growth
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: userGrowthData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

    // 3. Advanced Stats (Aggregations)
    // Note: For large datasets, these should be optimized or cached.
    const { data: allProfiles } = await supabase.from('profiles').select('total_xp, level, preferred_word_list');
    const { data: allWords } = await supabase.from('vocabulary').select('level, type');
    const { data: allProgress } = await supabase.from('user_progress').select('is_mastered');

    // Calculate Aggregates
    const totalXP = allProfiles?.reduce((sum, p) => sum + (p.total_xp || 0), 0) || 0;
    const avgLevel = allProfiles?.length ? (allProfiles.reduce((sum, p) => sum + (p.level || 1), 0) / allProfiles.length).toFixed(1) : '1.0';

    const masteredCount = allProgress?.filter(p => p.is_mastered).length || 0;
    const learningCount = (allProgress?.length || 0) - masteredCount;

    // Distributions
    const userLevelDist = allProfiles?.reduce((acc: any, p) => {
        const lvl = `Lvl ${p.level}`;
        acc[lvl] = (acc[lvl] || 0) + 1;
        return acc;
    }, {});

    const wordLevelDist = allWords?.reduce((acc: any, w) => {
        const lvl = w.level || 'Unknown';
        acc[lvl] = (acc[lvl] || 0) + 1;
        return acc;
    }, { 'A1': 0, 'A2': 0, 'B1': 0, 'B2': 0, 'C1': 0, 'C2': 0 });

    const wordTypeDist = allWords?.reduce((acc: any, w) => {
        const type = w.type || 'Other';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    const preferenceDist = allProfiles?.reduce((acc: any, p) => {
        const pref = p.preferred_word_list || 'Not Set';
        acc[pref] = (acc[pref] || 0) + 1;
        return acc;
    }, {});

    const extendedStats = {
        userCount: userCount || 0,
        wordCount: wordCount || 0,
        totalXP,
        avgLevel,
        masteredCount,
        learningCount,
        userLevelDist,
        wordLevelDist,
        wordTypeDist,
        preferenceDist
    };

    return (
        <div className="space-y-6">
            <AdminDashboardContent
                stats={extendedStats}
                recentUsers={recentUsers || []}
                userGrowthRaw={userGrowthData || []}
            />
        </div>
    );
}
