import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Yeni Şifre Belirle',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}