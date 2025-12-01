import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Register from '@/app/register/page';

const signUpMock = vi.fn();
const selectMock = vi.fn();

vi.mock('@/lib/supabaseClient', () => ({
    supabase: {
        auth: {
            signUp: (...args: any) => signUpMock(...args)
        },
        from: () => ({
            select: () => ({
                ilike: () => ({ single: selectMock }),
                eq: () => ({ single: selectMock })
            })
        })
    }
}));

describe('Register Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Varsayılan olarak kullanıcı adı ve email müsait (bulunamadı hatası döner)
        selectMock.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    });

    it('renders register form', () => {
        render(<Register />);
        // Placeholder'lar ile inputları kontrol et
        expect(screen.getByPlaceholderText('Ahmet')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('ahmetyilmaz')).toBeInTheDocument();
    });

    it('validates required fields and shows error for invalid inputs', async () => {
        render(<Register />);

        // 1. Hatalı Kullanıcı Adı (Türkçe karakter içeriyor)
        // Senin kodundaki regex (/^[a-zA-Z0-9]+$/) Türkçe karakterleri KABUL ETMEZ.
        fireEvent.change(screen.getByPlaceholderText('ahmetyilmaz'), { target: { value: 'ahmetğ' } });

        // Diğer alanları doldur
        fireEvent.change(screen.getByPlaceholderText('Ahmet'), { target: { value: 'Test' } });
        fireEvent.change(screen.getByPlaceholderText('Yılmaz'), { target: { value: 'User' } });
        fireEvent.change(screen.getByPlaceholderText('ornek@email.com'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        // Sözleşmeyi onayla
        const checkbox = screen.getByLabelText(/kabul ediyorum/i);
        fireEvent.click(checkbox);

        // Butona bas
        fireEvent.click(screen.getByRole('button', { name: /Hesap Oluştur/i }));

        // Hata mesajını bekle: Kodundaki mesaj "Kullanıcı adı sadece harf ve rakamlardan oluşabilir."
        expect(screen.getByText(/sadece harf ve rakamlardan oluşabilir/i)).toBeInTheDocument();
    });

    it('validates legal agreements', async () => {
        render(<Register />);

        // Formu düzgün doldur
        fireEvent.change(screen.getByPlaceholderText('Ahmet'), { target: { value: 'Test' } });
        fireEvent.change(screen.getByPlaceholderText('Yılmaz'), { target: { value: 'User' } });
        fireEvent.change(screen.getByPlaceholderText('ahmetyilmaz'), { target: { value: 'testuser1' } }); // Geçerli kullanıcı adı
        fireEvent.change(screen.getByPlaceholderText('ornek@email.com'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        // AMA Sözleşmeyi işaretleme!

        fireEvent.click(screen.getByRole('button', { name: /Hesap Oluştur/i }));

        // Hata mesajını bekle
        expect(screen.getByText(/Lütfen kullanıcı sözleşmesi/i)).toBeInTheDocument();
    });

    it('completes registration successfully', async () => {
        signUpMock.mockResolvedValue({ data: { user: { id: '123' }, identities: [{ id: '123' }] }, error: null });

        render(<Register />);

        // Formu doldur
        fireEvent.change(screen.getByPlaceholderText('Ahmet'), { target: { value: 'Test' } });
        fireEvent.change(screen.getByPlaceholderText('Yılmaz'), { target: { value: 'User' } });
        fireEvent.change(screen.getByPlaceholderText('ahmetyilmaz'), { target: { value: 'testuser1' } });
        fireEvent.change(screen.getByPlaceholderText('ornek@email.com'), { target: { value: 'test@test.com' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });

        // Sözleşmeyi onayla
        const checkbox = screen.getByLabelText(/kabul ediyorum/i);
        fireEvent.click(checkbox);

        fireEvent.click(screen.getByRole('button', { name: /Hesap Oluştur/i }));

        await waitFor(() => {
            expect(screen.getByText(/E-postanı Kontrol Et!/i)).toBeInTheDocument();
        });
    });
});