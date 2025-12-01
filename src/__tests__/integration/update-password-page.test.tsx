import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UpdatePassword from '@/app/update-password/page';

const updateUserMock = vi.fn();
const pushMock = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: pushMock })
}));

vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            updateUser: (...args: any) => updateUserMock(...args)
        }
    }
}));

describe('Update Password Page', () => {
    it('updates password successfully', async () => {
        updateUserMock.mockResolvedValue({ error: null });

        render(<UpdatePassword />);

        const passwordInput = screen.getByPlaceholderText('••••••••');
        fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });

        fireEvent.click(screen.getByRole('button', { name: /Şifreyi Güncelle/i }));

        await waitFor(() => {
            expect(screen.getByText(/Şifreniz başarıyla güncellendi/i)).toBeInTheDocument();
        });

        // Yönlendirme kontrolü (setTimeout olduğu için waitFor içinde)
        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith('/dashboard');
        }, { timeout: 3000 });
    });

    it('shows error for short password', async () => {
        render(<UpdatePassword />);

        const passwordInput = screen.getByPlaceholderText('••••••••');
        fireEvent.change(passwordInput, { target: { value: '123' } }); // Kısa şifre

        fireEvent.click(screen.getByRole('button', { name: /Şifreyi Güncelle/i }));

        expect(screen.getByText(/Şifre en az 6 karakter olmalı/i)).toBeInTheDocument();
    });
});