'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

// Auth kullanıcısını yöneten hook
export function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // İlk yükleme - session'ı al
        const initUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setLoading(false);
        };

        initUser();

        // Auth değişikliklerini dinle
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    return { user, loading };
}

