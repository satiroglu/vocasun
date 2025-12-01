import Hero from '@/components/landing/Hero';
import Stats from '@/components/landing/Stats';
import Features from '@/components/landing/Features';
import LearningModes from '@/components/landing/LearningModes';
import ScientificBasis from '@/components/landing/ScientificBasis';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
      <Hero />
      <Stats />
      <Features />
      <LearningModes />
      <ScientificBasis />
      <CTA />
      <Footer />
      <ScrollToTop />
    </div>
  );
}