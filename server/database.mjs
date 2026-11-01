import { DatabaseSync, backup } from 'node:sqlite';
import { mkdirSync, existsSync, readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { homeCopy, serviceCopy } from '../content/services.mjs';
export const dataDir = resolve(/* turbopackIgnore: true */ process.env.DATA_DIR || 'data');
mkdirSync(dataDir, { recursive: true });
mkdirSync(join(dataDir, 'uploads'), { recursive: true });
export const db = new DatabaseSync(join(dataDir, 'site.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS services(slug TEXT PRIMARY KEY,title TEXT NOT NULL,summary TEXT NOT NULL,text TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS posts(id TEXT PRIMARY KEY,title TEXT NOT NULL,text TEXT NOT NULL,district TEXT NOT NULL,kind TEXT NOT NULL,image TEXT NOT NULL DEFAULT '',published INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS reviews(id TEXT PRIMARY KEY,name TEXT NOT NULL,text TEXT NOT NULL,rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),approved INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,expires_at INTEGER NOT NULL,password_version TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS rate_limits(key TEXT PRIMARY KEY,count INTEGER NOT NULL,expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY AUTOINCREMENT,action TEXT NOT NULL,entity_id TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
export function transaction(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
}
export const id = () => randomBytes(12).toString('hex');
export function audit(action, entity = '') {
  db.prepare('INSERT INTO audit(action,entity_id) VALUES (?,?)').run(action, entity);
}
if (!db.prepare("SELECT value FROM settings WHERE key='initialized'").get())
  transaction(() => {
    const oldFile = join(dataDir, 'content.json');
    const old = existsSync(oldFile) ? JSON.parse(readFileSync(oldFile, 'utf8')) : {};
    const settings = {
      ...homeCopy,
      hours: 'Çalışma saatleri için arayınız.',
      about:
        'Rıza Aydın olarak 25 yılı aşkın süredir fayans, boya ve tadilat işleri yapıyorum. Çayırova merkezli olarak İstanbul ve Kocaeli’de çalışıyor; işin kapsamını, malzeme ihtiyacını ve uygulama sırasını sizinle birlikte belirliyorum.',
      ...Object.fromEntries(
        ['headline', 'intro', 'hours', 'about']
          .filter((k) => typeof old[k] === 'string')
          .map((k) => [k, old[k]]),
      ),
    };
    for (const [key, value] of Object.entries(settings))
      db.prepare('INSERT INTO settings(key,value) VALUES (?,?)').run(key, value);
    for (const [slug, info] of Object.entries(serviceCopy)) {
      const value = old.serviceTexts?.[slug] || info;
      db.prepare('INSERT INTO services VALUES (?,?,?,?)').run(
        slug,
        value.title,
        value.summary,
        value.text,
      );
    }
    for (const p of old.posts || [])
      db.prepare(
        'INSERT INTO posts(id,title,text,district,kind,image,published) VALUES (?,?,?,?,?,?,?)',
      ).run(p.id, p.title, p.text, p.district || '', p.kind, p.image || '', Number(!!p.published));
    for (const r of old.reviews || [])
      db.prepare('INSERT INTO reviews(id,name,text,rating,approved) VALUES (?,?,?,?,?)').run(
        r.id,
        r.name,
        r.text,
        r.rating,
        Number(!!r.approved),
      );
    db.prepare("INSERT INTO settings VALUES ('initialized','1')").run();
    audit('database.initialized');
  });
export function getContent(privateData = false) {
  const settings = Object.fromEntries(
    db
      .prepare("SELECT key,value FROM settings WHERE key!='initialized'")
      .all()
      .map((x) => [x.key, x.value]),
  );
  return {
    ...settings,
    serviceTexts: Object.fromEntries(
      Object.keys(serviceCopy).map((slug) => {
        const { slug: _, ...v } = db.prepare('SELECT * FROM services WHERE slug=?').get(slug);
        return [slug, v];
      }),
    ),
    posts: db
      .prepare(
        `SELECT * FROM posts ${privateData ? '' : 'WHERE published=1'} ORDER BY created_at DESC,rowid DESC`,
      )
      .all()
      .map((p) => ({ ...p, published: !!p.published })),
    reviews: db
      .prepare(
        `SELECT * FROM reviews ${privateData ? '' : 'WHERE approved=1'} ORDER BY created_at DESC,rowid DESC`,
      )
      .all()
      .map((r) => ({ ...r, approved: !!r.approved })),
  };
}
export const tokenHash = (token) => createHash('sha256').update(token).digest('hex');
export function limit(key, max, windowMs) {
  return transaction(() => {
    const now = Date.now();
    db.prepare('DELETE FROM rate_limits WHERE expires_at<?').run(now);
    const row = db.prepare('SELECT * FROM rate_limits WHERE key=?').get(key);
    if (row && row.count >= max) return false;
    db.prepare(
      'INSERT INTO rate_limits(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1',
    ).run(key, now + windowMs);
    return true;
  });
}
export async function backupDatabase(destination) {
  return backup(db, destination);
}
