'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ExtendedUser, Profile } from '@/types'; // Güncellediğimiz tipi kullanıyoruz

// Auth kullanıcısını yöneten hook
export function useUser() {
    // Tip artık ExtendedUser (Hem Auth hem Profil verisi içerir)
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserData = async () => {
            try {
                // 1. Auth Oturumunu Al
                const { data: { session } } = await supabase.auth.getSession();
                const authUser = session?.user;

                if (!authUser) {
                    setUser(null);
                    setLoading(false);
                    return;
                }

                // 2. Profil Verisini Çek (accent_preference vb. burada)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, username, first_name, last_name, email, total_xp, weekly_xp, level, daily_goal, bio, avatar_url, display_name_preference, leaderboard_visibility, preferred_word_list, difficulty_level, accent_preference, created_at, marked_for_deletion_at, is_admin')
                    .eq('id', authUser.id)
                    .single();

                // 3. Verileri Birleştir (Auth + Profile)
                if (profile) {
                    setUser({
                        ...authUser,
                        ...(profile as Profile)
                    });
                } else {
                    setUser(authUser as ExtendedUser);
                }

            } catch (error) {
                console.error('Kullanıcı verisi hatası:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        getUserData();

        // Auth değişikliklerini dinle
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                // Giriş yapıldıysa profili de tekrar çekip birleştirelim
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, username, first_name, last_name, email, total_xp, weekly_xp, level, daily_goal, bio, avatar_url, display_name_preference, leaderboard_visibility, preferred_word_list, difficulty_level, accent_preference, created_at, marked_for_deletion_at, is_admin')
                    .eq('id', session.user.id)
                    .single();

                setUser({
                    ...session.user,
                    ...(profile || {})
                } as ExtendedUser);
            } else {
                setUser(null);
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}