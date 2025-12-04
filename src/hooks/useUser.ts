'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ExtendedUser, Profile } from '@/types';

// Auth kullanıcısını yöneten hook
export function useUser() {
    const [user, setUser] = useState<ExtendedUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const getUserData = async () => {
            try {
                // 1. Auth Oturumunu Al
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    throw sessionError;
                }

                const authUser = session?.user;

                if (!authUser) {
                    if (mounted) {
                        setUser(null);
                        setLoading(false);
                    }
                    return;
                }

                // 2. Profil Verisini Çek
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, username, first_name, last_name, email, total_xp, weekly_xp, level, daily_goal, bio, avatar_url, display_name_preference, leaderboard_visibility, preferred_word_list, difficulty_level, accent_preference, created_at, marked_for_deletion_at, is_admin')
                    .eq('id', authUser.id)
                    .single();

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                }

                // 3. Verileri Birleştir
                if (mounted) {
                    if (profile) {
                        setUser({
                            ...authUser,
                            ...(profile as Profile)
                        });
                    } else {
                        setUser(authUser as ExtendedUser);
                    }
                }

            } catch (error) {
                console.error('Kullanıcı verisi hatası:', error);
                if (mounted) setUser(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        getUserData();

        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('id, username, first_name, last_name, email, total_xp, weekly_xp, level, daily_goal, bio, avatar_url, display_name_preference, leaderboard_visibility, preferred_word_list, difficulty_level, accent_preference, created_at, marked_for_deletion_at, is_admin')
                    .eq('id', session.user.id)
                    .single();

                if (mounted) {
                    setUser({
                        ...session.user,
                        ...(profile || {})
                    } as ExtendedUser);
                    setLoading(false);
                }
            } else {
                if (mounted) {
                    setUser(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}