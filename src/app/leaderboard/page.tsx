'use client';

import Link from 'next/link';
import { ArrowLeft, Trophy, Crown, Star } from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export default function Leaderboard() {
    const { data: leaders = [], isLoading: loading } = useLeaderboard();

    return (
        <div className="min-h-screen bg-slate-50 px-4 pt-20 pb-10 flex flex-col items-center font-sans">
            <div className="w-full max-w-2xl">
                <div className="flex items-center gap-4 mb-8">
                    {/* <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm text-slate-500 hover:text-indigo-600"><ArrowLeft size={24} /></Link> */}
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Trophy className="text-yellow-500" /> Liderlik Tablosu
                    </h1>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Sıralama yükleniyor...</div>
                ) : (
                    <div className="space-y-3">
                        {leaders.map((user, index) => {
                            // Top 3 için özel stil belirleme
                            let rankStyle = "bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:shadow-md";
                            let icon = <span className="font-bold text-lg w-8 text-center">#{index + 1}</span>;

                            if (index === 0) {
                                rankStyle = "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200 text-yellow-900 shadow-md scale-105 z-10 hover:shadow-lg";
                                icon = <div className="w-8 flex justify-center"><Crown className="text-yellow-600 fill-yellow-600" size={24} /></div>;
                            } else if (index === 1) {
                                rankStyle = "bg-slate-200 border-slate-300 text-slate-800 hover:shadow-md";
                                icon = <div className="w-8 flex justify-center"><Star className="text-slate-500 fill-slate-500" size={20} /></div>;
                            } else if (index === 2) {
                                rankStyle = "bg-orange-100 border-orange-200 text-orange-900 hover:shadow-md";
                                icon = <div className="w-8 flex justify-center"><Star className="text-orange-600 fill-orange-600" size={20} /></div>;
                            }

                            // Liderlik tablosu gizliliği kontrolü
                            const isAnonymous = user.leaderboard_visibility === 'anonymous';
                            
                            let displayName = 'Gizli Kullanıcı'; // Varsayılan (anonymous için)
                            
                            if (!isAnonymous) {
                                if (user.display_name_preference === 'fullname') {
                                    displayName = `${user.first_name} ${user.last_name}`;
                                } else if (user.username) {
                                    displayName = user.username;
                                } else {
                                    displayName = user.first_name || 'Kullanıcı';
                                }
                            }

                            // Anonim kullanıcılar veya username olmayanlar için profil linki yok
                            const profileLink = (!isAnonymous && user.username) ? `/profile/${user.username}` : null;

                            const cardContent = (
                                <>
                                    <div className="flex items-center gap-4">
                                        {icon}
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {displayName}
                                                {isAnonymous && <span className="text-xs bg-slate-200 text-slate-600 px-2 rounded-full">🔒</span>}
                                                {index === 0 && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 rounded-full">Lider</span>}
                                            </div>
                                            <div className="text-xs opacity-70">Seviye {user.level || 1}</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-lg">{user.total_xp} XP</div>
                                </>
                            );

                            return profileLink ? (
                                <Link 
                                    key={index}
                                    href={profileLink}
                                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${rankStyle}`}
                                >
                                    {cardContent}
                                </Link>
                            ) : (
                                <div key={index} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${rankStyle}`}>
                                    {cardContent}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}