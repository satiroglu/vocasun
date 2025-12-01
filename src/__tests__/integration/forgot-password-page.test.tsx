import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ForgotPassword from '@/app/forgot-password/page';

const resetPasswordMock = vi.fn();

vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            resetPasswordForEmail: (...args: any) => resetPasswordMock(...args)
        }
    }
}));

describe('Forgot Password Page', () => {
    it('sends reset link successfully', async () => {
        resetPasswordMock.mockResolvedValue({ error: null });

        render(<ForgotPassword />);

        const emailInput = screen.getByPlaceholderText('ornek@email.com');
        fireEvent.change(emailInput, { target: { value: 'test@vocasun.com' } });

        fireEvent.click(screen.getByRole('button', { name: /Bağlantı Gönder/i }));

        await waitFor(() => {
            expect(screen.getByText(/şifre sıfırlama bağlantısı gönderildi/i)).toBeInTheDocument();
        });
    });
});