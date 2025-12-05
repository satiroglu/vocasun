// src/hooks/useUser.ts
'use client';

import { useAuth } from '@/providers/AuthProvider';

export function useUser() {
    const context = useAuth();
    // Context'in undefined olma ihtimaline karşı güvenlik (opsiyonel ama iyi pratik)
    if (context === undefined) {
        throw new Error('useUser must be used within an AuthProvider');
    }
    return context;
}