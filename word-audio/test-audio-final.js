const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');

// Supabase Bağlantısı
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GOOGLE_API_KEY = process.env.GOOGLE_TTS_API_KEY;

// TEST EDİLECEK KELİMELER (Veritabanından çekilecekler)
const TEST_WORDS = ['schedule', 'mobile', 'tomato', 'live', 'present'];

function cleanIPA(ipa) {
    if (!ipa) return null;
    return ipa.replace(/[\/\[\]]/g, '').trim();
}

async function generateAndSave(wordObj, accent) {
    const word = wordObj.word;
    const ipa = accent === 'UK' ? wordObj.ipa_uk : wordObj.ipa_us;
    const cleanedIPA = cleanIPA(ipa);
    const type = wordObj.type;

    console.log(`🎙️ Üretiliyor: ${word} (${type}) - [${accent}] - IPA: ${cleanedIPA}`);

    const voiceConfig = accent === 'UK'
        ? { languageCode: 'en-GB', name: 'en-GB-Neural2-A', ssmlGender: 'FEMALE' }
        : { languageCode: 'en-US', name: 'en-US-Journey-F', ssmlGender: 'FEMALE' };

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

    // SSML ZORLAMASI
    const ssmlText = `<speak><phoneme alphabet="ipa" ph="${cleanedIPA}">${word}</phoneme></speak>`;

    try {
        const response = await axios.post(url, {
            input: { ssml: ssmlText }, // Kesinlikle SSML kullanıyoruz
            voice: voiceConfig,
            audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 }
        });

        // Dosyayı diske kaydet
        const fileName = `TEST_${word}_${type}_${accent}.mp3`;
        fs.writeFileSync(fileName, Buffer.from(response.data.audioContent, 'base64'));
        console.log(`✅ Kaydedildi: ${fileName}`);

    } catch (error) {
        console.error(`❌ HATA (${word}):`, error.response?.data?.error?.message || error.message);
    }
}

async function runTest() {
    console.log("🔍 Veritabanından test kelimeleri çekiliyor...");

    // Test kelimelerini veritabanından, IPA'larıyla birlikte çekiyoruz
    const { data: words, error } = await supabase
        .from('vocabulary')
        .select('word, type, ipa_us, ipa_uk')
        .in('word', TEST_WORDS);

    if (error) {
        console.error("DB Hatası:", error);
        return;
    }

    console.log(`📦 ${words.length} adet kelime varyasyonu bulundu.`);

    for (const w of words) {
        // Her kelime için hem US hem UK üret
        await generateAndSave(w, 'US');
        await generateAndSave(w, 'UK');
    }

    console.log("\n🎵 Test tamamlandı! Lütfen oluşan MP3 dosyalarını dinleyin.");
}

runTest();