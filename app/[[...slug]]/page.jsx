import { structuredData } from '../../lib/seo.mjs';
import { notFound } from 'next/navigation';
import { getContent } from '../../server/database.mjs';
import { serviceCopy } from '../../content/services.mjs';
import Icon from '../../components/shared/Icon.jsx';
import {
  Shell,
  Heading,
  CTA,
  Services,
  Posts,
  Reviews,
  Invitation,
  whatsapp,
} from '../../components/site/Site.jsx';
import ReviewForm from '../../components/site/ReviewForm.jsx';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const homeTitle = 'İstanbul ve Kocaeli Fayans, Boya ve Tadilat | Rıza Aydın';
const homeDescription =
  'İstanbul ve Kocaeli’de fayans ustası, boya badana, duvar tamiri ve ev tadilatı. Çayırova merkezli Rıza Aydın ile 25 yılı aşkın deneyim.';
export async function generateMetadata({ params }) {
  const path = (await params).slug || [];
  const key = path.join('/');
  let title = homeTitle,
    description = homeDescription;
  const titles = {
    hizmetler: 'İstanbul ve Kocaeli Tadilat Hizmetleri | Rıza Aydın',
    hakkinda: 'Rıza Aydın Hakkında | 25 Yılı Aşkın Deneyim',
    iletisim: 'İletişim | Rıza Aydın Dekorasyon',
    yorumlar: 'Müşteri Yorumları | Rıza Aydın Dekorasyon',
    'yapilan-isler': 'Yapılan İşler ve Gönderiler | Rıza Aydın',
    'hizmet-bolgeleri': 'İstanbul ve Kocaeli Hizmet Bölgeleri | Rıza Aydın',
    gizlilik: 'Gizlilik ve Yorum Bilgilendirmesi | Rıza Aydın',
  };
  if (titles[key]) title = titles[key];
  if (path[0] === 'hizmetler' && serviceCopy[path[1]]) {
    title = serviceCopy[path[1]].seoTitle;
    description = serviceCopy[path[1]].description;
  }
  if (path[0] === 'gonderi') {
    const p = getContent().posts.find((p) => p.id === path[1]);
    if (p) {
      title = p.title + ' | Rıza Aydın';
      description = p.text.slice(0, 155);
    }
  }
  const canonical =
    process.env.INDEXABLE === 'true' && process.env.SITE_URL
      ? new URL('/' + key, process.env.SITE_URL).toString()
      : undefined;
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Rıza Aydın Dekorasyon',
      images: [{ url: '/social-card.png', width: 1200, height: 630, alt: 'Rıza Aydın Dekorasyon' }],
      ...(canonical ? { url: canonical } : {}),
    },
  };
}
function SectionTitle({ label, title, href, link }) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
      </div>
      {href && (
        <a className="text-link" href={href}>
          {link}
          <Icon name="arrow" />
        </a>
      )}
    </div>
  );
}
export default async function Page({ params }) {
  const parts = (await params).slug || [],
    path = parts.join('/'),
    c = getContent();
  let body;
  if (!path)
    body = (
      <>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="dot" /> ÇAYIROVA · KOCAELİ · İSTANBUL
            </p>
            <h1 className="preserve">{c.headline}</h1>
            <p className="intro">{c.intro}</p>
            <div className="actions">
              <a className="button" href={whatsapp}>
                <Icon name="message" />
                İşinizi konuşalım
              </a>
              <a className="secondary" href="/yapilan-isler">
                Yapılan işleri inceleyin →
              </a>
            </div>
            <div className="hero-proof">
              <strong>
                25<span>+</span>
              </strong>
              <span>
                YILLIK DENEYİM
                <br />
                Her detayda ustalık.
              </span>
              <div className="proof-line" />
              <span>
                Fayans · Boya
                <br />
                Tamirat · Tadilat
              </span>
            </div>
          </div>
          <div className="hero-art">
            <div className="art-label">İYİ İŞÇİLİK, GÜZEL YAŞAM ALANLARI.</div>
            <img
              src="/room.svg"
              alt="Seramik ve doğal renklerle iç mekân çizimi"
              width="700"
              height="800"
            />
            <div className="art-stamp">
              <Icon name="home" />
              <span>
                Fayans · Boya · Tadilat
                <br />
                <strong>Yaşam alanlarınıza özen.</strong>
              </span>
            </div>
          </div>
        </section>
        <div className="ribbon">
          <div className="ribbon-inner">
            <span>FAYANS & SERAMİK</span>
            <b>✳</b>
            <span>BOYA & BADANA</span>
            <b>✳</b>
            <span>DUVAR TAMİRİ</span>
            <b>✳</b>
            <span>TADİLAT & YENİLEME</span>
          </div>
        </div>
        <section className="section">
          <SectionTitle label="NELER YAPIYORUZ?" title="Fayans, boya ve tadilat hizmetleri." />
          <Services services={c.serviceTexts} />
        </section>
        <section className="about-band">
          <div className="about-inner">
            <div className="about-number">
              25<span>+</span>
              <small>YILLIK DENEYİM</small>
            </div>
            <div>
              <p className="eyebrow">USTANIZLA TANIŞIN</p>
              <h2>Merhaba, ben Rıza Aydın.</h2>
              <p>{c.about}</p>
              <a className="text-link" href="/hakkinda">
                Daha yakından tanıyın <Icon name="arrow" />
              </a>
            </div>
          </div>
        </section>
        <section className="section home-works">
          <SectionTitle
            label="UYGULAMALAR & PAYLAŞIMLAR"
            title="Yapılan işler."
            href="/yapilan-isler"
            link="Tüm işleri inceleyin"
          />
          {c.posts.length ? <Posts posts={c.posts.slice(0, 3)} /> : <Invitation works />}
          <a className="mobile-section-link" href="/yapilan-isler">
            Tamamını incele <Icon name="arrow" />
          </a>
        </section>
        <section className="section home-reviews">
          <SectionTitle
            label="MÜŞTERİ DENEYİMLERİ"
            title="Sizden gelen yorumlar."
            href="/yorumlar"
            link="Tüm yorumlar"
          />
          {c.reviews.length ? <Reviews reviews={c.reviews.slice(0, 3)} /> : <Invitation />}
          <a className="mobile-section-link" href="/yorumlar">
            Tamamını incele <Icon name="arrow" />
          </a>
        </section>
        <section className="section region-section">
          <div>
            <p className="eyebrow">ÇAYIROVA MERKEZLİ</p>
            <h2>İstanbul ve Kocaeli’de hizmet.</h2>
          </div>
          <div>
            <p>
              Çayırova, Gebze, Darıca, Tuzla ve Pendik çevresinde fayans, boya ve tadilat işleriniz
              için ulaşabilirsiniz. Diğer ilçelerdeki işlerinizi de kapsamına ve çalışma takvimine
              göre birlikte değerlendirelim.
            </p>
            <a className="text-link" href="/hizmet-bolgeleri">
              Hizmet bölgelerini inceleyin <Icon name="arrow" />
            </a>
          </div>
        </section>
        <section className="section process">
          <p className="eyebrow">NASIL İLERLİYORUZ?</p>
          <h2>İlk mesajdan son dokunuşa.</h2>
          <div className="steps">
            {[
              [
                '01',
                'İşinizi anlatın',
                'İhtiyacınızı ve varsa fotoğrafları WhatsApp üzerinden paylaşın.',
              ],
              [
                '02',
                'Detayları netleştirelim',
                'Kapsamı, malzemeyi ve uygulama planını birlikte konuşalım.',
              ],
              [
                '03',
                'Yeniliğe başlayalım',
                'Anlaşılan iş ve takvim doğrultusunda uygulamaya geçelim.',
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>
        <CTA />
      </>
    );
  else if (path === 'hizmetler')
    body = (
      <>
        <Heading
          label="HİZMETLERİMİZ"
          title="İstanbul ve Kocaeli’de tadilat hizmetleri"
          text="Fayans ve seramik döşeme, boya badana, duvar tamiri ve ev yenileme için ihtiyacınıza uygun hizmeti inceleyin."
        />
        <section className="section">
          <Services services={c.serviceTexts} />
        </section>
        <CTA />
      </>
    );
  else if (parts.length === 2 && parts[0] === 'hizmetler' && serviceCopy[parts[1]]) {
    const info = serviceCopy[parts[1]],
      s = c.serviceTexts[parts[1]];
    body = (
      <>
        <Heading
          label={'HİZMETLER / ' + s.title.toLocaleUpperCase('tr')}
          title={info.heading}
          text={s.summary}
        />
        <section className="reading">
          <h2>İhtiyacınıza göre planlanan uygulama.</h2>
          <p>{s.text}</p>
          <h2>Hangi işler için ulaşabilirsiniz?</h2>
          <ul className="scope-list">
            {info.includes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <h2>Teklif için neler gerekli?</h2>
          <p>
            Yapılacak alanın fotoğrafları, bulunduğu ilçe ve yaklaşık ölçüler ilk değerlendirmeyi
            kolaylaştırır. Kesin kapsam ve fiyat, işin durumuna ve malzeme tercihine göre
            belirlenir.
          </p>
          <h2>Hizmet bölgeleri</h2>
          <p>
            Çayırova merkezli olarak Kocaeli ve İstanbul’da hizmet veriyoruz. Çayırova, Gebze,
            Darıca, Tuzla ve Pendik çevresindeki işlerinizin yanı sıra diğer ilçeler için de bize
            ulaşabilirsiniz.
          </p>
          <a className="text-link" href="/hizmet-bolgeleri">
            Hizmet bölgelerini inceleyin <Icon name="arrow" />
          </a>
          <h2>Sık sorulan sorular</h2>
          <details>
            <summary>{info.question}</summary>
            <p>{info.answer}</p>
          </details>
          <details>
            <summary>Fiyat nasıl belirlenir?</summary>
            <p>
              Yüzeyin durumu, alanın büyüklüğü, malzeme seçimi ve yapılacak işlemler birlikte
              değerlendirilir.
            </p>
          </details>
          <details>
            <summary>Uygulama ne kadar sürer?</summary>
            <p>Süre işin kapsamına göre değişir. Çalışma takvimi teklif aşamasında görüşülür.</p>
          </details>
        </section>
        <CTA />
      </>
    );
  } else if (path === 'hakkinda')
    body = (
      <>
        <Heading
          label="RIZA AYDIN DEKORASYON"
          title="25 yılı aşkın ustalık."
          text="Çayırova’dan İstanbul ve Kocaeli’ye, yaşam alanları için çalışıyoruz."
        />
        <section className="reading">
          <h2>Ustanızla doğrudan iletişim.</h2>
          <p className="preserve">{c.about}</p>
        </section>
        <CTA />
      </>
    );
  else if (path === 'yapilan-isler')
    body = (
      <>
        <Heading
          label="İŞİMİZDEN NOTLAR"
          title="Uygulamalar ve paylaşımlar."
          text="Uygulamalar, iş detayları ve ustadan notlar."
        />
        <section className="section">
          {c.posts.length ? <Posts posts={c.posts} /> : <Invitation works />}
        </section>
      </>
    );
  else if (parts.length === 2 && parts[0] === 'gonderi') {
    const p = c.posts.find((p) => p.id === parts[1]);
    if (!p) notFound();
    body = (
      <>
        <Heading label={p.district} title={p.title} text={p.kind} />
        <article className="reading">
          {p.image && <img className="article-image" src={p.image} alt={p.title} />}
          <p className="preserve">{p.text}</p>
        </article>
        <CTA />
      </>
    );
  } else if (path === 'yorumlar')
    body = (
      <>
        <Heading
          label="DENEYİMİNİZ DEĞERLİ"
          title="Sizden gelenler."
          text="Hizmetlerimiz hakkındaki görüşlerinizi ve deneyiminizi paylaşın."
        />
        <section className="reading">
          <Reviews reviews={c.reviews} />
          <ReviewForm />
        </section>
      </>
    );
  else if (path === 'iletisim')
    body = (
      <>
        <Heading
          label="BİZE ULAŞIN"
          title="İşinizi konuşalım."
          text="Fotoğraf gönderin, ihtiyacınızı birlikte değerlendirelim."
        />
        <section className="reading contact">
          <a href="tel:+905392044342">0539 204 43 42</a>
          <p>Çayırova / Kocaeli · İstanbul ve Kocaeli’de hizmet</p>
          <p>{c.hours}</p>
          <a className="button" href={whatsapp}>
            <Icon name="message" />
            WhatsApp’tan yazın
          </a>
          <p>
            <Icon name="location" /> Hizmetlerimiz müşterilerimizin adresinde sunulmaktadır.
          </p>
        </section>
      </>
    );
  else if (path === 'hizmet-bolgeleri')
    body = (
      <>
        <Heading
          label="HİZMET BÖLGELERİ"
          title="İstanbul ve Kocaeli’de yanınızdayız."
          text="Çayırova merkezli fayans, boya badana, duvar tamiri ve tadilat hizmetleri."
        />
        <section className="reading">
          <h2>Kocaeli’de fayans, boya ve tadilat</h2>
          <p>
            Çayırova, Gebze ve Darıca çevresinde fayans döşeme, iç cephe boyama ve duvar tamiri
            ihtiyaçlarınız için ulaşabilirsiniz. Kocaeli’nin diğer ilçelerindeki işlerinizde ilçe,
            yapılacak işlem ve yaklaşık alan bilgisini paylaşarak uygunluğu öğrenebilirsiniz.
          </p>
          <h2>İstanbul’da tadilat işleri</h2>
          <p>
            İstanbul tarafında Tuzla ve Pendik dahil olmak üzere yapılacak işin kapsamına ve çalışma
            takvimine göre hizmet veriyoruz. Uzak ilçelerde küçük tamir ve kapsamlı yenileme
            işlerinin ulaşım ve zaman planı farklı olabilir; işe başlamadan önce detayları birlikte
            konuşalım.
          </p>
          <h2>Teklif görüşmesini nasıl başlatabilirsiniz?</h2>
          <ol>
            <li>İlçenizi ve hangi hizmete ihtiyaç duyduğunuzu belirtin.</li>
            <li>Alan fotoğraflarını ve yaklaşık ölçüsünü paylaşın.</li>
            <li>Malzeme tercihinizi ve düşündüğünüz zaman aralığını iletin.</li>
          </ol>
          <p>
            Müşterilerimizin adresinde hizmet veriyoruz. Bu bölgelerde ayrı şube veya ofisimiz
            olduğu anlamına gelmez.
          </p>
          <h2>İhtiyacınıza uygun hizmet</h2>
          <div className="region-links">
            {Object.entries(c.serviceTexts).map(([slug, s]) => (
              <a href={'/hizmetler/' + slug} key={slug}>
                {s.title}
                <Icon name="arrow" />
              </a>
            ))}
          </div>
        </section>
        <CTA />
      </>
    );
  else if (path === 'gizlilik')
    body = (
      <>
        <Heading
          label="BİLGİLENDİRME"
          title="Gizlilik ve müşteri yorumları"
          text="İletişim ve yorum alanlarını kullanırken bilmeniz gerekenler."
        />
        <section className="reading">
          <h2>Yorumlarınız</h2>
          <p>
            Yorum formunda paylaştığınız ad, puan ve yorum metni, yayın izninizle birlikte
            kaydedilir. Yorumlar yönetici tarafından kontrol edildikten sonra herkese açık olarak
            yayımlanır. Telefon, ev adresi veya başka kişilere ait özel bilgileri yorum alanına
            yazmayın.
          </p>
          <h2>İletişim ve kaldırma talepleri</h2>
          <p>
            Yorumunuzun kaldırılması veya bilgilerinizle ilgili talebiniz için 0539 204 43 42
            numarasından Rıza Aydın’a ulaşabilirsiniz. Talebin size ait olduğu doğrulandıktan sonra
            değerlendirilir.
          </p>
          <h2>Güvenlik ve çerezler</h2>
          <p>
            Yönetici girişinde zorunlu oturum çerezi kullanılır. Ziyaretçi yorumları için reklam
            veya analiz çerezi kullanılmaz. Kötüye kullanımı sınırlandırmak için kısa süreli istek
            sayaçları tutulur.
          </p>
          <h2>WhatsApp ve Instagram</h2>
          <p>Bu bağlantılara tıkladığınızda ilgili hizmetin kendi gizlilik koşulları geçerlidir.</p>
        </section>
      </>
    );
  else notFound();
  const schema = structuredData(path, c);
  return (
    <Shell>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }}
        />
      )}
      {body}
    </Shell>
  );
}
