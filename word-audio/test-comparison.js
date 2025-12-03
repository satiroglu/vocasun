const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const GOOGLE_API_KEY = process.env.GOOGLE_TTS_API_KEY;

const COMPARE_WORDS = ['schedule', 'tomato', 'water', 'mobile'];

function cleanIPA(ipa) {
    if (!ipa) return null;
    return ipa.replace(/[\/\[\]]/g, '').trim();
}

async function generateSingle(word, ipa, accent) {
    console.log(`   👉 [${accent}] Üretiliyor... (IPA: ${ipa})`);

    const cleanedIPA = cleanIPA(ipa);

    // DÜZELTME BURADA YAPILDI:
    // 'Journey' yerine IPA desteği tam olan 'Neural2' sesine geçtik.
    const voiceConfig = accent === 'UK'
        ? { languageCode: 'en-GB', name: 'en-GB-Neural2-A', ssmlGender: 'FEMALE' }
        : { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' };
    // Neural2-F: Google'ın en popüler ve kaliteli Amerikan kadın sesidir.

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_API_KEY}`;

    const ssmlText = `<speak><phoneme alphabet="ipa" ph="${cleanedIPA}">${word}</phoneme></speak>`;

    try {
        const response = await axios.post(url, {
            input: { ssml: ssmlText },
            voice: voiceConfig,
            audioConfig: { audioEncoding: 'MP3', speakingRate: 0.9 }
        });

        const fileName = `${accent}_${word}.mp3`;
        fs.writeFileSync(fileName, Buffer.from(response.data.audioContent, 'base64'));
        console.log(`   ✅ BAŞARILI: ${fileName} oluşturuldu.`);

    } catch (error) {
        console.error(`   ❌ HATA [${accent}]:`, error.response?.data?.error?.message || error.message);
    }
}

async function runComparison() {
    console.log("⚔️  US vs UK Karşılaştırma Testi (Neural2 Modu)...\n");

    const { data: words, error } = await supabase
        .from('vocabulary')
        .select('word, type, ipa_us, ipa_uk')
        .in('word', COMPARE_WORDS)
        .eq('type', 'noun');

    if (error || !words) {
        console.error("DB Hatası veya Kelime Bulunamadı");
        return;
    }

    for (const w of words) {
        console.log(`\n🔹 Kelime: ${w.word.toUpperCase()}`);
        if (w.ipa_us) await generateSingle(w.word, w.ipa_us, 'US');
        if (w.ipa_uk) await generateSingle(w.word, w.ipa_uk, 'UK');
    }

    console.log("\n🏁 Test bitti. Klasördeki dosyaları dinleyebilirsiniz.");
}

runComparison();