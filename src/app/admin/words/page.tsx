'use client';

import { useState, useEffect } from 'react';
import { Vocabulary } from '@/types';
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, Image as ImageIcon, Volume2, Book, Type, List, MoreHorizontal } from 'lucide-react';
import Card from '@/components/Card';
import { clsx } from 'clsx';

export default function AdminWordsPage() {
    const [words, setWords] = useState<Vocabulary[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 50;

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWord, setEditingWord] = useState<Vocabulary | null>(null);
    const [activeTab, setActiveTab] = useState<'basic' | 'examples' | 'media' | 'extra'>('basic');

    // Form Data
    const initialFormData: Partial<Vocabulary> = {
        word: '',
        meaning: '',
        type: 'noun',
        level: 'A1',
        example_en: '',
        example_tr: '',
        audio_url: '',
        image_url: '',
        definition: '',
        phonetic_ipa: '',
        synonyms: [],
        antonyms: []
    };
    const [formData, setFormData] = useState<Partial<Vocabulary>>(initialFormData);
    const [synonymsInput, setSynonymsInput] = useState('');
    const [antonymsInput, setAntonymsInput] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1); // Reset to page 1 on search
            fetchWords(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchWords = async (pageNum: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('q', searchQuery);
            params.append('page', pageNum.toString());
            params.append('limit', limit.toString());

            const res = await fetch(`/api/admin/words?${params}`);
            if (!res.ok) throw new Error('Failed to fetch words');
            const data = await res.json();

            setWords(data.words || []);
            setTotalPages(data.pagination.totalPages);
            setTotalItems(data.pagination.total);
            setPage(pageNum);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchWords(newPage);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = '/api/admin/words';
            const method = editingWord ? 'PUT' : 'POST';

            // Process arrays
            const finalData = {
                ...formData,
                synonyms: synonymsInput.split(',').map(s => s.trim()).filter(Boolean),
                antonyms: antonymsInput.split(',').map(s => s.trim()).filter(Boolean)
            };

            const body = editingWord ? { ...finalData, id: editingWord.id } : finalData;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Operation failed');

            setIsModalOpen(false);
            setEditingWord(null);
            setFormData(initialFormData);
            fetchWords(page); // Refresh current page
        } catch (error) {
            alert('Bir hata oluştu.');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) return;
        try {
            const res = await fetch('/api/admin/words', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (!res.ok) throw new Error('Delete failed');
            fetchWords(page);
        } catch (error) {
            alert('Silme işlemi başarısız.');
        }
    };

    const openEditModal = (word: Vocabulary) => {
        setEditingWord(word);
        setFormData(word);
        setSynonymsInput(word.synonyms?.join(', ') || '');
        setAntonymsInput(word.antonyms?.join(', ') || '');
        setActiveTab('basic');
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingWord(null);
        setFormData(initialFormData);
        setSynonymsInput('');
        setAntonymsInput('');
        setActiveTab('basic');
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col pb-20 md:pb-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white hidden md:block">Kelime Yönetimi</h1>
                    <p className="text-sm text-gray-500 mt-1 hidden md:block">Toplam {totalItems} kelime</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kelime
                </button>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Kelime ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition dark:text-white"
                        />
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block flex-1 overflow-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelime</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Anlam</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür / Seviye</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detaylar</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Yükleniyor...
                                    </td>
                                </tr>
                            ) : words.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Kelime bulunamadı.
                                    </td>
                                </tr>
                            ) : (
                                words.map((word) => (
                                    <tr key={word.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition group">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                                            #{word.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{word.word}</div>
                                            {word.phonetic_ipa && <div className="text-xs text-gray-500 font-mono">/{word.phonetic_ipa}/</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                            {word.meaning}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700 w-fit">
                                                    {word.type}
                                                </span>
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-50 text-purple-700 w-fit">
                                                    {word.level}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex gap-2">
                                                {word.audio_url && <Volume2 className="w-4 h-4 text-green-500" />}
                                                {word.image_url && <ImageIcon className="w-4 h-4 text-blue-500" />}
                                                {(word.synonyms?.length ?? 0) > 0 && <List className="w-4 h-4 text-amber-500" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(word)}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(word.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden flex-1 overflow-y-auto divide-y divide-gray-200 dark:divide-gray-700">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Yükleniyor...</div>
                    ) : words.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">Kelime bulunamadı.</div>
                    ) : (
                        words.map((word) => (
                            <div key={word.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{word.word}</h3>
                                            {word.phonetic_ipa && <span className="text-xs text-gray-500 font-mono">/{word.phonetic_ipa}/</span>}
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{word.meaning}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                                            {word.type}
                                        </span>
                                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                                            {word.level}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-gray-400">
                                    {word.audio_url && <Volume2 className="w-4 h-4 text-green-500" />}
                                    {word.image_url && <ImageIcon className="w-4 h-4 text-blue-500" />}
                                    {(word.synonyms?.length ?? 0) > 0 && <List className="w-4 h-4 text-amber-500" />}
                                    {word.example_en && <Book className="w-4 h-4 text-gray-400" />}
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        onClick={() => openEditModal(word)}
                                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium active:scale-95 transition"
                                    >
                                        Düzenle
                                    </button>
                                    <button
                                        onClick={() => handleDelete(word.id)}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg active:scale-95 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0 flex items-center justify-between">
                    <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        Sayfa {page} / {totalPages}
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
            </Card>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full h-[90vh] flex flex-col animate-scale-up">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100 dark:border-gray-700 shrink-0">
                            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                                {editingWord ? 'Kelime Düzenle' : 'Yeni Kelime Ekle'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Tabs */}
                        <div className="flex border-b border-gray-100 dark:border-gray-700 px-4 md:px-6 shrink-0 overflow-x-auto no-scrollbar">
                            {[
                                { id: 'basic', label: 'Temel', icon: Type },
                                { id: 'examples', label: 'Örnekler', icon: Book },
                                { id: 'media', label: 'Medya', icon: ImageIcon },
                                { id: 'extra', label: 'Ekstra', icon: List },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={clsx(
                                        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                                        activeTab === tab.id
                                            ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            <form id="wordForm" onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info Tab */}
                                {activeTab === 'basic' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelime (İngilizce)</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.word}
                                                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anlam (Türkçe)</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.meaning}
                                                onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kelime Türü</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="noun">İsim (noun)</option>
                                                <option value="verb">Fiil (verb)</option>
                                                <option value="adjective">Sıfat (adjective)</option>
                                                <option value="adverb">Zarf (adverb)</option>
                                                <option value="preposition">Edat (preposition)</option>
                                                <option value="conjunction">Bağlaç (conjunction)</option>
                                                <option value="phrasal verb">Deyimsel Fiil (phrasal verb)</option>
                                                <option value="idiom">Deyim (idiom)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seviye</label>
                                            <select
                                                value={formData.level}
                                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="A1">A1 (Başlangıç)</option>
                                                <option value="A2">A2 (Temel)</option>
                                                <option value="B1">B1 (Orta)</option>
                                                <option value="B2">B2 (Üst Orta)</option>
                                                <option value="C1">C1 (İleri)</option>
                                                <option value="C2">C2 (Uzman)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IPA Okunuşu</label>
                                            <input
                                                type="text"
                                                value={formData.phonetic_ipa || ''}
                                                onChange={(e) => setFormData({ ...formData, phonetic_ipa: e.target.value })}
                                                placeholder="/həˈləʊ/"
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Examples Tab */}
                                {activeTab === 'examples' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">İngilizce Tanım (Definition)</label>
                                            <textarea
                                                value={formData.definition || ''}
                                                onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                                placeholder="A greeting (salutation) said when meeting someone..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Örnek Cümle (İngilizce)</label>
                                            <textarea
                                                required
                                                value={formData.example_en}
                                                onChange={(e) => setFormData({ ...formData, example_en: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Örnek Cümle (Türkçe)</label>
                                            <textarea
                                                required
                                                value={formData.example_tr}
                                                onChange={(e) => setFormData({ ...formData, example_tr: e.target.value })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Media Tab */}
                                {activeTab === 'media' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Görsel URL</label>
                                            <div className="flex gap-4">
                                                <input
                                                    type="url"
                                                    value={formData.image_url || ''}
                                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                                    placeholder="https://example.com/image.jpg"
                                                />
                                            </div>
                                            {formData.image_url && (
                                                <div className="mt-4 w-32 h-32 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-50 dark:bg-gray-700">
                                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ses URL</label>
                                            <input
                                                type="url"
                                                value={formData.audio_url || ''}
                                                onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                                placeholder="https://example.com/audio.mp3"
                                            />
                                            {formData.audio_url && (
                                                <audio controls className="mt-4 w-full" src={formData.audio_url}>
                                                    Tarayıcınız ses elementini desteklemiyor.
                                                </audio>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Extra Tab */}
                                {activeTab === 'extra' && (
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Eş Anlamlılar (Virgülle ayırın)</label>
                                            <input
                                                type="text"
                                                value={synonymsInput}
                                                onChange={(e) => setSynonymsInput(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                                placeholder="hi, greetings, welcome"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zıt Anlamlılar (Virgülle ayırın)</label>
                                            <input
                                                type="text"
                                                value={antonymsInput}
                                                onChange={(e) => setAntonymsInput(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-gray-700 dark:text-white"
                                                placeholder="goodbye, farewell"
                                            />
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 md:p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 shrink-0 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                form="wordForm"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                            >
                                {editingWord ? 'Güncelle' : 'Ekle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
