import Link from 'next/link';
import { Trophy, RotateCcw } from 'lucide-react';
import Button from '@/components/Button';

interface LearnFinishedProps {
    stats: { correct: number; wrong: number; earnedXp: number };
    onRestart: () => void;
}

export default function LearnFinished({ stats, onRestart }: LearnFinishedProps) {
    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-slate-50 text-center font-sans pt-16">
            <div className="bg-white p-8 sm:p-12 rounded-xl shadow-xl border border-slate-100 w-full max-w-md animate-scale-up">
                <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-200">
                    <Trophy size={40} className="fill-yellow-600" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Tebrikler! 🎉</h2>
                <p className="text-slate-500 mb-8 font-medium">Bu oturumu başarıyla tamamladın.</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="text-3xl font-black text-green-600">{stats.correct}</div>
                        <div className="text-xs font-bold text-green-500 uppercase tracking-wide">Doğru</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <div className="text-3xl font-black text-indigo-600">+{stats.earnedXp}</div>
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wide">XP Kazanıldı</div>
                    </div>
                </div>

                <div className="space-y-3">
                    <Button onClick={onRestart} className="w-full h-14 text-lg shadow-indigo-200" icon={<RotateCcw size={20} />}>
                        Yeni Oturum Başlat
                    </Button>
                    <Link href="/dashboard" className="block">
                        <Button variant="outline" className="w-full h-14 text-lg border-2">Panel'e Dön</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
