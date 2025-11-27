import Link from 'next/link';
import { Sun } from 'lucide-react';

interface LogoProps {
    className?: string;
    iconSize?: number; // Optional custom size, though we have responsive defaults
    href?: string; // Optional custom link destination
}

export default function Logo({ className = "", iconSize, href = "/" }: LogoProps) {
    return (
        <Link href={href} className={`flex items-center gap-2.5 text-indigo-600 font-bold text-2xl sm:text-3xl hover:opacity-80 transition group ${className}`}>
            <Sun
                className={`w-8 h-8 sm:w-10 sm:h-10 group-hover:rotate-180 transition-transform duration-700`}
                size={iconSize}
            />
            <span>Vocasun</span>
        </Link>
    );
}
