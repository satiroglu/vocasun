import { Sun } from 'lucide-react';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
            <div className="relative mb-4">
                <Sun className="w-16 h-16 text-indigo-600 fill-indigo-600/10 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 bg-indigo-400/20 blur-xl rounded-full animate-pulse"></div>
            </div>
            <div className="text-indigo-900 font-bold text-lg animate-pulse">Yükleniyor...</div>
        </div>
    );
}
