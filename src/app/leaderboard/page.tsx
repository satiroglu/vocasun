'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Crown, Medal, User, Shield, Calendar, Star } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { Profile } from '@/types';

export default function Leaderboard() {
    const [activeTab, setActiveTab] = useState<'weekly' | 'all-time'>('weekly');
    const { data: weeklyLeaders = [], isLoading: weeklyLoading } = useLeaderboard('weekly');
    const { data: allTimeLeaders = [], isLoading: allTimeLoading } = useLeaderboard('all-time');

    const isLoading = weeklyLoading || allTimeLoading;
    const activeData = activeTab === 'weekly' ? weeklyLeaders : allTimeLeaders;

    // Grid Layout Definition - Consistent for Header and Rows
    // Mobile: Rank(10) User(Auto) Level(Hidden/Small) Score(Auto)
    // Desktop: Rank(12) User(Auto) Level(20) Score(24)
    const gridClass = "grid grid-cols-[3rem_1fr_3rem_auto] sm:grid-cols-[4rem_1fr_6rem_8rem] items-center gap-2 sm:gap-4 px-4 py-3";

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 pt-24 pb-10 flex flex-col items-center font-sans">
                <div className="w-full max-w-5xl space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-16 w-16 bg-slate-200 rounded-2xl"></div>
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
                            <div className="h-4 w-32 bg-slate-200 rounded-lg"></div>
                        </div>
                    </div>
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-white rounded-xl border border-slate-100"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 pt-24 pb-20 font-sans">
            <div className="w-full max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="flex items-center gap-5 mb-8">
                    <div className="shrink-0 p-4 bg-yellow-50 text-yellow-600 rounded-2xl shadow-sm border border-yellow-100">
                        <Trophy size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">Liderlik Tablosu</h1>
                        <p className="text-slate-500 font-medium">En iyiler arasına gir, ismini yazdır!</p>
                    </div>
                </div>

                {/* TABS */}
                <div className="flex items-center gap-2 mb-6 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('weekly')}
                        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'weekly'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg'
                            }`}
                    >
                        <Calendar size={18} />
                        Bu Hafta
                    </button>
                    <button
                        onClick={() => setActiveTab('all-time')}
                        className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'all-time'
                            ? 'border-yellow-500 text-yellow-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg'
                            }`}
                    >
                        <Star size={18} />
                        Genel
                    </button>
                </div>

                {/* TABLE HEADER */}
                <div className={`bg-slate-100 rounded-t-xl border-x border-t border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider ${gridClass}`}>
                    <div className="text-center">#</div>
                    <div>Kullanıcı</div>
                    <div className="text-center">Seviye</div>
                    <div className="text-right">Puan</div>
                </div>

                {/* LIST */}
                <div className="bg-white rounded-b-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                    {activeData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Trophy size={48} className="mb-4 opacity-20" />
                            <p>Bu kategoride henüz puan yok. İlk sen ol!</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {activeData.map((user, index) => {
                                const rank = index + 1;
                                const displayScore = activeTab === 'weekly' ? (user.weekly_xp || 0) : user.total_xp;

                                // Rank Styles
                                let rankContent = <span className="font-bold text-slate-500">#{rank}</span>;
                                let rowBg = "hover:bg-slate-50";

                                if (rank === 1) {
                                    rankContent = <Crown size={24} className="text-yellow-500 fill-yellow-500 mx-auto" />;
                                    rowBg = "bg-yellow-50/30 hover:bg-yellow-50";
                                } else if (rank === 2) {
                                    rankContent = <Medal size={22} className="text-slate-400 fill-slate-300 mx-auto" />;
                                } else if (rank === 3) {
                                    rankContent = <Medal size={22} className="text-orange-500 fill-orange-400 mx-auto" />;
                                }

                                // User Info
                                const isAnonymous = user.leaderboard_visibility === 'anonymous';
                                let displayName = 'Gizli Kullanıcı';
                                if (!isAnonymous) {
                                    displayName = user.display_name_preference === 'fullname'
                                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Kullanıcı'
                                        : user.username || user.first_name || 'Kullanıcı';
                                }
                                const profileLink = (!isAnonymous && user.username) ? `/profile/${user.username}` : null;

                                const RowContent = () => (
                                    <>
                                        {/* Rank */}
                                        <div className="text-center">{rankContent}</div>

                                        {/* User */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center border border-slate-100 overflow-hidden ${rank === 1 ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                                                {user.avatar_url && !isAnonymous ? (
                                                    <img src={user.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    isAnonymous ? <User size={16} className="text-slate-400" /> : <span className="font-bold text-sm text-slate-500">{displayName.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="font-bold text-slate-700 text-sm sm:text-base truncate">
                                                {displayName}
                                                {isAnonymous && <Shield size={12} className="inline ml-1 text-slate-400" />}
                                            </div>
                                        </div>

                                        {/* Level */}
                                        <div className="text-center">
                                            <span className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
                                                Lv.{user.level || 1}
                                            </span>
                                        </div>

                                        {/* Score */}
                                        <div className={`text-right font-bold text-sm sm:text-base ${rank === 1 ? 'text-yellow-600' : 'text-indigo-600'}`}>
                                            {displayScore?.toLocaleString()}
                                        </div>
                                    </>
                                );

                                return profileLink ? (
                                    <Link
                                        key={index}
                                        href={profileLink}
                                        className={`${gridClass} ${rowBg} transition-colors cursor-pointer group`}
                                    >
                                        <RowContent />
                                    </Link>
                                ) : (
                                    <div key={index} className={`${gridClass} ${rowBg} transition-colors`}>
                                        <RowContent />
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}