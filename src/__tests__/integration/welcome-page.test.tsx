import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Welcome from '@/app/welcome/page';

// Confetti mock
vi.mock('canvas-confetti', () => ({
    default: vi.fn()
}));

describe('Welcome Page', () => {
    it('renders welcome message and link', () => {
        render(<Welcome />);

        expect(screen.getByText(/Aramıza Hoş Geldin!/i)).toBeInTheDocument();

        const link = screen.getByRole('link', { name: /Öğrenmeye Başla/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/dashboard');
    });
});