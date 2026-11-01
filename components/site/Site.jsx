import Header from './Header.jsx';
import Icon from '../shared/Icon.jsx';
export const whatsapp = 'https://wa.me/905392044342';
export function Brand() {
  return (
    <a className="brand" href="/" aria-label="Rıza Aydın Dekorasyon ana sayfa">
      <img className="brand-logo" src="/logo.svg" alt="" width="56" height="56" />
      <span>
        RIZA AYDIN<small>DEKORASYON & TADİLAT</small>
      </span>
    </a>
  );
}
export function Shell({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <footer>
        <div>
          <Brand />
          <p>25 yılı aşkın deneyimle, yaşam alanlarınıza özen.</p>
        </div>
        <div>
          <strong>Birlikte yenileyelim.</strong>
          <p>
            <a href="tel:+905392044342">0539 204 43 42</a>
          </p>
          <a
            href="https://www.instagram.com/riza.dekorasyon/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="instagram" /> Instagram
          </a>
        </div>
        <div>
          <strong>Çayırova / Kocaeli</strong>
          <p>İstanbul ve Kocaeli’de hizmet.</p>
          <p>
            <a href="/hizmet-bolgeleri">Hizmet bölgeleri →</a>
          </p>
          <a href="/iletisim">İletişim →</a>
          <p>
            <a href="/gizlilik">Gizlilik ve yorumlar</a>
          </p>
        </div>
        <div className="copyright">© {new Date().getFullYear()} Rıza Aydın Dekorasyon</div>
      </footer>
      <div className="mobile-actions" aria-label="Hızlı iletişim">
        <a
          className="floating-call"
          href="tel:+905392044342"
          aria-label="Hemen ara"
          title="Hemen ara"
        >
          <Icon name="phone" />
          <span>Hemen ara</span>
        </a>
        <a
          className="floating-whatsapp"
          href={whatsapp}
          aria-label="WhatsApp’tan yaz"
          title="WhatsApp’tan yaz"
        >
          <Icon name="message" />
          <span>WhatsApp’tan yaz</span>
        </a>
      </div>
    </>
  );
}
export function Heading({ label, title, text }) {
  return (
    <section className="page-heading">
      <p className="eyebrow">{label}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </section>
  );
}
export function CTA() {
  return (
    <section className="cta">
      <div>
        <p className="eyebrow">AKLINIZDA BİR YENİLİK Mİ VAR?</p>
        <h2>Fayans, boya veya tadilat için ulaşın.</h2>
        <p>
          İlçenizi ve yapılacak alanın fotoğraflarını gönderin; kapsamı ve teklif detaylarını
          konuşalım.
        </p>
      </div>
      <a className="button cream" href={whatsapp}>
        <Icon name="message" />
        WhatsApp’tan yazın
      </a>
    </section>
  );
}
export function Services({ services }) {
  return (
    <div className="services">
      {Object.entries(services).map(([slug, s], i) => (
        <a className="service" href={'/hizmetler/' + slug} key={slug}>
          <span className="number">
            {String(i + 1).padStart(2, '0')}
            <Icon name="arrow" />
          </span>
          <div className="service-icon">
            <Icon name={['tile', 'paint', 'wall', 'home'][i]} />
          </div>
          <h3>{s.title}</h3>
          <p>{s.summary}</p>
          <span className="text-link">
            Hizmeti inceleyin <Icon name="arrow" />
          </span>
        </a>
      ))}
    </div>
  );
}
export function Posts({ posts }) {
  return (
    <div className="post-grid">
      {posts.map((p) => (
        <article className="post" key={p.id}>
          {p.image && (
            <a href={'/gonderi/' + p.id}>
              <img src={p.image} alt={p.title} loading="lazy" width="600" height="400" />
            </a>
          )}
          <div>
            <p className="eyebrow">
              {p.district} · {p.kind}
            </p>
            <h3>
              <a href={'/gonderi/' + p.id}>{p.title}</a>
            </h3>
            <p>{p.text.slice(0, 160)}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
export function Reviews({ reviews }) {
  return (
    <div className="review-grid">
      {reviews.map((r) => (
        <blockquote className="review-card" key={r.id}>
          <cite>{r.name}</cite>
          <div className="review-stars" aria-label={`5 üzerinden ${r.rating} puan`}>
            {'★'.repeat(r.rating)}
            {'☆'.repeat(5 - r.rating)}
          </div>
          <p>{r.text}</p>
        </blockquote>
      ))}
    </div>
  );
}
export function Invitation({ works = false }) {
  return (
    <div className="review-invitation">
      <div>
        <Icon name={works ? 'home' : 'message'} />
        <p>
          {works
            ? 'Fayans, boya ve tadilat uygulamalarımız hakkında bilgi alın.'
            : 'Hizmetimiz hakkındaki deneyiminizi paylaşın.'}
        </p>
      </div>
      <a className="text-link" href={works ? whatsapp : '/yorumlar#review-form'}>
        {works ? 'İşinizi konuşalım' : 'Yorum yazın'}
        <Icon name="arrow" />
      </a>
    </div>
  );
}
