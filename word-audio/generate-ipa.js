const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');
const OpenAI = require('openai');

// AYARLAR
const BATCH_SIZE = 40; // Tek seferde 40 kelime gönderelim (Güvenli limit)
const MODEL = "gpt-4o";

// Bağlantılar
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function processBatch() {
    console.log("🚀 IPA Zenginleştirme Operasyonu Başlıyor...");

    let hasMore = true;
    let page = 0;
    let totalProcessed = 0;

    while (hasMore) {
        // 1. Veritabanından IPA'sı eksik olan kelimeleri çek
        // (Sadece ipa_us boş olanlara bakmamız yeterli, ikisi de aynı anda dolacak)
        const { data: words, error } = await supabase
            .from('vocabulary')
            .select('id, word, type')
            .is('ipa_us', null) // Sadece işlenmemişleri getir
            .range(0, BATCH_SIZE - 1); // Her seferinde ilk 40'ı al (çünkü işlenenler listeden düşecek)

        if (error) {
            console.error("❌ DB Hatası:", error);
            break;
        }

        if (!words || words.length === 0) {
            console.log("✅ Tüm kelimeler tamamlandı! İşlenecek veri kalmadı.");
            hasMore = false;
            break;
        }

        console.log(`\n📦 Grup İşleniyor: ${words.length} kelime (Toplam İşlenen: ${totalProcessed})`);

        // 2. OpenAI için veri hazırla
        const promptInput = words.map(w => ({ id: w.id, word: w.word, type: w.type || 'unknown' }));

        try {
            const completion = await openai.chat.completions.create({
                model: MODEL,
                messages: [
                    {
                        role: "system",
                        content: `Sen uzman bir dilbilimcisini. Verilen kelimeler için kesin US (Merriam-Webster) ve UK (Oxford) IPA transkripsiyonlarını üret.
                        
                        KURALLAR:
                        1. US: Rhotic (r baskın). UK: Non-rhotic.
                        2. Bağlam: 'type' bilgisine göre homograph ayrımı yap.
                        3. Çıktı: SADECE aşağıdaki JSON yapısını döndür:
                        {
                            "results": [
                                { "id": 123, "word": "example", "ipa_us": "...", "ipa_uk": "..." }
                            ]
                        }
                        4. IPA'larda '/' veya '[]' kullanma.
                        `
                    },
                    {
                        role: "user",
                        content: JSON.stringify(promptInput)
                    }
                ],
                temperature: 0,
                response_format: { type: "json_object" }
            });

            // 3. Yanıtı İşle
            const responseText = completion.choices[0].message.content;
            const parsed = JSON.parse(responseText);
            const results = parsed.results || parsed.data;

            if (!results) {
                console.error("⚠️ OpenAI boş veya hatalı format döndürdü. Bu grup atlanıyor.");
                continue;
            }

            // 4. Veritabanını Güncelle (Parallel Update)
            console.log("💾 Veritabanına kaydediliyor...");

            const updatePromises = results.map(async (item) => {
                // Güvenlik: ID eşleşiyor mu?
                if (!item.id || !item.ipa_us) return;

                const { error: updateError } = await supabase
                    .from('vocabulary')
                    .update({
                        ipa_us: item.ipa_us,
                        ipa_uk: item.ipa_uk
                    })
                    .eq('id', item.id);

                if (updateError) console.error(`Hata (ID: ${item.id}):`, updateError.message);
            });

            await Promise.all(updatePromises);

            totalProcessed += words.length;
            console.log(`✅ ${words.length} kelime kaydedildi.`);

        } catch (aiError) {
            console.error("❌ OpenAI Hatası:", aiError.message);
            // Hata olursa döngüyü kırmayalım, bir sonraki denemede tekrar deneriz
            // Ama sonsuz döngüye girmemek için kısa bir bekleme koyalım
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // Rate Limit (Hız Sınırı) yememek için küçük bir mola
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n🏁 OPERASYON BAŞARIYLA TAMAMLANDI.");
}

processBatch();