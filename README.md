# Rıza Aydın Dekorasyon

Next.js App Router + React ile sunucuda oluşturulan web sitesi ve yönetim paneli. Backend, Next.js Route Handlers üzerinde çalışır. İçerikler, yorumlar ve oturumlar SQLite veritabanında, fotoğraflar kalıcı diskte saklanır.

## Gereksinimler ve çalıştırma

Node.js **24 veya üstü** ve yazılabilir kalıcı disk gerekir.

```sh
npm ci
cp .env.example .env
```

Mevcut `.env` dosyasını kopyalayarak ezmeyin. `.env` içinde en az 12 karakterli `ADMIN_PASSWORD` tanımlayın. Yerel çalışma klasöründe şifre zaten oluşturulmuştur. Git'e gönderilmez.

```sh
npm run dev
```

Site: http://localhost:3000 — Yönetim: http://localhost:3000/admin

Gerçek yayın çalıştırması:

```sh
npm run build
npm start
```

Sunucu aynı ağdan erişim için `0.0.0.0` adresinde dinler. İnternet yayını için HTTPS ters vekili ve kalıcı disk sağlayan bir Node.js sunucusu kullanın. GitHub Pages backend çalıştıramaz. Geçici dosya sistemi kullanan serverless barındırmalara bu depolama biçimiyle yayımlamayın.

## Mimari

- `app/[[...slug]]/page.jsx`: React sunucu bileşenleriyle ziyaretçi sayfaları ve sayfaya özel metadata.
- `components/site/ ve components/admin/`: site bileşenleri, React yönetim paneli ve yorum formu.
- `app/api/[...path]/route.js`: backend giriş noktası.
- `server/api.mjs`: yetki kontrolü, içerik işlemleri, görsel yükleme ve yorumlar.
- `server/validation.mjs`: Zod ile backend girdi doğrulaması.
- `server/database.mjs`: SQLite tabloları, işlemler, veri geçişi ve yedekleme.
- `server/auth.mjs`: şifre doğrulama, hash ile tutulan kalıcı oturumlar, çıkış.
- `content/services.mjs`: varsayılan hizmet içerikleri ve arama açıklamaları.

## Kalıcılık ve güvenlik

`DATA_DIR` varsayılan olarak `./data` dizinidir. Veritabanı `site.sqlite`, görseller `uploads/` içinde tutulur. İlk açılışta önceki `content.json` varsa içerikler bir kez içeri alınır; kaynak dosya korunur. Mevcut data-URL biçimli eski görseller gösterilmeye devam eder; düzenlerken yeni fotoğraf yükleyin.

- SQL parametreleri ve transaction kullanılır; yazma işlemlerinde WAL etkindir.
- Parola ortam değişkeninde tutulur; istemciye gönderilmez. Sabit süreli scrypt karşılaştırması yapılır.
- Oturum belirteçleri veritabanında SHA-256 hash olarak tutulur; HttpOnly/SameSite=Strict çerezi kullanılır. `SITE_URL` HTTPS ise Secure etkindir.
- Şifre değişikliği eski oturumları geçersiz kılar. Oturumlar 8 saat sürer ve sunucu yeniden başladığında korunur.
- Yazma isteklerinde Origin/Host kontrolü, sunucuda alan doğrulaması ve istek boyutu sınırı vardır.
- Giriş ve yorumlar için kalıcı hız sınırı uygulanır. `TRUST_PROXY=false` iken tüm ziyaretçiler ortak sayaç kullanır; gerçek yayında güvenilir ters vekil IP başlıklarını değiştiriyorsa true yapılabilir.
- Fotoğraflar dosya uzantısına güvenilmeden sharp ile çözülür; en fazla 4 MB ve 40 milyon piksel kabul edilir. EXIF verileri kaldırılarak en çok 1600px WebP kaydedilir.
- React metinleri HTML olarak çalıştırmaz. Ziyaretçi yorumları onaysız görünmez; taslaklar kamu API'sine verilmez.
- İçerik işlemleri denetim tablosuna yazılır. Medya dosyaları tahmin edilmesi zor adlarla yayımlanır; fotoğrafları gizli belge deposu olarak kullanmayın.
- Tek sunuculu küçük işletme kullanımı için SQLite uygundur. Birden fazla makineye ölçeklenirken PostgreSQL ve nesne depolamaya geçilmelidir.

## Yedekleme

```sh
npm run backup
```

SQLite'ın çevrimiçi backup API'si ile `backups/` klasörüne tutarlı yedek alınır. **Fotoğraflar için `DATA_DIR/uploads` dizinini ayrıca yedekleyin.** Yedekleri ayrı bir ortamda da tutun. Geri yüklerken sunucuyu kapatın, mevcut veri dizininin kopyasını alın, veritabanı ve görselleri birlikte geri yükleyin. Aktif WAL dosyalarını elle kopyalayarak yedek almayın.

## Kontroller

```sh
npm test
npm run build
```

Testler gerçek veriyi değiştirmeden geçici bir veritabanında JSON geçişini, giriş/çıkışı, oturum hash'ini, kaynak kontrolünü, hatalı alanların reddini, taslak/yayın durumunu, görsel dönüştürmeyi, yorum onayını, hız sınırını ve veritabanı yedeğini doğrular.

## Alan adı ve SEO

Yerel geliştirme aşamasında `INDEXABLE=false` kalır. Gerçek HTTPS alan adı seçildiğinde `SITE_URL` değerini ayarlayıp `INDEXABLE=true` yapın ve yeniden build edin. Canonical, site haritası ve işletme yapılandırılmış verisi bu ayarlara göre oluşturulur. Google İşletme Profili ve Search Console kurulumu ayrıca yapılır. Üst sıra taahhüdü verilmez.

Gerçek yayından önce fotoğrafları ve işletme bilgilerini doğrulayın. Gizlilik metnini gerçek barındırma, veri sorumlusu bilgileri ve saklama uygulamalarına göre tamamlayın. Site henüz internete veya GitHub'a yayımlanmış değildir.

## Kodlarda nereden başlamalıyım?

Klasör haritası, admin/backend ayrımı ve API listesi için [Proje yapısı](docs/PROJE-YAPISI.md) dosyasını okuyun.

`npm run format` kodları biçimlendirir; `npm run format:check` biçim tutarlılığını kontrol eder.
