import { z } from 'zod';
import sharp from 'sharp';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { db, id, limit, transaction, audit, getContent, dataDir, tokenHash } from './database.mjs';
import {
  authenticated,
  passwordReady,
  verifyPassword,
  createSession,
  sessionCookie,
  destroySession,
} from './auth.mjs';
import {
  entityId,
  settingsSchema,
  postSchema,
  reviewSchema,
  serviceSchema,
} from './validation.mjs';
import { serviceCopy } from '../content/services.mjs';
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function response(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}
async function body(req, max = 100000) {
  const reader = req.body?.getReader();
  if (!reader) throw new ApiError(400, 'İstek içeriği gerekli.');
  let size = 0,
    chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > max) {
      await reader.cancel();
      throw new ApiError(413, 'İçerik çok büyük.');
    }
    chunks.push(Buffer.from(value));
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch {
    throw new ApiError(400, 'Geçersiz istek içeriği.');
  }
}
function originCheck(req) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (!origin || new URL(origin).host !== host) throw new ApiError(403, 'Geçersiz istek kaynağı.');
}
function client(req) {
  const forwarded =
    process.env.TRUST_PROXY === 'true'
      ? (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
      : '';
  return tokenHash(forwarded || 'shared-local-network');
}
export async function handle(req, path) {
  try {
    if (req.method === 'POST') originCheck(req);
    if (path === 'login' && req.method === 'POST') {
      if (!limit('login:' + client(req), 10, 15 * 60000))
        throw new ApiError(429, 'Çok fazla deneme. 15 dakika sonra deneyin.');
      if (!passwordReady()) throw new ApiError(503, 'Yönetici şifresi yapılandırılmamış.');
      const b = z.object({ password: z.string().max(256) }).parse(await body(req));
      if (!verifyPassword(b.password)) throw new ApiError(401, 'Şifre hatalı.');
      const token = createSession();
      audit('session.login');
      return response({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) });
    }
    if (path === 'logout' && req.method === 'POST') {
      destroySession(req);
      return response({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', true) });
    }
    if (path === 'reviews' && req.method === 'POST') {
      const raw = await body(req);
      if (raw.website) return response({ ok: true });
      const b = reviewSchema.parse(raw);
      if (!limit('review:' + client(req), 3, 15 * 60000))
        throw new ApiError(429, 'Yorum göndermek için biraz bekleyin.');
      db.prepare('INSERT INTO reviews(id,name,text,rating) VALUES (?,?,?,?)').run(
        id(),
        b.name,
        b.text,
        b.rating,
      );
      return response({ ok: true }, 201);
    }
    if (path === 'admin' || path === 'admin/upload') {
      if (!authenticated(req)) throw new ApiError(401, 'Oturum açmanız gerekiyor.');
      if (path === 'admin/upload' && req.method === 'POST') {
        const size = Number(req.headers.get('content-length') || 0);
        if (size > 5 * 1024 * 1024) throw new ApiError(413, 'Fotoğraf en fazla 4 MB olabilir.');
        const reader = req.body?.getReader();
        let chunks = [],
          total = 0;
        if (!reader) throw new ApiError(400, 'Fotoğraf seçin.');
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          total += value.length;
          if (total > 4 * 1024 * 1024) {
            await reader.cancel();
            throw new ApiError(413, 'Fotoğraf en fazla 4 MB olabilir.');
          }
          chunks.push(Buffer.from(value));
        }
        const input = Buffer.concat(chunks);
        let output;
        try {
          const meta = await sharp(input, { limitInputPixels: 40000000 }).metadata();
          if (!['jpeg', 'png', 'webp'].includes(meta.format)) throw Error();
          output = await sharp(input, { limitInputPixels: 40000000 })
            .rotate()
            .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82 })
            .toBuffer();
        } catch {
          throw new ApiError(400, 'Geçerli bir JPEG, PNG veya WebP fotoğraf seçin.');
        }
        const name = randomBytes(16).toString('hex') + '.webp';
        await writeFile(join(dataDir, 'uploads', name), output, { flag: 'wx' });
        audit('media.upload', name);
        return response({ url: '/media/' + name }, 201);
      }
      if (req.method === 'GET' && path === 'admin') return response(getContent(true));
      if (req.method !== 'POST' || path !== 'admin')
        throw new ApiError(405, 'Desteklenmeyen yöntem.');
      const b = await body(req);
      transaction(() => {
        switch (b.action) {
          case 'settings': {
            const v = settingsSchema.parse(b);
            for (const key of ['headline', 'intro', 'hours', 'about'])
              db.prepare(
                'INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
              ).run(key, v[key]);
            break;
          }
          case 'services': {
            const entries = Object.keys(serviceCopy).map((slug) => [
              slug,
              serviceSchema.parse(b.services?.[slug]),
            ]);
            for (const [slug, v] of entries)
              db.prepare('UPDATE services SET title=?,summary=?,text=? WHERE slug=?').run(
                v.title,
                v.summary,
                v.text,
                slug,
              );
            break;
          }
          case 'post': {
            const v = postSchema.parse(b);
            const postId = v.id || id();
            if (v.image && !existsMedia(v.image))
              throw new ApiError(400, 'Yüklenen fotoğraf bulunamadı.');
            if (v.id && !db.prepare('SELECT id FROM posts WHERE id=?').get(v.id))
              throw new ApiError(404, 'Paylaşım bulunamadı.');
            db.prepare(
              `INSERT INTO posts(id,title,text,district,kind,image,published) VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title,text=excluded.text,district=excluded.district,kind=excluded.kind,image=excluded.image,published=excluded.published,updated_at=CURRENT_TIMESTAMP`,
            ).run(postId, v.title, v.text, v.district, v.kind, v.image, Number(v.published));
            break;
          }
          case 'delete-post': {
            const key = entityId.parse(b.id);
            db.prepare('DELETE FROM posts WHERE id=?').run(key);
            break;
          }
          case 'review': {
            const v = z.object({ id: entityId, approved: z.boolean() }).parse(b);
            db.prepare('UPDATE reviews SET approved=? WHERE id=?').run(Number(v.approved), v.id);
            break;
          }
          case 'delete-review':
            db.prepare('DELETE FROM reviews WHERE id=?').run(entityId.parse(b.id));
            break;
          default:
            throw new ApiError(400, 'İşlem bulunamadı.');
        }
        audit('content.' + b.action, typeof b.id === 'string' ? b.id : '');
      });
      return response({ ok: true });
    }
    throw new ApiError(404, 'İşlem bulunamadı.');
  } catch (e) {
    if (e instanceof z.ZodError)
      return response({ error: 'Alanları kontrol edin.', fields: e.flatten().fieldErrors }, 400);
    if (e instanceof ApiError) return response({ error: e.message }, e.status);
    console.error('API operation failed', e);
    return response({ error: 'İşlem tamamlanamadı. Lütfen tekrar deneyin.' }, 500);
  }
}
import { existsSync } from 'node:fs';
function existsMedia(url) {
  return existsSync(join(dataDir, 'uploads', url.split('/').pop()));
}
export async function media(name) {
  if (!/^[a-f0-9]{32}\.webp$/.test(name)) return new Response(null, { status: 404 });
  try {
    return new Response(await readFile(join(dataDir, 'uploads', name)), {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public,max-age=31536000,immutable',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 404 });
  }
}
