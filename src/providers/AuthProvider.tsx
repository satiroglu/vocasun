'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ExtendedUser, Profile } from '@/types';
import { useRouter } from 'next/navigation';

// 1. ARAYÜZ GÜNCELLEMESİ: signOut BURAYA EKLENDİ
interface AuthContextType {
    user: ExtendedUser | null;
    loading: boolean;
    refreshUser: () => Promise<void>;
    signOut: () => Promise<void>; // <-- EKLENEN SATIR
}

// 2. CONTEXT BAŞLANGIÇ DEĞERİ: signOut BURAYA EKLENDİ
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    refreshUser: async () => { },
    signOut: async () => { }, // <-- EKLENEN SATIR
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setUser(null);
                setLoading(false);
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                setUser({ ...session.user, ...(profile as Profile) });
            } else {
                setUser(session.user as ExtendedUser);
            }
        } catch (error) {
            console.error('Kullanıcı verisi alınamadı:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // 3. SIGNOUT FONKSİYONU
    const signOut = async () => {
        try {
            setUser(null); // State'i anında temizle
            setLoading(false);
            await supabase.auth.signOut(); // Supabase oturumunu kapat
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Çıkış hatası:', error);
        }
    };

    useEffect(() => {
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                fetchUser();
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setLoading(false);
                router.refresh();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // 4. PROVIDER VALUE GÜNCELLEMESİ: signOut BURAYA EKLENDİ
    return (
        <AuthContext.Provider value={{ user, loading, refreshUser: fetchUser, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);