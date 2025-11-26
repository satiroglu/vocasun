import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    bg?: string;
}

const StatCard = ({ icon, label, value, bg = 'bg-indigo-50' }: StatCardProps) => {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-3 rounded-xl ${bg} w-12 h-12 flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <div className="text-slate-500 text-xs font-semibold uppercase tracking-wide">{label}</div>
                <div className="text-xl font-bold text-slate-900">{value}</div>
            </div>
        </div>
    );
};

export default StatCard;
