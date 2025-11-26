import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
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

    const baseStyles = "px-6 py-3 rounded-full font-bold transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]";

    let variantStyles = "";

    switch (variant) {
        case 'primary':
            variantStyles = "bg-indigo-600 text-white hover:bg-indigo-700 ";
            break;
        case 'secondary':
            variantStyles = "bg-slate-900 text-white hover:bg-slate-800 ";
            break;
        case 'danger':
            variantStyles = "bg-red-600 text-white hover:bg-red-700 ";
            break;
        case 'outline':
            variantStyles = "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 ";
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
                    <span>Yükleniyor...</span>
                </>
            ) : (
                <>
                    {children}
                    {icon && <span>{icon}</span>}
                </>
            )}
        </button>
    );
};

export default Button;
