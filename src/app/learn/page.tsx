'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { EyeOff } from 'lucide-react';
import { VocabularyItem } from '@/types';
import { useUser } from '@/hooks/useUser';
import { useProfile } from '@/hooks/useProfile';
import { useLearnSession, useSaveProgress } from '@/hooks/useLearnSession';

import WriteMode from '@/components/learn/modes/WriteMode';
import ChoiceMode from '@/components/learn/modes/ChoiceMode';
import CardMode from '@/components/learn/modes/CardMode';
import LearnResult from '@/components/learn/LearnResult';
import LearnFinished from '@/components/learn/LearnFinished';
import LearnHeader from '@/components/learn/LearnHeader';
import LearnExitModal from '@/components/learn/LearnExitModal';
import WordBadges from '@/components/learn/WordBadges';

type Mode = 'write' | 'choice' | 'flip';
type FeedbackStatus = 'idle' | 'success' | 'error';

export default function Learn() {
    const { user, refreshUser } = useUser();

    // 1. DÜZELTME: Profil verisini aktif ettik. Ayarlar (Aksan, Liste) buradan okunacak.
    const { data: profile } = useProfile(user?.id);

    const { data: sessionData, isLoading: sessionLoading, isRefetching, refetch: refetchSession } = useLearnSession(user?.id);
    const saveProgressMutation = useSaveProgress();

    const [mode, setMode] = useState<Mode>('write');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionStats, setSessionStats] = useState({ correct: 0, wrong: 0, earnedXp: 0 });
    const [isSessionFinished, setIsSessionFinished] = useState(false);
    const [status, setStatus] = useState<FeedbackStatus>('idle');
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [showFullResult, setShowFullResult] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isProcessing, setIsProcessing] = useState(false);

    const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'warning' | 'info', text: string } | null>(null);
    const [showExitModal, setShowExitModal] = useState(false);

    const [localQueue, setLocalQueue] = useState<VocabularyItem[]>([]);
    const [initialSessionLength, setInitialSessionLength] = useState(0);

    const startTimeRef = useRef(Date.now()); // Başlangıç zamanı

    useEffect(() => {
        if (sessionData?.words) {
            setLocalQueue(sessionData.words);
            setInitialSessionLength(sessionData.words.length);
        }
    }, [sessionData]);

    const progressMap = sessionData?.progressMap || {};
    const currentWord = localQueue[currentIndex];
    const currentProgress = currentWord ? progressMap[currentWord.id] : undefined;

    const startNewSession = () => {
        setIsSessionFinished(false);
        setSessionStats({ correct: 0, wrong: 0, earnedXp: 0 });
        setCurrentIndex(0);
        setLocalQueue([]);
        setInitialSessionLength(0);
        refetchSession();
    };

    useEffect(() => {
        setStatus('idle');
        setShowFullResult(false);
        setIsProcessing(false);
        setFeedbackMsg(null);

        // YENİ: Sayaç sıfırlama
        startTimeRef.current = Date.now();
    }, [currentIndex, mode]);

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    };

    const processingRef = useRef(false);

    const playAudio = (overrideAccent?: 'US' | 'UK', textToSpeak?: string) => {
        stopAudio();

        // 2. DÜZELTME: Aksan tercihini 'profile' içinden alıyoruz.
        // user?.accent_preference genelde boştur, doğrusu profile?.accent_preference'dir.
        const userAccent = overrideAccent || profile?.accent_preference || 'US';

        if (textToSpeak) {
            const u = new SpeechSynthesisUtterance(textToSpeak);
            u.lang = userAccent === 'UK' ? 'en-GB' : 'en-US';
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
            return;
        }

        const wordToPlay = currentWord?.word;
        if (!wordToPlay || !currentWord) return;

        let audioSrc: string | null | undefined = null;

        if (userAccent === 'UK') {
            audioSrc = currentWord.audio_uk;
        } else {
            audioSrc = currentWord.audio_us;
        }

        if (!audioSrc) {
            audioSrc = currentWord.audio_us || currentWord.audio_uk || currentWord.audio_url;
        }

        if (audioSrc) {
            const audio = new Audio(audioSrc);
            audioRef.current = audio;
            audio.play().catch(() => { });
        } else {
            const u = new SpeechSynthesisUtterance(wordToPlay);
            u.lang = userAccent === 'UK' ? 'en-GB' : 'en-US';
            window.speechSynthesis.speak(u);
        }
    };

    const handleAnswer = async (answer: string | null, isMasteredManually: boolean = false, visualCorrect: boolean = false) => {
        if (processingRef.current || !user || !currentWord) return;

        processingRef.current = true;
        setIsProcessing(true);

        // Görsel veya manuel doğrulamada ses çal
        playAudio();

        setStatus(visualCorrect || isMasteredManually ? 'success' : 'error');
        setShowFullResult(true);

        // YENİ: Geçen süreyi hesapla (Milisaniye -> Saniye)
        // En az 1 saniye, en fazla 60 saniye olarak sınırla (aşırı değerleri önlemek için)
        const timeSpentMs = Date.now() - startTimeRef.current;
        const timeSpentSeconds = Math.min(Math.max(Math.round(timeSpentMs / 1000), 1), 60);

        try {
            const response = await saveProgressMutation.mutateAsync({
                userId: user.id,
                vocabId: currentWord.id,
                userAnswer: answer,
                mode: mode,
                isMastered: isMasteredManually,
                studyTime: timeSpentSeconds // YENİ: Backend'e gönder
            });

            if (response) {
                const isServerCorrect = response.is_correct || isMasteredManually;
                const xpGained = response.xp_gained || 0;

                if (xpGained > 0) {
                    refreshUser();
                }

                setSessionStats(prev => ({
                    ...prev,
                    correct: prev.correct + (isServerCorrect ? 1 : 0),
                    wrong: prev.wrong + (isServerCorrect ? 0 : 1),
                    earnedXp: prev.earnedXp + xpGained
                }));
            }
        } catch (error) {
            console.error("Cevap kaydedilemedi:", error);
            setFeedbackMsg({
                type: 'warning',
                text: 'İlerleme kaydedilemedi. Lütfen internet bağlantınızı kontrol edin.'
            });
        } finally {
            setTimeout(() => {
                processingRef.current = false;
                setIsProcessing(false);
            }, 500);
        }
    };

    const handleAlreadyKnow = async () => {
        setFeedbackMsg({
            type: 'info',
            text: 'Bu kelimeyi "Biliyorum" olarak işaretlediniz.'
        });
        await handleAnswer(null, true, true);
    };

    const nextQuestion = () => {
        stopAudio();
        if (currentIndex < localQueue.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(currentIndex + 1);
            setTimeout(() => {
                setIsSessionFinished(true);
            }, 1000);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (status !== 'idle' && showFullResult) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    nextQuestion();
                }
                return;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [status, showFullResult]);

    if (sessionLoading || isRefetching || localQueue.length === 0) return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-slate-50 pt-16">
            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-indigo-600 font-bold animate-pulse">Oturum Hazırlanıyor...</p>
        </div>
    );

    if (isSessionFinished) return (
        <LearnFinished stats={sessionStats} onRestart={startNewSession} />
    );

    if (!currentWord) {
        if (currentIndex === initialSessionLength && !isSessionFinished) {
            return (
                <div className="h-[100dvh] bg-slate-50 flex flex-col overflow-hidden font-sans relative pt-0">
                    <div className="flex-1 relative flex flex-col w-full max-w-lg mx-auto overflow-y-auto mt-32 mb-4 items-center justify-center">
                        <div className="animate-pulse text-indigo-600 font-bold">Tamamlanıyor...</div>
                    </div>
                </div>
            );
        }
        return null;
    }

    const isNew = currentProgress?.is_new ?? true;

    return (
        <div className="h-[100dvh] flex flex-col bg-slate-50 overflow-hidden font-sans">
            <LearnHeader
                current={currentIndex}
                total={initialSessionLength}
                mode={mode}
                setMode={setMode}
                onExit={() => setShowExitModal(true)}
            />

            <div className="flex-1 flex flex-col w-full max-w-lg mx-auto overflow-hidden relative">
                <div className="flex-1 flex flex-col p-4 w-full h-full">
                    {!showFullResult && (
                        <div className="shrink-0 flex justify-end mb-2 h-8">
                            <button onClick={handleAlreadyKnow} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm active:scale-95 group">
                                <EyeOff size={14} className="group-hover:text-indigo-600" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Biliyorum</span>
                            </button>
                        </div>
                    )}

                    <div className={`flex-1 flex flex-col items-center justify-center min-h-0 w-full ${mode === 'flip' ? 'pb-0' : 'pb-4'}`}>
                        {currentWord.image_url && !showFullResult && mode !== 'flip' && (
                            <div className="mb-4 w-32 h-32 shrink-0 relative rounded-xl overflow-hidden shadow-md border-2 border-white ring-1 ring-slate-100">
                                <Image src={currentWord.image_url} alt={currentWord.word} fill className="object-cover" sizes="128px" />
                            </div>
                        )}

                        {mode !== 'flip' && (
                            <div className="text-center w-full animate-fade-in flex flex-col items-center justify-center">
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-3 break-words leading-tight px-2">
                                    {currentWord.meaning}
                                </h2>
                                <div className="mb-2 scale-90 origin-center">
                                    <WordBadges currentWord={currentWord} isNew={isNew} />
                                </div>
                                <p className="text-slate-400 font-medium text-xs uppercase tracking-wide">İngilizcesi nedir?</p>
                            </div>
                        )}

                        {mode === 'flip' && !showFullResult && (
                            <CardMode
                                currentWord={currentWord}
                                onAnswer={handleAnswer}
                                playAudio={playAudio}
                                // 3. DÜZELTME: User değil profile'dan alıyoruz
                                accentPreference={profile?.accent_preference}
                            />
                        )}
                    </div>

                    <div className="shrink-0 w-full mt-auto">
                        {mode === 'write' && !showFullResult && (
                            <WriteMode
                                currentWord={currentWord}
                                onAnswer={handleAnswer}
                                setFeedbackMsg={setFeedbackMsg}
                            />
                        )}

                        {mode === 'choice' && !showFullResult && (
                            <ChoiceMode
                                currentWord={currentWord}
                                onAnswer={handleAnswer}
                                disabled={showFullResult}
                            />
                        )}
                    </div>
                </div>
            </div>

            {showFullResult && (
                <LearnResult
                    status={status as 'success' | 'error'}
                    currentWord={currentWord}
                    isNew={isNew}
                    playAudio={playAudio}
                    // 3. DÜZELTME: User değil profile'dan alıyoruz
                    accentPreference={profile?.accent_preference}
                    onNext={nextQuestion}
                    feedbackMsg={feedbackMsg}
                />
            )}

            {showExitModal && (
                <LearnExitModal onCancel={() => setShowExitModal(false)} />
            )}
        </div>
    );
}