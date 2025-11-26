'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Bir şeyler ters gitti!</h2>
            <p className="text-slate-500 mb-6 max-w-md">{error.message || "Beklenmedik bir hata oluştu."}</p>
            <button
                onClick={() => reset()}
                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
            >
                Tekrar Dene
            </button>
        </div>
    );
}