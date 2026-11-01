import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';

test('Veritabanı, güvenli oturum, içerik, görsel yükleme, yorum onayı ve yedekleme', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'riza-db-'));
  process.env.DATA_DIR = dir;
  process.env.ADMIN_PASSWORD = 'test-password-123';
  // Exercise automatic migration without changing real data.
  await writeFile(
    join(dir, 'content.json'),
    JSON.stringify({
      headline: 'Korunan başlık',
      intro: 'Korunan açıklama',
      hours: '09:00–18:00',
      posts: [],
      reviews: [],
    }),
  );
  const { handle, media } = await import('../server/api.mjs');
  const { getContent, db, backupDatabase } = await import('../server/database.mjs');
  let cookie = '';
  const base = 'http://localhost:3000';
  const call = async (path, data, options = {}) => {
    const headers = {
      host: 'localhost:3000',
      origin: base,
      ...(cookie ? { cookie } : {}),
      ...options.headers,
    };
    const req = new Request(base + '/api/' + path, {
      method: data ? 'POST' : 'GET',
      headers: { ...headers, ...(data ? { 'content-type': 'application/json' } : {}) },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    return handle(req, path);
  };
  try {
    assert.equal(getContent().headline, 'Korunan başlık');
    assert.equal((await call('admin')).status, 401);
    assert.equal((await call('login', { password: 'bad' })).status, 401);
    const login = await call('login', { password: 'test-password-123' });
    assert.equal(login.status, 200);
    assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
    cookie = login.headers.get('set-cookie').split(';')[0];
    const token = cookie.slice('session='.length);
    assert.notEqual(db.prepare('SELECT token_hash FROM sessions').get().token_hash, token);
    assert.equal((await call('admin', null)).status, 200);
    assert.equal(
      (
        await call(
          'admin',
          {
            action: 'settings',
            headline: 'Yeni başlık',
            intro: 'Güncellenen tanıtım',
            hours: 'Randevu ile',
            about: 'Hakkımızda metni',
          },
          { headers: { origin: 'https://evil.example' } },
        )
      ).status,
      403,
    );
    assert.equal(
      (
        await call('admin', {
          action: 'settings',
          headline: 'Yeni başlık',
          intro: 'Güncellenen tanıtım',
          hours: 'Randevu ile',
          about: 'Hakkımızda metni',
        })
      ).status,
      200,
    );
    assert.equal(getContent().headline, 'Yeni başlık');
    assert.equal(
      (
        await call('admin', {
          action: 'post',
          title: 'Bozuk gönderi',
          text: 'metin',
          district: 'Çayırova',
          kind: 'Yapılan iş',
          image: 'javascript:alert(1)',
          published: true,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call('admin', {
          action: 'post',
          title: 'Taslak iş',
          text: 'Test açıklaması',
          district: 'Çayırova',
          kind: 'Yapılan iş',
          image: '',
          published: false,
        })
      ).status,
      200,
    );
    assert.equal(getContent().posts.length, 0);
    let post = getContent(true).posts[0];
    assert.equal((await call('admin', { action: 'post', ...post, published: true })).status, 200);
    assert.equal(getContent().posts.length, 1);
    const image = await sharp({
      create: { width: 2, height: 2, channels: 3, background: '#203b31' },
    })
      .png()
      .toBuffer();
    const upload = await handle(
      new Request(base + '/api/admin/upload', {
        method: 'POST',
        headers: { host: 'localhost:3000', origin: base, cookie },
        body: image,
      }),
      'admin/upload',
    );
    assert.equal(upload.status, 201);
    const url = (await upload.json()).url;
    const imageResponse = await media(url.split('/').pop());
    assert.equal(imageResponse.status, 200);
    assert.equal(imageResponse.headers.get('content-type'), 'image/webp');
    assert.equal((await media('../site.sqlite')).status, 404);
    const invalid = await handle(
      new Request(base + '/api/admin/upload', {
        method: 'POST',
        headers: { host: 'localhost:3000', origin: base, cookie },
        body: 'not an image',
      }),
      'admin/upload',
    );
    assert.equal(invalid.status, 400);
    assert.equal(
      (
        await call('reviews', {
          name: 'Test kişi',
          text: 'Test müşteri yorumu.',
          rating: 5,
          consent: false,
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await call('reviews', {
          name: 'Test kişi',
          text: 'Test müşteri yorumu.',
          rating: 5,
          consent: true,
        })
      ).status,
      201,
    );
    assert.equal(getContent().reviews.length, 0);
    const review = getContent(true).reviews[0];
    assert.equal(
      (await call('admin', { action: 'review', id: review.id, approved: true })).status,
      200,
    );
    assert.equal(getContent().reviews.length, 1);
    const savedSession = cookie;
    await call('logout', {});
    assert.equal((await call('admin')).status, 401);
    cookie = savedSession;
    const backupPath = join(dir, 'backup.sqlite');
    await backupDatabase(backupPath);
    const snapshot = new DatabaseSync(backupPath, { readOnly: true });
    assert.equal(snapshot.prepare('SELECT count(*) n FROM posts').get().n, 1);
    assert.equal(
      snapshot.prepare('SELECT value FROM settings WHERE key=?').get('headline').value,
      'Yeni başlık',
    );
    snapshot.close();
    for (let i = 0; i < 10; i++) await call('login', { password: 'bad' });
    assert.equal((await call('login', { password: 'bad' })).status, 429);
  } finally {
    db.close();
    await rm(dir, { recursive: true, force: true });
  }
});
