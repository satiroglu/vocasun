'use client';

import Link from 'next/link';
import { Trophy, Crown, Medal, User, Shield } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export default function Leaderboard() {
    const { data: leaders = [], isLoading: loading } = useLeaderboard();

    // Skeleton Loading
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 px-3 sm:px-4 pt-20 pb-10 flex flex-col items-center font-sans">
                <div className="w-full max-w-2xl animate-pulse space-y-4">
                    <div className="h-8 w-48 bg-slate-200 rounded-lg mb-8"></div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-20 bg-white rounded-xl border border-slate-100"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-3 sm:px-4 pt-20 pb-20 flex flex-col items-center font-sans">
            <div className="w-full max-w-2xl">

                {/* HEADER */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 bg-yellow-50 text-yellow-600 rounded-xl shadow-sm border border-yellow-100">
                        <Trophy size={24} className="sm:w-7 sm:h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Liderlik Tablosu</h1>
                        <p className="text-slate-500 text-xs sm:text-sm">En çok XP kazananlar burada!</p>
                    </div>
                </div>

                {/* LISTE KAPSAYICI */}
                <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-slate-100 min-h-[400px]">

                    {leaders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <Trophy size={48} className="mb-4 opacity-20" />
                            <p>Henüz kimse yok. İlk sen ol!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {leaders.map((user, index) => {
                                const rank = index + 1;

                                // Stil Belirleme
                                let cardStyle = "border-slate-100 hover:border-indigo-200 hover:bg-slate-50";
                                let rankBadge = <span className="font-bold text-slate-400 w-6 sm:w-8 text-center text-sm sm:text-base">#{rank}</span>;
                                let iconColor = "text-slate-400";

                                if (rank === 1) {
                                    cardStyle = "border-yellow-200 bg-yellow-50/30 hover:bg-yellow-50 hover:border-yellow-300 shadow-sm";
                                    rankBadge = <div className="w-6 sm:w-8 flex justify-center"><Crown size={20} className="sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500 animate-bounce-slow" /></div>;
                                    iconColor = "text-yellow-600";
                                } else if (rank === 2) {
                                    cardStyle = "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300";
                                    rankBadge = <div className="w-6 sm:w-8 flex justify-center"><Medal size={20} className="sm:w-6 sm:h-6 text-slate-400 fill-slate-300" /></div>;
                                    iconColor = "text-slate-500";
                                } else if (rank === 3) {
                                    cardStyle = "border-orange-200 bg-orange-50/30 hover:bg-orange-50 hover:border-orange-300";
                                    rankBadge = <div className="w-6 sm:w-8 flex justify-center"><Medal size={20} className="sm:w-6 sm:h-6 text-orange-500 fill-orange-400" /></div>;
                                    iconColor = "text-orange-600";
                                }

                                // Gizlilik Kontrolü
                                const isAnonymous = user.leaderboard_visibility === 'anonymous';
                                let displayName = 'Gizli Kullanıcı';

                                if (!isAnonymous) {
                                    if (user.display_name_preference === 'fullname') {
                                        displayName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Kullanıcı';
                                    } else {
                                        displayName = user.username || user.first_name || 'Kullanıcı';
                                    }
                                }

                                const profileLink = (!isAnonymous && user.username) ? `/profile/${user.username}` : null;

                                const CardContent = () => (
                                    <>
                                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                                            {rankBadge}

                                            {/* Avatar / İkon */}
                                            <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${rank === 1 ? 'bg-yellow-100' : 'bg-slate-100'}`}>
                                                {isAnonymous ? (
                                                    <User size={16} className="sm:w-5 sm:h-5 text-slate-400" />
                                                ) : (
                                                    <span className={`font-bold text-sm sm:text-base ${iconColor}`}>
                                                        {displayName.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="font-bold text-slate-800 flex items-center gap-2 text-sm sm:text-base truncate">
                                                    <span className="truncate">{displayName}</span>
                                                    {isAnonymous && <Shield size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0" />}
                                                    {rank === 1 && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full border border-yellow-200 shrink-0">Lider</span>}
                                                </div>
                                                <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Seviye {user.level || 1}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end shrink-0 ml-2">
                                            <div className={`font-bold text-sm sm:text-lg ${rank === 1 ? 'text-yellow-600' : 'text-indigo-600'}`}>
                                                {user.total_xp} <span className="text-[10px] sm:text-sm text-slate-400 font-medium">XP</span>
                                            </div>
                                        </div>
                                    </>
                                );

                                return profileLink ? (
                                    <Link
                                        key={index}
                                        href={profileLink}
                                        className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all cursor-pointer group ${cardStyle}`}
                                    >
                                        <CardContent />
                                    </Link>
                                ) : (
                                    <div key={index} className={`flex items-center justify-between p-3 sm:p-4 rounded-xl border-2 transition-all ${cardStyle}`}>
                                        <CardContent />
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