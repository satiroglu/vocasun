import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import QueryProvider from '@/providers/QueryProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Font yükleme optimizasyonu
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Font yükleme optimizasyonu
});

export const metadata: Metadata = {
  title: {
    template: '%s | Vocasun', // %s yerine sayfa adı gelecek
    default: 'Vocasun - İngilizce Kelime Öğren', // Anasayfa başlığı
  },
  description: 'Yapay zeka destekli, oyunlaştırılmış İngilizce kelime öğrenme platformu.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <Navbar />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
