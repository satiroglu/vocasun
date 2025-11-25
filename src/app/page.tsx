import Link from 'next/link';
import { Sun } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900">
      {/* --- Navbar --- */}
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="text-2xl font-bold text-indigo-600 flex items-center gap-2 cursor-pointer">
            <Sun className="w-8 h-8" />
            <span>Vocasun</span>
          </div>
          <div className="space-x-4">
            <Link href="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition">
              Giriş Yap
            </Link>
            <Link href="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition shadow-md hover:shadow-lg">
              Üye Ol
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-indigo-50/50 to-white">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold border border-indigo-100">
          🚀 İngilizce Öğrenmenin En Akıllı Yolu
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-slate-900">
          Kelime Ezberleme, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Gerçekten Öğren.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          Sadece kartları çevirme. <b>Yazarak</b>, <b>dinleyerek</b> ve <b>bağlam içinde</b> görerek kalıcı hafızana at.
          Yapay zeka destekli aralıklı tekrar sistemiyle unutmaya son ver.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">
            Hemen Başla (Ücretsiz)
          </Link>
          <a href="#nasil" className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition">
            Nasıl Çalışır?
          </a>
        </div>
      </main>

      {/* --- Özellikler --- */}
      <section id="nasil" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <FeatureCard
            icon="🎧"
            title="Duyarak Öğren"
            desc="Kelimelerin doğru telaffuzlarını dinle, kulak dolgunluğu kazan."
          />
          <FeatureCard
            icon="✍️"
            title="Yazarak Pekiştir"
            desc="Sadece seçmek yetmez. Kelimeyi kendin yazarak kas hafızanı çalıştır."
          />
          <FeatureCard
            icon="📈"
            title="Gelişimini İzle"
            desc="Hangi seviyedesin? Detaylı istatistiklerle ilerlemeni gün gün takip et."
          />
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2024 Vocasun. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}