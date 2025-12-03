const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// AYARLAR
const BUCKET_NAME = 'word-audio';
const GOOGLE_API_KEY = process.env.GOOGLE_TTS_API_KEY;

// Supabase Bağlantısı
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// IPA Temizleme
function cleanIPA(ipa) {
    if (!ipa) return null;
    return ipa.replace(/[\/\[\]]/g, '').trim();
}

/**
 * Google TTS (Full SSML Modu - Neural2 Sesleri)
 */
async function generateAudio(word, ipa, accent) {
    const cleanedIPA = cleanIPA(ipa);
    const useSSML = !!cleanedIPA;

    // US ve UK için EN İYİ ses ayarları (Neural2 IPA destekler)
    const voiceConfig = accent === 'UK'
        ? { languageCode: 'en-GB', name: 'en-GB-Neural2-A', ssmlGender: 'FEMALE' }
        : { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' }; // DÜZELTİLDİ

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

    let requestBody = {
        voice: voiceConfig,
        audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 }
    };

    if (useSSML) {
        // IPA ile kesin okunuş
        const ssmlText = `<speak><phoneme alphabet="ipa" ph="${cleanedIPA}">${word}</phoneme></speak>`;
        requestBody.input = { ssml: ssmlText };
    } else {
        // IPA yoksa düz metin
        requestBody.input = { text: word };
    }

    try {
        const response = await axios.post(url, requestBody);
        return response.data.audioContent;
    } catch (error) {
        // Hata durumunda (Bozuk IPA vs) düz metinle tekrar dene (Fallback)
        if (useSSML) {
            try {
                requestBody.input = { text: word };
                const retryResponse = await axios.post(url, requestBody);
                return retryResponse.data.audioContent;
            } catch (retryError) {
                return null;
            }
        }
        console.error(`❌ TTS Hatası (${word}):`, error.response?.data?.error?.message || error.message);
        return null;
    }
}

// Storage'a Yükleme (Klasörlü Yapı)
async function uploadToStorage(base64Audio, wordId, accent) {
    const buffer = Buffer.from(base64Audio, 'base64');

    // KLASÖRLEME: us/123_US.mp3 veya uk/123_UK.mp3
    const folder = accent.toLowerCase(); // 'us' veya 'uk'
    const fileName = `${folder}/${wordId}_${accent}.mp3`;

    const { error } = await supabase
        .storage
        .from(BUCKET_NAME)
        .upload(fileName, buffer, { contentType: 'audio/mpeg', upsert: true });

    if (error) {
        console.error(`Storage Hatası:`, error.message);
        return null;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
}

// ANA OPERASYON
async function processAudioQueue() {
    console.log("🎙️ Google TTS Ses Üretimi Başlıyor...");
    console.log("👉 US ve UK sesleri Neural2 motoru ve IPA verisiyle üretilecek.");
    console.log("👉 Dosyalar 'us/' ve 'uk/' klasörlerine yerleştirilecek.");

    let hasMore = true;
    let page = 0;
    const pageSize = 50;

    while (hasMore) {
        // Sadece sesi EKSİK olanları çekiyoruz
        const { data: words, error } = await supabase
            .from('vocabulary')
            .select('id, word, ipa_us, ipa_uk, audio_us, audio_uk')
            .or('audio_us.is.null,audio_uk.is.null') // Biri bile eksikse getir
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) { console.error("DB Hatası:", error); break; }

        if (!words || words.length === 0) {
            console.log("✅ İşlenecek kelime kalmadı. Operasyon tamamlandı.");
            hasMore = false;
            break;
        }

        console.log(`\n📦 Grup ${page + 1} İşleniyor (${words.length} kelime)...`);

        // Sıralı işlem (API Limitlerini korumak için)
        for (const w of words) {
            const updates = {};
            let logMsg = `${w.word}: `;

            // US Sesi Üret
            if (!w.audio_us) {
                const audio = await generateAudio(w.word, w.ipa_us, 'US');
                if (audio) {
                    const url = await uploadToStorage(audio, w.id, 'US');
                    if (url) {
                        updates.audio_us = url;
                        logMsg += "🇺🇸 (OK) ";
                    }
                } else {
                    logMsg += "🇺🇸 (ERR) ";
                }
            }

            // UK Sesi Üret
            if (!w.audio_uk) {
                const audio = await generateAudio(w.word, w.ipa_uk, 'UK');
                if (audio) {
                    const url = await uploadToStorage(audio, w.id, 'UK');
                    if (url) {
                        updates.audio_uk = url;
                        logMsg += "🇬🇧 (OK) ";
                    }
                } else {
                    logMsg += "🇬🇧 (ERR) ";
                }
            }

            // Veritabanını Güncelle
            if (Object.keys(updates).length > 0) {
                await supabase.from('vocabulary').update(updates).eq('id', w.id);
                process.stdout.write(logMsg + "\n");
            }
        }

        // Google API'ye nefes aldırma (Rate Limit Koruması)
        await new Promise(resolve => setTimeout(resolve, 500));
        page++;
    }

    console.log("\n🏁 BÜTÜN SESLER ÜRETİLDİ VE YÜKLENDİ. TEBRİKLER!");
}

processAudioQueue();