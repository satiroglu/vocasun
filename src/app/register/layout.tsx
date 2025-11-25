import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kayıt Ol',
};

export default function Layout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}