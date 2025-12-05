import { ArrowLeft, PenTool, LayoutGrid, BookOpen } from 'lucide-react';

type Mode = 'write' | 'choice' | 'flip';

interface LearnHeaderProps {
    current: number;
    total: number;
    mode: Mode;
    setMode: (mode: Mode) => void;
    onExit: () => void;
}

export default function LearnHeader({ current, total, mode, setMode, onExit }: LearnHeaderProps) {
    const progressPercentage = total > 0
        ? Math.min(100, (current / total) * 100)
        : 0;

    return (
        <>
            <div className="h-16 px-4 flex items-center justify-between bg-white border-b border-slate-200 shrink-0 z-20">
                <button onClick={onExit} className="p-2.5 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"><ArrowLeft size={28} /></button>

                <div className="flex gap-1 bg-slate-100 p-1.5 rounded-xl overflow-x-auto no-scrollbar">
                    <button onClick={() => setMode('write')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'write' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>
                        <PenTool size={20} />
                        <span className={`text-sm font-bold ${mode === 'write' ? 'block' : 'hidden sm:block'}`}>Yaz</span>
                    </button>
                    <button onClick={() => setMode('choice')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'choice' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>
                        <LayoutGrid size={20} />
                        <span className={`text-sm font-bold ${mode === 'choice' ? 'block' : 'hidden sm:block'}`}>Seç</span>
                    </button>
                    <button onClick={() => setMode('flip')} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${mode === 'flip' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}`}>
                        <BookOpen size={20} />
                        <span className={`text-sm font-bold ${mode === 'flip' ? 'block' : 'hidden sm:block'}`}>Kart</span>
                    </button>
                </div>
            </div>

            <div className="bg-white border-b border-slate-100 px-4 py-2 shrink-0 z-10">
                <div className="max-w-lg mx-auto w-full">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                        <span>İlerleme</span>
                        <span>{current} / {total}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                    </div>
                </div>
            </div>
        </>
    );
}
