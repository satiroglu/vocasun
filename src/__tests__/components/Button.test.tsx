import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from '../../components/Button';

describe('Button Component', () => {
    it('renders correctly with children text', () => {
        render(<Button>Tıkla Bana</Button>);

        // Butonun ekranda olup olmadığını kontrol et
        const buttonElement = screen.getByRole('button', { name: /tıkla bana/i });
        expect(buttonElement).toBeInTheDocument();
    });

    it('shows loading spinner when isLoading is true', () => {
        render(<Button isLoading>Kaydet</Button>);

        // "İşleniyor..." metninin göründüğünü doğrula
        expect(screen.getByText('İşleniyor...')).toBeInTheDocument();

        // Butonun disabled (tıklanamaz) olduğunu doğrula
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });
});