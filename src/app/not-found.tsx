import { Metadata } from 'next';
import NotFoundClient from '@/components/NotFoundClient';

export const metadata: Metadata = {
    title: 'Sayfa Bulunamadı | Vocasun',
    description: 'Aradığınız sayfa bulunamadı. Vocasun ile İngilizce öğrenmeye devam edin.',
};

export default function NotFound() {
    return <NotFoundClient />;
}
