import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard', // Burayı her dosya için değiştir: 'Ayarlar', 'Kelime Çalış' vb.
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}