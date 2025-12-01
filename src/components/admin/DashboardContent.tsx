'use client';
import { useMemo } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, BookOpen, TrendingUp, UserPlus, Trophy, CheckCircle, Activity, BarChart2 } from 'lucide-react';

interface AdminDashboardContentProps {
    stats: {
        userCount: number;
        wordCount: number;
        totalXP: number;
        avgLevel: string;
        masteredCount: number;
        learningCount: number;
        userLevelDist: Record<string, number>;
        wordLevelDist: Record<string, number>;
        wordTypeDist: Record<string, number>;
        preferenceDist: Record<string, number>;
    };
    recentUsers: any[];
    userGrowthRaw: any[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboardContent({ stats, recentUsers, userGrowthRaw }: AdminDashboardContentProps) {
    // Process chart data
    const chartData = useMemo(() => {
        const data: Record<string, number> = {};
        userGrowthRaw.forEach((user: any) => {
            const date = new Date(user.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
            data[date] = (data[date] || 0) + 1;
        });
        return Object.entries(data).map(([date, count]) => ({ date, users: count }));
    }, [userGrowthRaw]);

    const wordLevelData = useMemo(() => Object.entries(stats.wordLevelDist).map(([name, value]) => ({ name, value })), [stats.wordLevelDist]);
    const userLevelData = useMemo(() => Object.entries(stats.userLevelDist).map(([name, value]) => ({ name, value })), [stats.userLevelDist]);
    const preferenceData = useMemo(() => Object.entries(stats.preferenceDist).map(([name, value]) => ({ name, value })), [stats.preferenceDist]);

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-xl p-6 sm:p-12 text-white shadow-xl shadow-slate-200 dark:shadow-none relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-slate-100 mb-4">
                        <Users size={14} /> Admin Paneli
                    </div>
                    <h1 className="text-2xl sm:text-5xl font-bold mb-4 tracking-tight">Hoş geldin, Admin! 👋</h1>
                    <p className="text-slate-300 mb-0 max-w-lg text-base sm:text-lg leading-relaxed">
                        Sistem istatistiklerini buradan takip edebilir ve yönetebilirsin.
                    </p>
                </div>
                <div className="absolute -right-12 -top-12 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full filter blur-[80px]"></div>
            </section>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users className="text-indigo-600" />} label="Toplam Kullanıcı" value={stats.userCount} bg="bg-indigo-50" />
                <StatCard icon={<BookOpen className="text-emerald-600" />} label="Toplam Kelime" value={stats.wordCount} bg="bg-emerald-50" />
                <StatCard icon={<Trophy className="text-amber-600" />} label="Toplam XP" value={formatNumber(stats.totalXP)} bg="bg-amber-50" />
                <StatCard icon={<Activity className="text-blue-600" />} label="Ort. Seviye" value={stats.avgLevel} bg="bg-blue-50" />
                <StatCard icon={<CheckCircle className="text-green-600" />} label="Öğrenilen" value={formatNumber(stats.masteredCount)} bg="bg-green-50" />
                <StatCard icon={<BarChart2 className="text-purple-600" />} label="Çalışılan" value={formatNumber(stats.learningCount)} bg="bg-purple-50" />
                <StatCard icon={<UserPlus className="text-pink-600" />} label="Son 30 Gün" value={userGrowthRaw.length} bg="bg-pink-50" />
                <StatCard icon={<TrendingUp className="text-cyan-600" />} label="Aktiflik" value="-%" bg="bg-cyan-50" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Area Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Kullanıcı Kayıt Grafiği</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Word Level Distribution Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Kelime Seviye Dağılımı</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={wordLevelData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* User Level Distribution Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Kullanıcı Seviye Dağılımı</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={userLevelData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* User Preferences Pie Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[400px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Kullanıcı Tercihleri</h3>
                    <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                            <Pie
                                data={preferenceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {preferenceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Users List */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Son Kayıtlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-slate-500 font-bold text-sm">
                                        {user.username?.[0]?.toUpperCase() || '?'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 truncate">
                                    {user.username || 'İsimsiz'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                    {user.email}
                                </p>
                            </div>
                            <div className="text-xs font-medium text-slate-400">
                                {new Date(user.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode, label: string, value: string | number, bg: string }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
        </div>
    );
}
