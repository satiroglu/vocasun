import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navbar from '@/components/Navbar';
import QueryProvider from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';

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
    <html lang="tr" data-scroll-behavior="smooth">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}