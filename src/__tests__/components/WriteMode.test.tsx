import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WriteMode from '../../components/word-card/WriteMode';
import { VocabularyItem } from '@/types';

// Mock Veri
const mockWord: VocabularyItem = {
    id: 1,
    word: 'Apple',
    meaning: 'Elma',
    type: 'noun',
    level: 'A1',
    example_en: 'I eat an apple.',
    example_tr: 'Ben bir elma yerim.',
    created_at: new Date().toISOString()
};

describe('WriteMode Component', () => {
    // Fonksiyonları taklit et (Mock)
    const onNextMock = vi.fn();
    const onPrevMock = vi.fn();
    const playAudioMock = vi.fn();

    it('başlangıçta doğru render oluyor', () => {
        render(<WriteMode word={mockWord} onNext={onNextMock} onPrev={onPrevMock} playAudio={playAudioMock} />);

        // Türkçe anlamı ekranda olmalı
        expect(screen.getByText('Elma')).toBeInTheDocument();
        // Input boş olmalı
        const input = screen.getByPlaceholderText('İngilizcesini yazın...');
        expect(input).toHaveValue('');
    });

    it('doğru cevap verildiğinde başarı durumuna geçiyor', () => {
        render(<WriteMode word={mockWord} onNext={onNextMock} onPrev={onPrevMock} playAudio={playAudioMock} />);

        const input = screen.getByPlaceholderText('İngilizcesini yazın...');
        const submitBtn = screen.getByText('Kontrol Et');

        // Doğru cevabı yaz (Büyük/küçük harf duyarsız olmalı)
        fireEvent.change(input, { target: { value: 'apple' } });
        fireEvent.click(submitBtn);

        // Başarı mesajı göründü mü?
        expect(screen.getByText(/Harika! Doğru cevap/i)).toBeInTheDocument();
        // Ses çalındı mı?
        expect(playAudioMock).toHaveBeenCalled();
        // Buton "Sıradaki" oldu mu?
        expect(screen.getByText(/Sıradaki/i)).toBeInTheDocument();
    });

    it('yanlış cevap verildiğinde hata gösteriyor', () => {
        render(<WriteMode word={mockWord} onNext={onNextMock} onPrev={onPrevMock} playAudio={playAudioMock} />);

        const input = screen.getByPlaceholderText('İngilizcesini yazın...');
        const submitBtn = screen.getByText('Kontrol Et');

        // Yanlış cevap yaz
        fireEvent.change(input, { target: { value: 'pear' } });
        fireEvent.click(submitBtn);

        // Hata mesajı ve doğrusu göründü mü?
        expect(screen.getByText(/Yanlış. Doğrusu: Apple/i)).toBeInTheDocument();
    });

    it('sıradaki butonuna basınca onNext tetikleniyor', () => {
        render(<WriteMode word={mockWord} onNext={onNextMock} onPrev={onPrevMock} playAudio={playAudioMock} />);

        // Önce doğru bilip durumu 'correct' yapalım
        const input = screen.getByPlaceholderText('İngilizcesini yazın...');
        fireEvent.change(input, { target: { value: 'Apple' } });
        fireEvent.click(screen.getByText('Kontrol Et'));

        // Şimdi 'Sıradaki' butonuna bas
        fireEvent.click(screen.getByText(/Sıradaki/i));
        expect(onNextMock).toHaveBeenCalled();
    });
});