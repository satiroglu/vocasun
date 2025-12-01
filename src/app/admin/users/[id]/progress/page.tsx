'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Search, CheckCircle, Clock, Edit2, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Filter, User, Mail, Award } from 'lucide-react';
import { UserProgress } from '@/types';
import ConfirmModal from '@/components/admin/ConfirmModal';
import AlertModal from '@/components/admin/AlertModal';

export default function UserProgressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [progress, setProgress] = useState<UserProgress[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortColumn, setSortColumn] = useState('updated_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProgress, setEditingProgress] = useState<UserProgress | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<UserProgress>>({});
    const [editLoading, setEditLoading] = useState(false);

    // Custom Modals State
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type?: 'danger' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info'
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchProgress(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, sortColumn, sortDirection]);

    const fetchProgress = async (pageNum: number = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            params.append('sort', sortColumn);
            params.append('order', sortDirection);
            params.append('page', pageNum.toString());
            params.append('limit', limit.toString());

            const res = await fetch(`/api/admin/users/${id}/progress?${params}`);
            if (!res.ok) throw new Error('İlerleme verileri getirilemedi.');
            const data = await res.json();
            setProgress(data.progress);
            setUser(data.user);
            setTotalPages(data.pagination.totalPages);
            setTotalItems(data.pagination.total);
            setPage(pageNum);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (column: string) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('desc'); // Default to desc for new column
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchProgress(newPage);
        }
    };

    const handleDelete = async (progressId: number) => {
        setConfirmModal({
            isOpen: true,
            title: 'İlerlemeyi Sıfırla',
            message: 'Bu kelime ilerlemesini sıfırlamak istediğinize emin misiniz? Bu işlem geri alınamaz.',
            type: 'danger',
            onConfirm: async () => {
                setDeletingId(progressId);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await fetch(`/api/admin/users/${id}/progress`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ progressId }),
                    });
                    if (!res.ok) throw new Error('Sıfırlama işlemi başarısız.');
                    setProgress(progress.filter(p => p.id !== progressId));
                    setAlertModal({
                        isOpen: true,
                        title: 'Başarılı',
                        message: 'İlerleme başarıyla sıfırlandı.',
                        type: 'success'
                    });
                } catch (err: any) {
                    setAlertModal({
                        isOpen: true,
                        title: 'Hata',
                        message: err.message,
                        type: 'error'
                    });
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    const handleEditProgress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProgress) return;
        setEditLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${id}/progress`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    progressId: editingProgress.id,
                    is_mastered: editFormData.is_mastered,
                    repetitions: editFormData.repetitions,
                    next_review: editFormData.next_review
                }),
            });

            if (!res.ok) throw new Error('Güncelleme başarısız.');

            setIsEditModalOpen(false);
            setEditingProgress(null);
            fetchProgress(page);
            setAlertModal({
                isOpen: true,
                title: 'Başarılı',
                message: 'İlerleme başarıyla güncellendi.',
                type: 'success'
            });
        } catch (err: any) {
            setAlertModal({
                isOpen: true,
                title: 'Hata',
                message: err.message,
                type: 'error'
            });
        } finally {
            setEditLoading(false);
        }
    };

    const openEditModal = (p: UserProgress) => {
        setEditingProgress(p);
        setEditFormData({
            is_mastered: p.is_mastered,
            repetitions: p.repetitions,
            next_review: p.next_review ? new Date(p.next_review).toISOString().split('T')[0] : ''
        });
        setIsEditModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const detailed = date.toLocaleString('tr-TR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        let relative = '';
        if (diffDays > 0) relative = `${diffDays} gün önce`;
        else if (diffHours > 0) relative = `${diffHours} saat önce`;
        else relative = `${diffMinutes} dakika önce`;

        // If date is in the future (e.g. next review)
        if (diff < 0) {
            const futureDiff = Math.abs(diff);
            const futureDays = Math.floor(futureDiff / (1000 * 60 * 60 * 24));
            const futureHours = Math.floor((futureDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            if (futureDays > 0) relative = `${futureDays} gün sonra`;
            else if (futureHours > 0) relative = `${futureHours} saat sonra`;
            else relative = 'Yakında';
        }

        return (
            <div className="flex flex-col">
                <span className="text-sm text-gray-900 dark:text-white">{detailed}</span>
                <span className="text-xs text-gray-500">{relative}</span>
            </div>
        );
    };

    const maskEmail = (email: string) => {
        if (!email) return '';
        const [name, domain] = email.split('@');
        if (!name || !domain) return email;
        const maskedName = name.substring(0, 2) + '*'.repeat(Math.max(0, name.length - 2));
        return `${maskedName}@${domain}`;
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kullanıcı İlerlemesi</h1>
                </div>

                {user && (
                    <div className="flex items-center gap-4 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-xl border border-amber-100 dark:border-amber-800/30 shadow-sm">
                        <div className="flex items-center gap-2 text-sm text-amber-900 dark:text-amber-100">
                            <User className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            <span className="font-bold">{user.username || 'İsimsiz'}</span>
                        </div>
                        <div className="w-px h-4 bg-amber-200 dark:bg-amber-700"></div>
                        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                            <Award className="w-4 h-4 text-amber-500" />
                            <span className="font-medium">Seviye {user.level}</span>
                        </div>
                        <div className="w-px h-4 bg-amber-200 dark:bg-amber-700"></div>
                        <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                            <span className="font-bold">{user.total_xp?.toLocaleString() || 0} XP</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden dark:bg-gray-800 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Kelime ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white cursor-pointer"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="mastered">Öğrenildi</option>
                            <option value="learning">Öğreniliyor</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelime</th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => handleSort('is_mastered')}
                                >
                                    <div className="flex items-center gap-1">
                                        Durum
                                        {sortColumn === 'is_mastered' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => handleSort('repetitions')}
                                >
                                    <div className="flex items-center gap-1">
                                        Tekrar
                                        {sortColumn === 'repetitions' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => handleSort('next_review')}
                                >
                                    <div className="flex items-center gap-1">
                                        Sonraki İnceleme
                                        {sortColumn === 'next_review' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {progress.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{p.vocabulary?.word}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{p.vocabulary?.meaning}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {p.is_mastered ? (
                                            <span className="px-2.5 py-0.5 inline-flex items-center gap-1 text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                                                <CheckCircle className="w-3 h-3" />
                                                Öğrenildi
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 inline-flex items-center gap-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                                <Clock className="w-3 h-3" />
                                                Öğreniliyor
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {p.repetitions} kez
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(p.next_review)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(p)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                title="Düzenle"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                disabled={deletingId === p.id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                title="Sıfırla"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {progress.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Kayıt bulunamadı.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0 flex items-center justify-between">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Sayfa {page} / {totalPages} (Toplam {totalItems} kayıt)
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed dark:text-white"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && editingProgress && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-up">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">İlerlemeyi Düzenle</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{editingProgress.vocabulary?.word}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{editingProgress.vocabulary?.meaning}</p>
                        </div>
                        <form onSubmit={handleEditProgress} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durum</label>
                                <div className="flex items-center gap-4 mt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={!editFormData.is_mastered}
                                            onChange={() => setEditFormData({ ...editFormData, is_mastered: false })}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300">Öğreniliyor</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={editFormData.is_mastered}
                                            onChange={() => setEditFormData({ ...editFormData, is_mastered: true })}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm font-bold text-green-600">Öğrenildi</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tekrar Sayısı</label>
                                <input
                                    type="number"
                                    value={editFormData.repetitions}
                                    onChange={(e) => setEditFormData({ ...editFormData, repetitions: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sonraki İnceleme Tarihi</label>
                                <input
                                    type="date"
                                    value={editFormData.next_review ? String(editFormData.next_review) : ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, next_review: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={editLoading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {editLoading ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modals */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />

            <AlertModal
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                type={alertModal.type}
            />
        </div>
    );
}
