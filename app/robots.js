export default function robots() {
  const enabled = process.env.INDEXABLE === 'true';
  return {
    rules: {
      userAgent: '*',
      ...(enabled ? { allow: '/', disallow: ['/admin', '/api/'] } : { disallow: '/' }),
    },
    ...(enabled && process.env.SITE_URL
      ? { sitemap: new URL('/sitemap.xml', process.env.SITE_URL).toString() }
      : {}),
  };
}
