'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/landing/Footer';
import TermsContent from '@/components/legal/TermsContent';

export default function Terms() {
    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8">Kullanım Koşulları ve Üyelik Sözleşmesi</h1>
                    <TermsContent />
                </div>
            </main>

            <Footer />
        </div>
    );
}
