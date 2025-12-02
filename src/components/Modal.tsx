import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
    type?: 'success' | 'warning' | 'danger' | 'normal';
    align?: 'center' | 'left';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, icon, type = 'normal', align = 'center' }) => {
    if (!isOpen) return null;

    let iconBgColor = 'bg-slate-100';
    let iconTextColor = 'text-slate-600';

    if (type === 'success') {
        iconBgColor = 'bg-green-100';
        iconTextColor = 'text-green-600';
    } else if (type === 'warning') {
        iconBgColor = 'bg-amber-100';
        iconTextColor = 'text-amber-600';
    } else if (type === 'danger') {
        iconBgColor = 'bg-red-100';
        iconTextColor = 'text-red-600';
    }

    const alignmentClass = align === 'left' ? 'text-left' : 'text-center';

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative animate-scale-up"
                onClick={(e) => e.stopPropagation()}
            >
                {onClose && (
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition">
                        <X size={20} />
                    </button>
                )}
                <div className={alignmentClass}>
                    {icon && (
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${iconBgColor} ${iconTextColor}`}>
                            {icon}
                        </div>
                    )}
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
                    <div className="text-slate-500 mb-6">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
