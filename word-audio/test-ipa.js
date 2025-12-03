const path = require('path');
// DÜZELTME: .env.local dosyası bir üst dizinde (ana dizinde) olduğu için yolu güncelledik.
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// TEST LİSTESİ: AI'ın en çok zorlanacağı kelimeler
const HARD_10_WORDS = [
    { word: "schedule", type: "noun" },     // Aksan farkı (Skedyul/Şedyul)
    { word: "water", type: "noun" },        // Harf yutma (Wa-ter/Wo-tah)
    { word: "tomato", type: "noun" },       // Ünlü değişimi (Tomeyto/Tomato)
    { word: "mobile", type: "adjective" },  // Sonek farkı (Mobıl/Mobayl)
    { word: "live", type: "verb" },         // Eş sesli (Yaşamak - /lɪv/)
    { word: "live", type: "adjective" },    // Eş sesli (Canlı - /laɪv/)
    { word: "present", type: "verb" },      // Vurgu farkı (Sunmak - /prɪˈzent/)
    { word: "present", type: "noun" },      // Vurgu farkı (Hediye - /ˈprez.ənt/)
    { word: "lieutenant", type: "noun" },   // Tamamen farklı (Loo-tenant/Lef-tenant)
    { word: "car", type: "noun" }           // R harfi (Car/Ca:)
];

async function runTest() {
    console.log("🧠 GPT-4o Dilbilim Testi Başlıyor...");
    console.log("📂 Çalışma Dizini:", __dirname); // Nerede çalıştığımızı görelim
    console.log("⏳ Analiz ediliyor (Bu işlem birkaç saniye sürebilir)...");

    if (!process.env.OPENAI_API_KEY) {
        console.error("❌ HATA: OPENAI_API_KEY bulunamadı. Lütfen .env.local dosyanızın yerini kontrol edin.");
        return;
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Dilbilim yeteneği en yüksek model
            messages: [
                {
                    role: "system",
                    content: `Sen uzman bir fonetik ve dilbilim profesörüsün. 
                    Görevin: Verilen İngilizce kelimeler için kesin US (Amerikan) ve UK (İngiliz) IPA transkripsiyonlarını üretmek.
                    
                    KURALLAR:
                    1. US IPA: Merriam-Webster standartlarını kullan (Rhotic, 'r' baskın).
                    2. UK IPA: Oxford English Dictionary standartlarını kullan (Non-rhotic, 'r' yutulan).
                    3. BAĞLAM: Kelime türüne (type) göre okunuşu ayarla (Homographs).
                    4. FORMAT: Sadece saf JSON array döndür. IPA metinlerinde '/' veya '[]' kullanma, sadece karakterleri ver.
                    
                    İstenen JSON Yapısı:
                    [{"word": "...", "type": "...", "ipa_us": "...", "ipa_uk": "..."}]`
                },
                {
                    role: "user",
                    content: JSON.stringify(HARD_10_WORDS)
                }
            ],
            temperature: 0, // Yaratıcılık sıfır, kesinlik %100
            response_format: { type: "json_object" }
        });

        const resultText = completion.choices[0].message.content;
        const resultJSON = JSON.parse(resultText);

        // OpenAI bazen root key kullanabilir, kontrol ediyoruz:
        const dataList = resultJSON.words || resultJSON.data || resultJSON;

        console.log("\n🎯 SONUÇ RAPORU:");
        console.table(dataList);

        console.log("\n🔍 KONTROL NOKTALARI:");
        console.log("1. 'schedule': US 'sk' ile, UK 'ʃ' (ş) ile başlıyor mu?");
        console.log("2. 'live' (verb): /lɪv/ iken, 'live' (adj): /laɪv/ oldu mu?");
        console.log("3. 'car': US versiyonunda 'r' varken, UK versiyonunda 'r' yok mu?");

    } catch (error) {
        console.error("❌ HATA:", error);
    }
}

runTest();