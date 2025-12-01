'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types';
import { Plus, Search, Edit2, Trash2, X, Shield, ShieldAlert, Award, User, Calendar, BookOpen, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Users, Filter, Eye, EyeOff } from 'lucide-react';
import ConfirmModal from '@/components/admin/ConfirmModal';
import AlertModal from '@/components/admin/AlertModal';

// Define User type based on Profile but ensuring properties used exist
interface User extends Profile {
    email: string; // Profile might not have email in some types, but here we expect it
    email_confirmed_at?: string | null;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter & Sort State
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [sortColumn, setSortColumn] = useState('created_at');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 10;

    // Create State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserData, setNewUserData] = useState({
        email: '',
        username: '',
        password: '',
        first_name: '',
        last_name: ''
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [showCreatePassword, setShowCreatePassword] = useState(false);

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<User>>({});
    const [editLoading, setEditLoading] = useState(false);
    const [resetPassword, setResetPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    // Modal State
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
            fetchUsers(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, roleFilter, sortColumn, sortDirection]);

    const fetchUsers = async (pageNum: number = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            if (roleFilter !== 'all') params.append('role', roleFilter);
            params.append('sort', sortColumn);
            params.append('order', sortDirection);
            params.append('page', pageNum.toString());
            params.append('limit', limit.toString());

            const res = await fetch(`/api/admin/users?${params}`);
            if (!res.ok) throw new Error('Kullanıcılar getirilemedi.');
            const data = await res.json();
            setUsers(data.users);
            setTotalItems(data.pagination.total);
            setTotalPages(data.pagination.totalPages);
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
            fetchUsers(newPage);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserData),
            });
            if (!res.ok) throw new Error('Kullanıcı oluşturulamadı.');
            setIsCreateModalOpen(false);
            setIsCreateModalOpen(false);
            setNewUserData({ email: '', username: '', password: '', first_name: '', last_name: '' });
            fetchUsers(page);
            setAlertModal({
                isOpen: true,
                title: 'Başarılı',
                message: 'Kullanıcı başarıyla oluşturuldu.',
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
            setCreateLoading(false);
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setEditLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingUser.id, ...editFormData }),
            });
            if (!res.ok) throw new Error('Kullanıcı güncellenemedi.');
            setIsEditModalOpen(false);
            setEditingUser(null);
            fetchUsers(page);
            setAlertModal({
                isOpen: true,
                title: 'Başarılı',
                message: 'Kullanıcı başarıyla güncellendi.',
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

    const handleDelete = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Kullanıcıyı Sil',
            message: 'Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
            type: 'danger',
            onConfirm: async () => {
                setDeletingId(id);
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await fetch('/api/admin/users', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id }),
                    });
                    if (!res.ok) throw new Error('Kullanıcı silinemedi.');
                    fetchUsers(page);
                    setAlertModal({
                        isOpen: true,
                        title: 'Başarılı',
                        message: 'Kullanıcı başarıyla silindi.',
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

    const handleResetPassword = async () => {
        if (resetPassword.length < 6) {
            setAlertModal({
                isOpen: true,
                title: 'Uyarı',
                message: 'Şifre en az 6 karakter olmalıdır.',
                type: 'error'
            });
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Şifre Sıfırla',
            message: 'Bu kullanıcının şifresini değiştirmek istediğinize emin misiniz?',
            type: 'warning',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setResetLoading(true);
                try {
                    const res = await fetch('/api/admin/users/password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: editingUser!.id, password: resetPassword }),
                    });
                    if (!res.ok) throw new Error('Şifre sıfırlama başarısız.');
                    setAlertModal({
                        isOpen: true,
                        title: 'Başarılı',
                        message: 'Şifre başarıyla sıfırlandı.',
                        type: 'success'
                    });
                    setResetPassword('');
                } catch (err: any) {
                    setAlertModal({
                        isOpen: true,
                        title: 'Hata',
                        message: err.message,
                        type: 'error'
                    });
                } finally {
                    setResetLoading(false);
                }
            }
        });
    };

    const handleVerifyEmail = async () => {
        if (!editingUser) return;
        setConfirmModal({
            isOpen: true,
            title: 'Email Doğrula',
            message: 'Bu kullanıcının email adresini manuel olarak doğrulamak istediğinize emin misiniz?',
            type: 'warning',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    const res = await fetch('/api/admin/users', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: editingUser.id, email_confirm: true }),
                    });
                    if (!res.ok) throw new Error('Email doğrulama başarısız.');
                    setAlertModal({
                        isOpen: true,
                        title: 'Başarılı',
                        message: 'Email başarıyla doğrulandı.',
                        type: 'success'
                    });
                    fetchUsers(page);
                    setIsEditModalOpen(false);
                } catch (err: any) {
                    setAlertModal({
                        isOpen: true,
                        title: 'Hata',
                        message: err.message,
                        type: 'error'
                    });
                }
            }
        });
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditFormData({ ...user });
        setResetPassword('');
        setShowResetPassword(false);
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

        return (
            <div className="flex flex-col">
                <span className="text-sm text-gray-900 dark:text-white">{detailed}</span>
                <span className="text-xs text-gray-500">{relative}</span>
            </div>
        );
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20 md:pb-0 h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kullanıcı Yönetimi</h1>
                    <p className="text-sm text-slate-500 mt-1">Toplam {totalItems} kullanıcı</p>
                </div>
                <button
                    onClick={() => {
                        setShowCreatePassword(false);
                        setIsCreateModalOpen(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kullanıcı
                </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl border border-slate-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0 flex flex-col md:flex-row gap-4">
                    <form onSubmit={(e) => e.preventDefault()} className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="search"
                            name="search_users_query"
                            id="search_users_query"
                            autoComplete="off"
                            data-lpignore="true"
                            placeholder="Kullanıcı ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white"
                        />
                    </form>
                    <div className="relative">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white cursor-pointer"
                        >
                            <option value="all">Tüm Roller</option>
                            <option value="admin">Admin</option>
                            <option value="user">Kullanıcı</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => handleSort('username')}
                                >
                                    <div className="flex items-center gap-1">
                                        Kullanıcı
                                        {sortColumn === 'username' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => handleSort('total_xp')}
                                >
                                    <div className="flex items-center gap-1">
                                        İlerleme
                                        {sortColumn === 'total_xp' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                                    onClick={() => handleSort('created_at')}
                                >
                                    <div className="flex items-center gap-1">
                                        Kayıt
                                        {sortColumn === 'created_at' && (sortDirection === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                {user.avatar_url ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url} alt="" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                        {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">{user.username || 'İsimsiz'}</div>
                                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                                    {user.email}
                                                    {user.email_confirmed_at ? (
                                                        <span title="Doğrulanmış Email" className="text-green-500"><Shield className="w-3 h-3" /></span>
                                                    ) : (
                                                        <span title="Doğrulanmamış Email" className="text-red-500"><ShieldAlert className="w-3 h-3" /></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.is_admin ? (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                                Admin
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                                                Kullanıcı
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm text-gray-900 dark:text-white font-medium">{user.total_xp.toLocaleString()} XP</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Seviye {user.level}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={`/admin/users/${user.id}/progress`}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="İlerlemeyi Gör"
                                            >
                                                <BookOpen className="w-4 h-4" />
                                            </a>
                                            <button
                                                onClick={() => openEditModal(user)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                title="Düzenle"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                disabled={deletingId === user.id || user.is_admin}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                                title="Sil"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                        <div key={user.id} className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 flex-shrink-0">
                                        {user.avatar_url ? (
                                            <img className="h-10 w-10 rounded-full object-cover" src={user.avatar_url} alt="" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                {user.username?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900 dark:text-white">{user.username || 'İsimsiz'}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            {user.email}
                                            {user.email_confirmed_at ? (
                                                <span title="Doğrulanmış Email" className="text-green-500"><Shield className="w-3 h-3" /></span>
                                            ) : (
                                                <span title="Doğrulanmamış Email" className="text-red-500"><ShieldAlert className="w-3 h-3" /></span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {user.is_admin ? (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                                        ADMIN
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-100 text-green-800 border border-green-200">
                                        ÜYE
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <Award className="w-4 h-4 text-amber-500" />
                                    <span className="font-medium">{user.total_xp.toLocaleString()} XP</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                                    <User className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium">Seviye {user.level}</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <div className="flex items-center text-xs text-gray-400 mb-1">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(user.created_at)}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        disabled={deletingId === user.id || user.is_admin}
                                        className="w-10 flex items-center justify-center py-2 text-red-600 bg-red-50 rounded-lg active:scale-95 transition disabled:opacity-50 shrink-0"
                                        title="Kullanıcıyı Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openEditModal(user)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 text-indigo-600 bg-indigo-50 rounded-lg active:scale-95 transition"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        <span className="text-sm font-medium">Düzenle</span>
                                    </button>
                                    <a
                                        href={`/admin/users/${user.id}/progress`}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 text-blue-600 bg-blue-50 rounded-lg active:scale-95 transition"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        <span className="text-sm font-medium">İlerleme</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Pagination */}
                <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0 flex items-center justify-between">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Sayfa {page} / {totalPages} (Toplam {totalItems} kullanıcı)
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

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Yeni Kullanıcı Ekle</h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newUserData.email}
                                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    required
                                    value={newUserData.username}
                                    onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifre</label>
                                <div className="relative">
                                    <input
                                        type={showCreatePassword ? 'text' : 'password'}
                                        required
                                        minLength={6}
                                        value={newUserData.password}
                                        onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                    >
                                        {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad</label>
                                    <input
                                        type="text"
                                        value={newUserData.first_name}
                                        onChange={(e) => setNewUserData({ ...newUserData, first_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Soyad</label>
                                    <input
                                        type="text"
                                        value={newUserData.last_name}
                                        onChange={(e) => setNewUserData({ ...newUserData, last_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={createLoading}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                >
                                    {createLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full p-6 animate-scale-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kullanıcı Düzenle</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-8">
                            {/* Main Info */}
                            <form id="editForm" onSubmit={handleEditUser} className="space-y-6" autoComplete="off">
                                {/* Fake inputs to prevent browser autofill */}
                                <input type="text" style={{ display: 'none' }} autoComplete="username" />
                                <input type="password" style={{ display: 'none' }} autoComplete="new-password" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="email"
                                                value={editFormData.email || ''}
                                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                            />
                                            {!editingUser.email_confirmed_at && (
                                                <button
                                                    type="button"
                                                    onClick={handleVerifyEmail}
                                                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-xs font-bold whitespace-nowrap"
                                                >
                                                    Doğrula
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kullanıcı Adı</label>
                                        <input
                                            type="text"
                                            value={editFormData.username || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                                        <div className="flex items-center gap-4 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={!editFormData.is_admin}
                                                    onChange={() => setEditFormData({ ...editFormData, is_admin: false })}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">Kullanıcı</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    checked={editFormData.is_admin}
                                                    onChange={() => setEditFormData({ ...editFormData, is_admin: true })}
                                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <span className="text-sm font-bold text-purple-600">Admin</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad</label>
                                        <input
                                            type="text"
                                            value={editFormData.first_name || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Soyad</label>
                                        <input
                                            type="text"
                                            value={editFormData.last_name || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seviye</label>
                                        <input
                                            type="number"
                                            value={editFormData.level || 1}
                                            onChange={(e) => setEditFormData({ ...editFormData, level: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Toplam XP</label>
                                        <input
                                            type="number"
                                            value={editFormData.total_xp || 0}
                                            onChange={(e) => setEditFormData({ ...editFormData, total_xp: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Haftalık XP</label>
                                        <input
                                            type="number"
                                            value={editFormData.weekly_xp || 0}
                                            onChange={(e) => setEditFormData({ ...editFormData, weekly_xp: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Günlük Hedef</label>
                                        <input
                                            type="number"
                                            value={editFormData.daily_goal || 0}
                                            onChange={(e) => setEditFormData({ ...editFormData, daily_goal: parseInt(e.target.value) })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tercih Edilen Liste</label>
                                        <select
                                            value={editFormData.preferred_word_list || 'general'}
                                            onChange={(e) => setEditFormData({ ...editFormData, preferred_word_list: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="general">Genel</option>
                                            <option value="academic">Akademik</option>
                                            <option value="business">İş</option>
                                            <option value="toefl">TOEFL</option>
                                            <option value="ielts">IELTS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zorluk Seviyesi</label>
                                        <select
                                            value={editFormData.difficulty_level || 'mixed'}
                                            onChange={(e) => setEditFormData({ ...editFormData, difficulty_level: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        >
                                            <option value="beginner">Başlangıç</option>
                                            <option value="intermediate">Orta</option>
                                            <option value="advanced">İleri</option>
                                            <option value="mixed">Karışık</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Biyografi</label>
                                        <textarea
                                            value={editFormData.bio || ''}
                                            onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </form>

                            {/* Security & Danger Zone - Moved to Bottom */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-indigo-500" />
                                        Güvenlik
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Şifre Sıfırla</label>
                                            <div className="flex flex-col gap-3">
                                                <div className="relative">
                                                    <input
                                                        type={showResetPassword ? 'text' : 'password'}
                                                        placeholder="Yeni şifre (min. 6 karakter)"
                                                        value={resetPassword}
                                                        onChange={(e) => setResetPassword(e.target.value)}
                                                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowResetPassword(!showResetPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleResetPassword}
                                                    disabled={resetLoading || resetPassword.length < 6}
                                                    className="w-full px-3 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                                >
                                                    {resetLoading ? '...' : 'Sıfırla'}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">En az 6 karakter olmalıdır.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800/50">
                                    <h3 className="text-sm font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4" />
                                        Tehlikeli Bölge
                                    </h3>
                                    <p className="text-xs text-red-600 dark:text-red-300 mb-4">
                                        Bu işlem geri alınamaz. Kullanıcı ve tüm verileri silinecektir.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setConfirmModal({
                                                isOpen: true,
                                                title: 'Kullanıcıyı Sil',
                                                message: 'Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
                                                type: 'danger',
                                                onConfirm: async () => {
                                                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                                                    handleDelete(editingUser.id);
                                                    setIsEditModalOpen(false);
                                                }
                                            });
                                        }}
                                        disabled={editingUser.is_admin}
                                        className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                                    >
                                        Kullanıcıyı Sil
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-b-xl mt-6 -mx-6 -mb-6">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                form="editForm"
                                disabled={editLoading}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50"
                            >
                                {editLoading ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
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
