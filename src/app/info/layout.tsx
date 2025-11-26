import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Nasıl Çalışır?',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}