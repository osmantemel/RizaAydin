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

## Yalnızca arayüzü ücretsiz yayımlama

Müşteriye görünümü göstermek için backend veya Supabase gerekmez. `npm run build:preview` geçici bir örnek veritabanıyla arayüzü oluşturur ve yalnızca HTML/CSS/görselleri `dist-preview/` klasörüne çıkarır. Gerçek yerel veriler, parolalar ve oturumlar bu çıktıya alınmaz. Mobil menü çalışır; admin ve yorum kaydetme içermez. İndeksleme kapalıdır.

Render'da **Static Site** seçin, GitHub'daki `osmantemel/RizaAydin` deposunu bağlayın:

- Build command: `npm ci && npm run build:preview`
- Publish directory: `dist-preview`
- Node sürümü: `24`
- Dal: `main`

`render.yaml` aynı statik yayın ayarlarını içerir. Web Service veya ücretli disk seçmeyin. Statik sitede veritabanı bağlantısı gerekmez.

GitHub Pages seçilecekse kaynak deponun hesap planına göre Pages'e uygun olması gerekir. Proje yolu için `PREVIEW_BASE_PATH=/RizaAydin npm run build:preview` kullanın. Özel depoyu izin almadan herkese açmayın.
