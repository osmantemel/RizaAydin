# GitHub üzerinden yayın

## Hazır olanlar

- `.github/workflows/ci.yml`: GitHub'a gönderilen değişiklikler için biçim kontrolü, test ve build.
- `Dockerfile`: Mevcut SQLite backend'ini çalıştıran Node.js 24 yayın imajı.
- `.dockerignore` ve `.gitignore`: Parolalar, müşteri verileri ve yerel veritabanı kaynak paketine alınmaz.

GitHub hesabı veya depo henüz bağlanmamıştır; site internete yayımlanmış değildir.

## Ücretsiz yayın sınırı

GitHub Pages statik dosyalar sunar; bu projenin admin paneli, yorum gönderimi ve SQLite backend'ini çalıştırmaz. Tam uygulamanın yerine sessizce statik bir sürüm yayımlanmamalıdır.

Render'ın ücretsiz web sunucusunda yerel disk kalıcı değildir. Bu haliyle yüklenen görseller ve SQLite içerikleri yeniden başlatmada kaybolabilir. Bu nedenle ücretsiz sunucuya mevcut dosya depolama modeliyle gerçek içerik kaydı açılmamalıdır.

Tam uygulamayı ücretsiz katmanlarla yayımlamak için önce kalıcı harici veritabanı ve görsel deposu bağlanmalıdır. Seçilen sağlayıcının güncel ücretsiz kotası, ticari kullanım ve hesap koşulları doğrulanmalıdır. Hesap bağlantısı ve gerekli erişimler tamamlandığında sunucu, veritabanı ve görsel depolama birlikte kurulmalıdır.

## Mevcut kalıcı diskli sunucu için

Docker imajını üretin; `/app/data` dizinine kalıcı disk bağlayın. Yönetici şifresini sunucunun gizli ortam ayarlarına girin. Yerel `.env` dosyasını GitHub'a göndermeyin.

Yayın ortamı: `ADMIN_PASSWORD`, `SITE_URL`, `INDEXABLE`, `DATA_DIR`. Derleme sırasında INDEXABLE=false ise robots ve genel metadata için gerçek yayın ayarlarıyla tekrar build gerekir. `TRUST_PROXY` yalnızca güvenilir ters vekil IP başlıklarını değiştiriyorsa etkinleştirilmelidir.

İlk müşteri inceleme yayını için `INDEXABLE=false` bırakın. Örnek yorum ve çalışmalar gerçek referanslarla değiştirilene kadar indekslemeyi açmayın.
