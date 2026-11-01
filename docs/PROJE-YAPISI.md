# Proje kodları nerede?

Bu proje tek bir Next.js uygulamasıdır. Ziyaretçi sitesi, yönetim arayüzü ve backend aynı uygulamada çalışır. Ayrı bir backend sunucusu başlatmak gerekmez.

```text
app/                         URL'leri Next.js'e bağlayan sayfalar
  [[...slug]]/page.jsx        Ana sayfa ve ziyaretçi sayfaları; SEO metadata
  admin/page.jsx             /admin giriş noktası
  api/[...path]/route.js      /api/* backend giriş noktası
  media/[name]/route.js       Yüklenen fotoğrafların sunulması
  layout.jsx                 Ortak HTML, dil ve site ikonları
  robots.js                  Arama motoru tarama ayarları
  sitemap.js                 Site haritası

components/
  site/                      Ziyaretçinin gördüğü React bileşenleri
    Header.jsx               Sabit menü ve mobil üç çizgili menü
    Site.jsx                 Alt bölüm, hizmet/iş/yorum kartları
    ReviewForm.jsx           Ziyaretçinin yorum gönderdiği form
  admin/
    AdminPanel.jsx           Yönetim panelinin React arayüzü
  shared/
    Icon.jsx                 Ortak SVG ikonları

server/                      Yalnızca sunucuda kullanılan backend kodu
  api.mjs                    API işlemleri, fotoğraf yükleme, hata yanıtları
  auth.mjs                   Parola doğrulama, oturum ve çıkış
  database.mjs               SQLite tabloları, veri okuma ve işlemler
  validation.mjs             Gelen alanların Zod ile doğrulanması

content/
  services.mjs               Başlangıç hizmet metinleri ve SEO açıklamaları
lib/
  seo.mjs                    Google yapılandırılmış verileri ve URL yardımcıları
styles/
  globals.css                Tasarım ve mobil ekran kuralları
public/                      Logo, favicon, ikonlar ve paylaşım görselleri
scripts/                     Yedekleme, ikon üretimi, örnek içerik ekleme
  backup.mjs                 Veritabanı yedeği
  brand-assets.mjs           Logo boyutları ve paylaşım görseli
  seed-examples.mjs          Örnek iş/yorum içerikleri

test/                        Backend ve SEO kontrolleri
data/                        Çalışma verileri (Git'e gönderilmez)
  site.sqlite                İçerik, yorum ve oturum veritabanı
  uploads/                   Yüklenen ve optimize edilmiş fotoğraflar
backups/                     Veritabanı yedekleri (Git'e gönderilmez)
.env                         Yerel parola ve yayın ayarları (Git'e gönderilmez)
```

## Yönetim paneli ve backend farkı

**Yönetim paneli** ustanın ekranıdır: `components/admin/AdminPanel.jsx`.

**Backend** bu ekrandan gelen işlemleri doğrular, oturumu kontrol eder ve veritabanına kaydeder: `server/`.

Örnek akış:

1. Usta panelde “Kaydet” düğmesine basar.
2. React paneli `/api/admin` adresine istek gönderir.
3. `app/api/[...path]/route.js` isteği `server/api.mjs` dosyasına iletir.
4. `server/auth.mjs` oturumu, `server/validation.mjs` gönderilen alanları doğrular.
5. İşlem `server/database.mjs` üzerinden veritabanına kaydedilir.
6. Ziyaretçi sayfası yenilendiğinde güncel içerik sunucudan okunur.

## Backend adresleri

| Yöntem | Adres | İşlem | Erişim |
| --- | --- | --- | --- |
| POST | `/api/login` | Yönetici girişi | Parola ve deneme sınırı |
| POST | `/api/logout` | Oturumu kapatma | Aynı kaynaktan istek |
| GET | `/api/admin` | İçerikleri ve bekleyen yorumları okuma | Yönetici oturumu |
| POST | `/api/admin` | İçerik kaydetme, silme, yorum onayı | Yönetici oturumu |
| POST | `/api/admin/upload` | Fotoğraf yükleme | Yönetici oturumu |
| POST | `/api/reviews` | Onay bekleyen yorum gönderme | Yayın izni ve istek sınırı |
| GET | `/media/:name` | Yüklenen görseli gösterme | Herkese açık |

`/api/admin` yazma işlemleri `action` alanıyla ayrılır: `settings`, `services`, `post`, `delete-post`, `review`, `delete-review`.

## Bir şeyi değiştirmek istediğimde

| İhtiyaç | Başlangıç noktası |
| --- | --- |
| Ustanın metinlerini veya işlerini değiştirme | `/admin` paneli |
| Menü veya mobil açılır menü | `components/site/Header.jsx` |
| İş ve yorum kartları | `components/site/Site.jsx` |
| Ana sayfanın bölüm sırası | `app/[[...slug]]/page.jsx` |
| Renk, boşluk, ekran genişliği | `styles/globals.css` |
| Panelde yeni alan ekleme | `components/admin/AdminPanel.jsx`, `server/validation.mjs`, `server/api.mjs` |
| Giriş ve oturum | `server/auth.mjs` |
| Veri tabloları | `server/database.mjs` |
| SEO başlıkları | `app/[[...slug]]/page.jsx`, `content/services.mjs` |
| İşletme yapılandırılmış verisi | `lib/seo.mjs` |
| Alan adı ve indeksleme | `.env` içindeki `SITE_URL`, `INDEXABLE` |

Başlangıç metinleri yalnızca ilk veritabanı kurulurken kullanılır. Sonraki metin değişikliklerini panelden yapın; `content/services.mjs` değişikliği kayıtlı metinleri kendiliğinden ezmez.

## Geliştirme ve doğrulama

```sh
npm run dev          # Geliştirme
npm test             # Backend ve SEO testleri
npm run build        # Yayın sürümü hazırlama
npm start            # Yayın sürümünü çalıştırma
npm run format       # Kodları okunabilir biçimlendirme
npm run format:check # Biçim kontrolü
npm run backup       # Veritabanı yedeği
```

`.env`, veritabanı ve müşteri fotoğrafları kaynak kodundan ayrı tutulmalıdır. Veri dosyalarını silmek site metinlerini ve müşteri içeriklerini kaybettirir. Dağıtım ve yedekleme ayrıntıları ana README'dedir.
