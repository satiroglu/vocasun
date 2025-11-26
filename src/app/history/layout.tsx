import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kelime Geçmişi',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}