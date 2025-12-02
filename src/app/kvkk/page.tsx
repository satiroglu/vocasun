'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/landing/Footer';
import KvkkContent from '@/components/legal/KvkkContent';

export default function Kvkk() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8">KVKK Aydınlatma Metni</h1>
                    <KvkkContent />
                </div>
            </main>

            <Footer />
        </div>
    );
}
