import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'success' | 'error' | 'info';
}

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen,
    onClose,
    title,
    message,
    type = 'info'
}) => {
    if (!isOpen) return null;

    const colors = {
        success: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            text: 'text-green-600 dark:text-green-400',
            button: 'bg-green-600 hover:bg-green-700 text-white',
            icon: <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
        },
        error: {
            bg: 'bg-red-50 dark:bg-red-900/20',
            text: 'text-red-600 dark:text-red-400',
            button: 'bg-red-600 hover:bg-red-700 text-white',
            icon: <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
        },
        info: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            text: 'text-blue-600 dark:text-blue-400',
            button: 'bg-blue-600 hover:bg-blue-700 text-white',
            icon: <Info className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        }
    };

    const currentColors = colors[type];

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-up border border-gray-100 dark:border-gray-700 text-center">
                <div className={`w-12 h-12 rounded-full ${currentColors.bg} flex items-center justify-center mx-auto mb-4`}>
                    {currentColors.icon}
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition ${currentColors.button}`}
                >
                    Tamam
                </button>
            </div>
        </div>
    );
};

export default AlertModal;
