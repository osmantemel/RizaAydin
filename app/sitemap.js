import { getContent } from '../server/database.mjs';
import { serviceCopy } from '../content/services.mjs';
export const dynamic = 'force-dynamic';
export default function sitemap() {
  if (process.env.INDEXABLE !== 'true' || !process.env.SITE_URL) return [];
  return [
    '',
    'hizmetler',
    'hakkinda',
    'iletisim',
    'yorumlar',
    'yapilan-isler',
    'hizmet-bolgeleri',
    'gizlilik',
    ...Object.keys(serviceCopy).map((s) => 'hizmetler/' + s),
    ...getContent().posts.map((p) => 'gonderi/' + p.id),
  ].map((path) => ({ url: new URL('/' + path, process.env.SITE_URL).toString() }));
}
