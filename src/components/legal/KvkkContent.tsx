import React from 'react';

const KvkkContent = () => {
    return (
        <div className="prose prose-slate max-w-none text-slate-700">
            <p className="mb-6">
                Bu Aydınlatma Metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, veri sorumlusu sıfatıyla Vocasun tarafından kişisel verilerinizin işlenmesi hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">1. Veri Sorumlusu</h2>
            <p className="mb-4">
                Kişisel verileriniz, Vocasun tarafından aşağıda belirtilen amaçlar doğrultusunda işlenmektedir.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">2. İşlenen Kişisel Veriler</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
                <li><strong>Kimlik Bilgileri:</strong> Ad, soyad, kullanıcı adı.</li>
                <li><strong>İletişim Bilgileri:</strong> E-posta adresi.</li>
                <li><strong>İşlem Güvenliği:</strong> IP adresi, log kayıtları, parola bilgileri.</li>
                <li><strong>Kullanım Verileri:</strong> Uygulama içi aktiviteler, öğrenme istatistikleri.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">3. İşleme Amaçları</h2>
            <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>Üyelik işlemlerinin yürütülmesi.</li>
                <li>Hizmetlerin sunulması ve iyileştirilmesi.</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi (5651 sayılı Kanun vb.).</li>
                <li>İletişim faaliyetlerinin yürütülmesi.</li>
            </ul>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">4. Veri Aktarımı</h2>
            <p className="mb-6">
                Kişisel verileriniz, yasal zorunluluklar dışında üçüncü kişilerle paylaşılmamaktadır. Teknik altyapı sağlayıcıları ile yapılan paylaşımlarda gerekli güvenlik tedbirleri alınmaktadır.
            </p>

            <h2 className="text-xl font-bold text-slate-900 mt-8 mb-4">5. Haklarınız</h2>
            <p className="mb-4">
                KVKK'nın 11. maddesi uyarınca, verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme ve itiraz etme haklarına sahipsiniz. Taleplerinizi <a href="mailto:hello@vocasun.com" className="text-indigo-600 hover:underline">hello@vocasun.com</a> adresine iletebilirsiniz.
            </p>
        </div>
    );
};

export default KvkkContent;
