import React from 'react';

const TermsContent = () => {
    return (
        <div className="prose prose-slate max-w-none text-slate-700">
            <p className="mb-6">
                Bu Kullanım Koşulları ve Üyelik Sözleşmesi ("Sözleşme"), Vocasun ("Şirket") tarafından işletilen web sitesi ve mobil uygulamalar ("Platform") üzerinden sunulan hizmetlerden yararlanan kullanıcılar ("Kullanıcı") arasındaki şartları belirler. Platformu kullanarak bu şartları kabul etmiş sayılırsınız.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Hizmetin Kapsamı</h2>
            <p className="mb-4">
                Vocasun, kullanıcılara dil öğrenimi, kelime ezberleme ve ilgili eğitim materyallerine erişim hizmeti sunar. Şirket, hizmetlerin içeriğini, kapsamını ve sunum şeklini dilediği zaman değiştirme hakkını saklı tutar.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. Kullanıcı Yükümlülükleri</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Kullanıcı, üyelik oluştururken verdiği bilgilerin doğru ve güncel olduğunu taahhüt eder.</li>
                <li>Hesap güvenliği ve şifre gizliliği kullanıcının sorumluluğundadır.</li>
                <li>Platform, yasa dışı, ahlaka aykırı veya üçüncü şahısların haklarını ihlal eden amaçlarla kullanılamaz.</li>
                <li>Kullanıcı, diğer üyelerin hizmetten yararlanmasını engelleyici veya zorlaştırıcı faaliyetlerde bulunamaz.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. Fikri Mülkiyet Hakları</h2>
            <p className="mb-6">
                Vocasun platformunda yer alan tüm içerik, yazılım, tasarım, grafikler, logolar ve eğitim materyalleri Şirket'in mülkiyetindedir ve Fikir ve Sanat Eserleri Kanunu kapsamında korunmaktadır. İzinsiz kopyalanması, çoğaltılması veya ticari amaçla kullanılması yasaktır.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Gizlilik</h2>
            <p className="mb-6">
                Kullanıcının kişisel verileri, Gizlilik Politikası ve Aydınlatma Metni'nde belirtilen esaslar çerçevesinde işlenir ve korunur.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Sorumluluk Reddi</h2>
            <p className="mb-6">
                Vocasun, hizmetlerin kesintisiz veya hatasız olacağını garanti etmez. Teknik aksaklıklar, bakım çalışmaları veya mücbir sebepler nedeniyle hizmette kesintiler yaşanabilir.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">6. Uyuşmazlıkların Çözümü</h2>
            <p className="mb-6">
                İşbu Sözleşme'den doğabilecek her türlü uyuşmazlığın çözümünde İstanbul (Çağlayan) Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">İletişim</h2>
            <p>
                Kullanım koşulları ile ilgili sorularınız için <a href="mailto:hello@vocasun.com" className="text-indigo-600 hover:underline">hello@vocasun.com</a> adresinden bize ulaşabilirsiniz.
            </p>
        </div>
    );
};

export default TermsContent;
