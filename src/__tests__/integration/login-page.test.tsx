import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '@/app/login/page';

// Mocks
const pushMock = vi.fn();
const refreshMock = vi.fn();
const signInWithPasswordMock = vi.fn();
const selectMock = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
        refresh: refreshMock
    })
}));

vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            signInWithPassword: (...args: any) => signInWithPasswordMock(...args),
            signOut: vi.fn()
        },
        from: () => ({
            select: (...args: any) => ({
                eq: () => ({
                    single: selectMock
                })
            }),
            update: () => ({ eq: () => Promise.resolve({ error: null }) })
        })
    }
}));

describe('Login Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form correctly', () => {
        render(<Login />);
        // DÜZELTME: Label yerine Placeholder kullanıyoruz
        expect(screen.getByPlaceholderText('adsoyad@email.com')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Giriş Yap/i })).toBeInTheDocument();
    });

    it('shows error message on failed login', async () => {
        signInWithPasswordMock.mockResolvedValue({
            data: { user: null },
            error: { message: 'E-posta veya şifre hatalı.' } // Mesajı UI ile eşleştirdik
        });

        render(<Login />);

        // DÜZELTME: Placeholder ile seçim
        fireEvent.change(screen.getByPlaceholderText('adsoyad@email.com'), { target: { value: 'test@vocasun.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

        await waitFor(() => {
            expect(screen.getByText(/E-posta veya şifre hatalı/i)).toBeInTheDocument();
        });
    });

    it('redirects to dashboard on successful login', async () => {
        signInWithPasswordMock.mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null
        });

        // Silinme kontrolü mock'u (marked_for_deletion_at: null)
        selectMock.mockResolvedValue({ data: { marked_for_deletion_at: null } });

        render(<Login />);

        // DÜZELTME: Placeholder ile seçim
        fireEvent.change(screen.getByPlaceholderText('adsoyad@email.com'), { target: { value: 'test@vocasun.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'correctpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Giriş Yap/i }));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/dashboard');
        });
    });
});