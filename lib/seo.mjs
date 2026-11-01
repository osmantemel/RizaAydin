import { serviceCopy } from '../content/services.mjs';
export function siteOrigin() {
  const raw = process.env.SITE_URL;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.origin;
  } catch {
    return null;
  }
}
export function structuredData(path, content) {
  const origin = siteOrigin();
  if (process.env.INDEXABLE !== 'true' || !origin) return null;
  const absolute = (p) => new URL(p, origin).toString();
  const business = {
    '@type': 'HomeAndConstructionBusiness',
    '@id': absolute('/#business'),
    name: 'Rıza Aydın Dekorasyon',
    url: origin,
    logo: { '@type': 'ImageObject', url: absolute('/icon-512.png'), width: 512, height: 512 },
    image: absolute('/social-card.png'),
    telephone: '+905392044342',
    areaServed: ['İstanbul', 'Kocaeli', 'Çayırova', 'Gebze', 'Darıca', 'Tuzla', 'Pendik'].map(
      (name) => ({ '@type': 'Place', name }),
    ),
    sameAs: ['https://www.instagram.com/riza.dekorasyon/'],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Fayans, boya ve tadilat hizmetleri',
      itemListElement: Object.keys(serviceCopy).map((slug) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: content.serviceTexts[slug].title,
          url: absolute('/hizmetler/' + slug),
        },
      })),
    },
  };
  const graph = [
    business,
    {
      '@type': 'WebSite',
      '@id': absolute('/#website'),
      url: origin,
      name: 'Rıza Aydın Dekorasyon',
      inLanguage: 'tr-TR',
      publisher: { '@id': absolute('/#business') },
    },
  ];
  const segments = path.split('/').filter(Boolean);
  if (segments.length) {
    const labels = {
      hizmetler: 'Hizmetler',
      hakkinda: 'Hakkımızda',
      iletisim: 'İletişim',
      yorumlar: 'Müşteri yorumları',
      'yapilan-isler': 'Yapılan işler',
      'hizmet-bolgeleri': 'Hizmet bölgeleri',
      gizlilik: 'Gizlilik',
    };
    const crumbs = [{ name: 'Ana sayfa', url: absolute('/') }];
    if (segments[0] === 'hizmetler' && segments[1] && serviceCopy[segments[1]]) {
      crumbs.push(
        { name: 'Hizmetler', url: absolute('/hizmetler') },
        { name: content.serviceTexts[segments[1]].title, url: absolute('/' + path) },
      );
      graph.push({
        '@type': 'Service',
        name: content.serviceTexts[segments[1]].title,
        description: content.serviceTexts[segments[1]].summary,
        url: absolute('/' + path),
        provider: { '@id': absolute('/#business') },
        areaServed: ['İstanbul', 'Kocaeli'],
      });
    } else if (segments[0] === 'gonderi') {
      const p = content.posts.find((p) => p.id === segments[1]);
      if (p)
        crumbs.push(
          { name: 'Yapılan işler', url: absolute('/yapilan-isler') },
          { name: p.title, url: absolute('/' + path) },
        );
    } else if (labels[path]) crumbs.push({ name: labels[path], url: absolute('/' + path) });
    if (crumbs.length > 1)
      graph.push({
        '@type': 'BreadcrumbList',
        itemListElement: crumbs.map((c, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: c.name,
          item: c.url,
        })),
      });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}
