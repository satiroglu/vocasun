import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuizMode from '../../components/word-card/QuizMode';
import { VocabularyItem } from '@/types';

// Mock Veriler
const mainWord: VocabularyItem = { id: 1, word: 'Run', meaning: 'Koşmak', type: 'v', level: 'A1', example_en: '', example_tr: '', created_at: '' };
const otherWords: VocabularyItem[] = [
    mainWord,
    { id: 2, word: 'Sleep', meaning: 'Uyumak', type: 'v', level: 'A1', example_en: '', example_tr: '', created_at: '' },
    { id: 3, word: 'Eat', meaning: 'Yemek', type: 'v', level: 'A1', example_en: '', example_tr: '', created_at: '' },
    { id: 4, word: 'Walk', meaning: 'Yürümek', type: 'v', level: 'A1', example_en: '', example_tr: '', created_at: '' },
];

describe('QuizMode Component', () => {
    const onNextMock = vi.fn();
    const onPrevMock = vi.fn();
    const playAudioMock = vi.fn();

    it('soru ve şıklar render ediliyor', () => {
        render(<QuizMode word={mainWord} allWords={otherWords} onNext={onNextMock} onPrev={onPrevMock} playAudio={playAudioMock} />);

        // Ana kelime ekranda mı?
        expect(screen.getByText('Run')).toBeInTheDocument();
        // Doğru cevap şıklarda var mı?
        expect(screen.getByText('Koşmak')).toBeInTheDocument();
        // Yanlış cevaplardan biri var mı?
        expect(screen.getByText('Uyumak')).toBeInTheDocument();
    });

    it('doğru şık seçildiğinde başarı durumu oluşuyor', () => {
        render(<QuizMode word={mainWord} allWords={otherWords} onNext={onNextMock} onPrev={onPrevMock} playAudio={playAudioMock} />);

        // Doğru şıkkı bul ve tıkla
        const correctOption = screen.getByText('Koşmak');
        fireEvent.click(correctOption);

        // Ses çaldı mı?
        expect(playAudioMock).toHaveBeenCalled();
        // "Sonraki" butonu geldi mi?
        expect(screen.getByText(/Sonraki/i)).toBeInTheDocument();
    });

    it('bir şık seçildikten sonra diğer şıklar kilitleniyor', () => {
        render(<QuizMode word={mainWord} allWords={otherWords} onNext={onNextMock} onPrev={onPrevMock} playAudio={playAudioMock} />);

        const wrongOption = screen.getByText('Uyumak');
        fireEvent.click(wrongOption);

        // Artık başka bir şıkka tıklanamamalı (disabled kontrolü)
        // QuizMode kodunda butonlara `disabled={status !== 'idle'}` vermiştik.
        const correctOption = screen.getByText('Koşmak').closest('button');
        expect(correctOption).toBeDisabled();
    });
});