import Link from 'next/link';
import { Sun, ArrowRight, Brain, Zap, LayoutGrid, PenTool, BookOpen, CheckCircle, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sun className="w-8 h-8 fill-indigo-600/20" />
            <span className="text-2xl font-bold tracking-tight">Vocasun</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-slate-600 hover:text-indigo-600 font-medium transition">
              Giriş Yap
            </Link>
            <Link href="/register" className="bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20">
              Hemen Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="relative pt-20 pb-32 lg:pt-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Sol Taraf: Metin */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold mb-6 border border-indigo-100">
              <Zap size={16} className="fill-indigo-600" /> Yapay Zeka Destekli Öğrenme
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
              Kelime Ezberleme, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Kalıcı Öğren.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Sadece kart çevirmek yetmez. <b>Yazarak</b>, <b>dinleyerek</b> ve <b>akıllı tekrar sistemi (SRS)</b> ile İngilizce kelimeleri hafızana kalıcı olarak kazı.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register" className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 hover:-translate-y-1">
                Ücretsiz Başla <ArrowRight size={20} />
              </Link>
              <a href="#features" className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition">
                Nasıl Çalışır?
              </a>
            </div>

            <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Kredi Kartı Gerekmez</div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> 10.000+ Kelime</div>
            </div>
          </div>

          {/* Sağ Taraf: Görsel / Demo */}
          <div className="relative hidden lg:block perspective-1000">
            {/* Dekoratif Arkaplan */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl -z-10"></div>

            {/* Floating Card Demo */}
            <div className="relative w-80 h-96 mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col p-6 rotate-3 hover:rotate-0 transition duration-500 group cursor-default">
              <div className="flex justify-between items-center mb-8">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">B2 Seviye</span>
                <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Fiil</span>
              </div>
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                <h3 className="text-4xl font-extrabold text-slate-800 mb-2 group-hover:scale-110 transition">resilience</h3>
                <p className="text-slate-400 text-sm">(Direnç, Esneklik)</p>
              </div>
              <div className="mt-auto">
                <div className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-center shadow-lg mb-2">
                  Kontrol Et
                </div>
                <div className="flex justify-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                  <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                  <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -right-6 top-20 bg-white p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 animate-bounce">
                <Trophy className="text-yellow-500 w-5 h-5" />
                <span className="font-bold text-slate-800 text-sm">+10 XP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Sadece Ezberleme, <span className="text-indigo-600">İçselleştir.</span>
            </h2>
            <p className="text-slate-600 text-lg">
              Vocasun, beyninin çalışma prensiplerine uygun olarak tasarlandı. İşte seni başarıya götürecek özellikler.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain size={32} className="text-white" />}
              color="bg-indigo-600"
              title="Aralıklı Tekrar (SRS)"
              desc="Unutma eğrisini kırın. Sistem, kelimeyi tam unutacağınız anda karşınıza çıkararak kalıcı hafızaya atmanızı sağlar."
            />
            <FeatureCard
              icon={<PenTool size={32} className="text-white" />}
              color="bg-purple-600"
              title="Aktif Yazma Modu"
              desc="Sadece şık seçmek yetmez. Kelimeyi klavyeyle yazmak, öğrenme hızını ve doğruluğunu %50 oranında artırır."
            />
            <FeatureCard
              icon={<LayoutGrid size={32} className="text-white" />}
              color="bg-amber-500"
              title="Oyunlaştırma & Lig"
              desc="Öğrenirken eğlenin. Puan toplayın, seviye atlayın ve haftalık liderlik tablosunda arkadaşlarınızla yarışın."
            />
          </div>
        </div>
      </section>

      {/* --- Call to Action --- */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Kelime Hazineni Genişletmeye Hazır mısın?</h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
              Binlerce kullanıcı arasına katıl ve İngilizce öğrenme yolculuğunu hızlandır. Tamamen ücretsiz.
            </p>
            <Link href="/register" className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-2xl font-bold text-xl hover:bg-indigo-50 transition shadow-lg">
              Hemen Başla
            </Link>
          </div>

          {/* Dekoratif Çemberler */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/30 rounded-full translate-x-1/2 translate-y-1/2 blur-2xl"></div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center gap-4">
          <div className="p-3 bg-slate-50 rounded-full">
            <Sun className="w-8 h-8 text-indigo-600 fill-indigo-600/20" />
          </div>
          <p className="text-slate-500 font-medium">© 2025 Vocasun. Tüm hakları saklıdır.</p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition">Gizlilik</a>
            <a href="#" className="hover:text-indigo-600 transition">Kullanım Şartları</a>
            <a href="#" className="hover:text-indigo-600 transition">İletişim</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Feature Card Bileşeni
function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}