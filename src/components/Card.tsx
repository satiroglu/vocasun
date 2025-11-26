import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    icon?: React.ReactNode;
    headerAction?: React.ReactNode;
}

const Card = ({ children, className = '', title, icon, headerAction }: CardProps) => {
    return (
        <div className={`bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 ${className}`}>
            {(title || icon) && (
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                {icon}
                            </div>
                        )}
                        {title && <h2 className="text-xl font-bold text-slate-800">{title}</h2>}
                    </div>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
