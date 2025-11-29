import Link from 'next/link';
import {
  Sun, ArrowRight, Brain, Zap, LayoutGrid, PenTool, BookOpen,
  CheckCircle, Trophy, Users, Star, Sparkles, GraduationCap
} from 'lucide-react';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import DynamicWordCard from '@/components/DynamicWordCard';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">

      {/* --- Hero Section --- */}
      <header className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Dynamic Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-400/20 rounded-full blur-[100px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-amber-300/20 rounded-full blur-[80px]"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">

          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-indigo-100 text-indigo-600 text-sm font-bold mb-8 shadow-sm  transition cursor-default">
              <Sparkles size={16} className="fill-indigo-600" />
              <span>Yapay Zeka Destekli Öğrenme</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
              Kelime Ezberleme, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600">
                Kalıcı Öğren.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Sadece kart çevirmek yetmez. <b>Aktif yazma</b>, <b>dinleme</b> ve <b>akıllı tekrar sistemi (SRS)</b> ile İngilizce kelimeleri hafızana kalıcı olarak kazı.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register">
                <Button className="w-full sm:w-auto px-8 py-4 text-lg h-auto shadow-indigo-300/50 hover:shadow-indigo-300/80" icon={<ArrowRight size={20} />}>
                  Ücretsiz Başla
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-4 text-lg h-auto">
                  Nasıl Çalışır?
                </Button>
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} className="text-green-600" /></div>
                <span>Kredi Kartı Gerekmez</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1 rounded-full"><CheckCircle size={14} className="text-green-600" /></div>
                <span>10.000+ Kelime</span>
              </div>
            </div>
          </div>

          {/* Right: Visual Demo */}
          <div className="relative block perspective-1000 mt-10 lg:mt-0">
            <DynamicWordCard />
          </div>
        </div>
      </header>

      {/* --- Stats Section --- */}
      <section className="py-10 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem number="10K+" label="Kelime Havuzu" />
          <StatItem number="5K+" label="Mutlu Öğrenci" />
          <StatItem number="1M+" label="Pratik Yapıldı" />
          <StatItem number="4.9" label="Kullanıcı Puanı" />
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
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

      {/* --- How It Works Section --- */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Nasıl Çalışır?</h2>
            <p className="text-slate-600 text-lg">3 basit adımda kelime hazineni geliştirmeye başla.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-slate-100 -z-10"></div>

            <StepCard
              number="1"
              title="Ücretsiz Kaydol"
              desc="Saniyeler içinde hesabını oluştur ve seviyeni belirle."
              icon={<Users size={24} />}
            />
            <StepCard
              number="2"
              title="Paketini Seç"
              desc="İster A1, ister C1. İhtiyacın olan kelime paketini seç."
              icon={<BookOpen size={24} />}
            />
            <StepCard
              number="3"
              title="Öğrenmeye Başla"
              desc="Günde sadece 15 dakika ayırarak kelimeleri hafızana kazı."
              icon={<GraduationCap size={24} />}
            />
          </div>
        </div>
      </section>

      {/* --- Call to Action --- */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-12 md:p-20 text-center text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Kelime Hazineni Genişletmeye Hazır mısın?</h2>
            <p className="text-indigo-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">
              Binlerce kullanıcı arasına katıl ve İngilizce öğrenme yolculuğunu hızlandır. Tamamen ücretsiz.
            </p>
            <Link href="/register">
              <button className="bg-white text-indigo-600 px-10 py-4 rounded-xl font-bold text-xl hover:bg-indigo-50 transition shadow-lg hover:scale-105 active:scale-95">
                Hemen Başla
              </button>
            </Link>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo />
            <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
              Yapay zeka destekli, modern kelime öğrenme platformu.
            </p>
          </div>

          <div className="flex gap-8 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition">Hakkımızda</a>
            <a href="#" className="hover:text-indigo-600 transition">Gizlilik</a>
            <a href="#" className="hover:text-indigo-600 transition">İletişim</a>
          </div>

          <div className="text-slate-400 text-sm">
            © 2025 Vocasun Inc.
          </div>
        </div>
      </footer>

    </div>
  );
}

// --- Sub Components ---

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: string }) {
  return (
    <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 group">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-lg ${color} group-hover:scale-110 transition duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

function StatItem({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">{number}</div>
      <div className="text-sm font-bold text-slate-500 uppercase tracking-wide">{label}</div>
    </div>
  )
}

function StepCard({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center relative z-10">
      <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-50 shadow-xl flex items-center justify-center mb-6 relative group">
        <div className="absolute top-0 right-0 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white">
          {number}
        </div>
        <div className="text-indigo-600 group-hover:scale-110 transition duration-300">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 max-w-xs mx-auto">{desc}</p>
    </div>
  )
}