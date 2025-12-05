import Link from 'next/link';
import { LogOut } from 'lucide-react';

interface LearnExitModalProps {
    onCancel: () => void;
}

export default function LearnExitModal({ onCancel }: LearnExitModalProps) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel}></div>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative z-10 overflow-hidden animate-in zoom-in-95 duration-300 p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LogOut size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Çıkmak İstediğine Emin misin?</h3>
                <p className="text-slate-500 font-medium mb-6">Şu an çok iyi gidiyorsun! Oturumu yarıda bırakırsan serini bozabilirsin.</p>
                <div className="space-y-3">
                    <button onClick={onCancel} className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-transform hover:bg-indigo-700">
                        Öğrenmeye Devam Et
                    </button>
                    <Link href="/dashboard" className="block w-full">
                        <button className="w-full py-3.5 bg-white border-2 border-slate-100 text-slate-400 rounded-xl font-bold text-lg hover:bg-slate-50 hover:text-slate-600 transition">
                            Pes Ediyorum
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
