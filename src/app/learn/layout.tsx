import { Metadata } from 'next';
import AuthGuard from '@/components/AuthGuard';

export const metadata: Metadata = {
    title: 'Öğren',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}