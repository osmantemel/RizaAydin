import { test } from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { structuredData, siteOrigin } from '../lib/seo.mjs';
import { serviceCopy } from '../content/services.mjs';
test('Yayın SEO verileri, bölge ve hizmet ilişkileri, ikon boyutları', async () => {
  const previous = { INDEXABLE: process.env.INDEXABLE, SITE_URL: process.env.SITE_URL };
  try {
    const content = { serviceTexts: serviceCopy, posts: [] };
    process.env.INDEXABLE = 'false';
    assert.equal(structuredData('', content), null);
    process.env.INDEXABLE = 'true';
    process.env.SITE_URL = 'https://example.com';
    assert.equal(siteOrigin(), 'https://example.com');
    const data = structuredData('hizmetler/fayans-seramik', content);
    assert.equal(data['@graph'][0].telephone, '+905392044342');
    assert.equal(data['@graph'][0].address, undefined);
    assert.ok(data['@graph'][0].areaServed.some((p) => p.name === 'İstanbul'));
    assert.ok(data['@graph'][0].areaServed.some((p) => p.name === 'Kocaeli'));
    assert.equal(
      data['@graph'].find((p) => p['@type'] === 'Service').url,
      'https://example.com/hizmetler/fayans-seramik',
    );
    assert.equal(
      data['@graph'].find((p) => p['@type'] === 'BreadcrumbList').itemListElement.length,
      3,
    );
    for (const size of [48, 96, 180, 192, 512]) {
      const m = await sharp(`public/icon-${size}.png`).metadata();
      assert.equal(m.width, size);
      assert.equal(m.height, size);
    }
    const card = await sharp('public/social-card.png').metadata();
    assert.equal(card.width, 1200);
    assert.equal(card.height, 630);
  } finally {
    for (const [key, v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[key];
      else process.env[key] = v;
    }
  }
});
