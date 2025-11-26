import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className, ...props }, ref) => {
        return (
            <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                    {label}
                </label>
                <div className="relative">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`w-full p-3 ${icon ? 'pl-11' : ''} bg-slate-50 border rounded-xl outline-none transition font-medium text-slate-800
                        ${error
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10'
                                : 'border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10'
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
