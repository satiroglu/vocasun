import React from 'react';

const PrivacyContent = () => {
    return (
        <div className="prose prose-slate max-w-none text-slate-700">
            <p className="mb-6">
                Vocasun olarak, kullanıcılarımızın gizliliğine ve kişisel verilerinin güvenliğine büyük önem veriyoruz. Bu Gizlilik Politikası, platformumuzu kullanırken verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında genel bilgiler sunar.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Genel Prensipler</h2>
            <p className="mb-4">
                Kişisel verileriniz, yalnızca hizmetlerimizi sunmak ve geliştirmek amacıyla, yasalara uygun olarak işlenir. Verileriniz, izniniz olmadan veya yasal bir zorunluluk olmadıkça üçüncü şahıslarla paylaşılmaz.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Veri Güvenliği</h2>
            <p className="mb-4">
                Verileriniz, endüstri standardı güvenlik önlemleri (SSL/TLS şifreleme vb.) ile korunmaktadır. Ancak, internet üzerinden yapılan hiçbir veri iletiminin %100 güvenli olmadığını unutmayınız.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">Çerezler (Cookies)</h2>
            <p className="mb-6">
                Kullanıcı deneyimini iyileştirmek için çerezler kullanıyoruz. Çerez tercihlerinizi tarayıcı ayarlarınızdan yönetebilirsiniz.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">İletişim</h2>
            <p>
                Gizlilik ile ilgili sorularınız için <a href="mailto:hello@vocasun.com" className="text-indigo-600 hover:underline">hello@vocasun.com</a> adresinden bize ulaşabilirsiniz.
            </p>
        </div>
    );
};

export default PrivacyContent;
