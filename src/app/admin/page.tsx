import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AdminDashboardContent } from '@/components/admin/DashboardContent';

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

    // Fetch stats
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: wordCount } = await supabase.from('vocabulary').select('*', { count: 'exact', head: true });

    // Fetch recent users
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, username, email, created_at, avatar_url')
        .order('created_at', { ascending: false })
        .limit(5);

    // Fetch user growth data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: userGrowthData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Genel Bakış</h1>
            <AdminDashboardContent
                stats={{ userCount: userCount || 0, wordCount: wordCount || 0 }}
                recentUsers={recentUsers || []}
                userGrowthRaw={userGrowthData || []}
            />
        </div>
    );
}
