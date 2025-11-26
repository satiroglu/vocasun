import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'soft'; // 'soft' eklendi
    isLoading?: boolean;
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    icon,
    className = '',
    disabled,
    ...props
}) => {

    const baseStyles = "px-6 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]";

    let variantStyles = "";

    switch (variant) {
        case 'primary':
            variantStyles = "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200";
            break;
        case 'secondary':
            variantStyles = "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200";
            break;
        case 'danger':
            variantStyles = "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100";
            break;
        case 'outline':
            variantStyles = "bg-white border-2 border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600";
            break;
        case 'soft': // Yeni açık renk tonlu stil
            variantStyles = "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100";
            break;
    }

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>İşleniyor...</span>
                </>
            ) : (
                <>
                    {icon && <span>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;