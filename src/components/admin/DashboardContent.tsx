'use client';

import React, { useMemo } from 'react';
import StatCard from '@/components/StatCard';
import Card from '@/components/Card';
import { Users, BookOpen, TrendingUp, UserPlus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardContentProps {
    stats: {
        userCount: number;
        wordCount: number;
    };
    recentUsers: any[];
    userGrowthRaw: any[];
}

export function AdminDashboardContent({ stats, recentUsers, userGrowthRaw }: DashboardContentProps) {
    const chartData = useMemo(() => {
        const days = 30;
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const count = userGrowthRaw.filter(u => {
                const uDate = new Date(u.created_at).toISOString().split('T')[0];
                return uDate === dateStr;
            }).length;

            data.push({
                date: date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
                users: count
            });
        }
        return data;
    }, [userGrowthRaw]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Users className="w-6 h-6 text-indigo-600" />}
                    label="Toplam Kullanıcı"
                    value={stats.userCount}
                    bg="bg-indigo-50"
                />
                <StatCard
                    icon={<BookOpen className="w-6 h-6 text-emerald-600" />}
                    label="Toplam Kelime"
                    value={stats.wordCount}
                    bg="bg-emerald-50"
                />
                <StatCard
                    icon={<UserPlus className="w-6 h-6 text-blue-600" />}
                    label="Son 30 Gün"
                    value={userGrowthRaw.length}
                    bg="bg-blue-50"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
                    label="Aktiflik"
                    value="-%" // Placeholder
                    bg="bg-amber-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card title="Kullanıcı Kayıt Grafiği" className="h-full">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="users"
                                        stroke="#4f46e5"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorUsers)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <div>
                    <Card title="Son Kayıtlar" className="h-full">
                        <div className="space-y-4">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-500 font-medium text-sm">
                                                {user.username?.[0]?.toUpperCase() || '?'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {user.username || 'İsimsiz'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
