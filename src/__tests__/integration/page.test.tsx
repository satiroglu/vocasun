import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Learn from '../../app/learn/page';
import { VocabularyItem } from '@/types';

// --- MOCK DATA ---
const mockWords: VocabularyItem[] = [
    {
        id: 101,
        word: 'Apple',
        meaning: 'Elma',
        type: 'noun',
        level: 'A1',
        // DÜZELTME: Örnek cümle içinde kelime geçmesin ki "Basit Input" modu açılsın
        // Böylece placeholder="Kelimeyi yazın..." görünür olur.
        example_en: 'A red fruit that keeps the doctor away.',
        example_tr: 'Doktoru uzak tutan kırmızı bir meyve.',
        audio_url: 'http://audio.com/apple.mp3',
        created_at: new Date().toISOString()
    },
    {
        id: 102,
        word: 'Run',
        meaning: 'Koşmak',
        type: 'verb',
        level: 'A1',
        example_en: 'I run fast.',
        example_tr: 'Hızlı koşarım.',
        created_at: new Date().toISOString()
    }
];

// --- MOCKS ---
const mutateAsyncMock = vi.fn();

// useUser Mock
vi.mock('@/hooks/useUser', () => ({
    useUser: () => ({
        user: { id: 'test-user-id' },
        loading: false
    })
}));

// useLearnSession Mock
vi.mock('@/hooks/useLearnSession', () => ({
    useLearnSession: () => ({
        data: { words: mockWords, progressMap: {} },
        isLoading: false,
        isRefetching: false,
        refetch: vi.fn()
    }),
    useChoiceOptions: () => ({
        data: [
            { id: 201, word: 'Pear', meaning: 'Armut' },
            { id: 202, word: 'Banana', meaning: 'Muz' },
            { id: 203, word: 'Grape', meaning: 'Üzüm' }
        ],
        isLoading: false
    }),
    useSaveProgress: () => ({
        mutateAsync: mutateAsyncMock
    })
}));

// Audio & Speech Mocks
window.HTMLMediaElement.prototype.play = () => Promise.resolve();
window.HTMLMediaElement.prototype.pause = () => { };
Object.defineProperty(window, 'speechSynthesis', {
    value: {
        speak: vi.fn(),
        cancel: vi.fn(),
    },
});
class MockSpeechSynthesisUtterance {
    lang = '';
    constructor(public text: string) { }
}
window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance as any;

describe('Learn Page Integration Test', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Sayfa yükleniyor ve ilk kelime (Apple) gösteriliyor', async () => {
        render(<Learn />);

        await waitFor(() => {
            expect(screen.getByText('Elma')).toBeInTheDocument();
        });

        // Mock veriyi düzelttiğimiz için artık bu input ekranda olmalı
        expect(screen.getByPlaceholderText('Kelimeyi yazın...')).toBeInTheDocument();
    });

    it('YAZMA MODU: Doğru cevap yazılınca sunucuya doğru veri gidiyor', async () => {
        render(<Learn />);

        // Elemanın yüklenmesini bekle
        await waitFor(() => screen.getByPlaceholderText('Kelimeyi yazın...'));

        const input = screen.getByPlaceholderText('Kelimeyi yazın...');
        const submitBtn = screen.getByText('Kontrol Et');

        fireEvent.change(input, { target: { value: 'Apple' } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mutateAsyncMock).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'test-user-id',
                vocabId: 101,
                userAnswer: 'Apple',
                mode: 'write',
                isMastered: false
            }));
        });

        expect(screen.getByText(/Harika/i)).toBeInTheDocument();
    });

    it('KART (FLIP) MODU: "Biliyorum" denilince sunucuya CORRECT gidiyor', async () => {
        render(<Learn />);

        // 1. Karta geç
        const flipTab = screen.getByText('Kart');
        fireEvent.click(flipTab);

        // 2. Karta tıkla (Cevabı Gör)
        await waitFor(() => screen.getByText('Cevabı Gör'));
        const cardArea = screen.getByText('Cevabı Gör');
        fireEvent.click(cardArea);

        // 3. "Biliyorum" butonuna tıkla (Kartın arkasındaki)
        const knownButtons = screen.getAllByText('Biliyorum');
        // Kartın arkasındaki buton DOM'a son eklenen butondur
        const cardKnownBtn = knownButtons[knownButtons.length - 1];

        fireEvent.click(cardKnownBtn);

        await waitFor(() => {
            // DÜZELTME: Kart arkasındaki buton userAnswer: 'CORRECT' ve isMastered: false gönderir.
            expect(mutateAsyncMock).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'test-user-id',
                vocabId: 101,
                userAnswer: 'CORRECT',
                mode: 'flip',
                isMastered: false
            }));
        });
    });

    it('SEÇME (CHOICE) MODU: Şık seçilince kelime sunucuya gidiyor', async () => {
        render(<Learn />);

        const choiceTab = screen.getByText('Seç');
        fireEvent.click(choiceTab);

        await waitFor(() => screen.getByText('Apple'));

        const correctOption = screen.getByText('Apple');
        fireEvent.click(correctOption);

        await waitFor(() => {
            expect(mutateAsyncMock).toHaveBeenCalledWith(expect.objectContaining({
                userId: 'test-user-id',
                vocabId: 101,
                userAnswer: 'Apple',
                mode: 'choice',
                isMastered: false
            }));
        });
    });
});