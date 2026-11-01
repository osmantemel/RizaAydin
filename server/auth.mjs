import { scryptSync, timingSafeEqual, randomBytes } from 'node:crypto';
import { db, tokenHash } from './database.mjs';
export function passwordReady() {
  return (process.env.ADMIN_PASSWORD || '').length >= 12;
}
export function verifyPassword(value) {
  if (!passwordReady()) return false;
  return timingSafeEqual(
    scryptSync(String(value), 'riza-admin-password-v1', 64),
    scryptSync(process.env.ADMIN_PASSWORD, 'riza-admin-password-v1', 64),
  );
}
function version() {
  return tokenHash(process.env.ADMIN_PASSWORD || '');
}
export function sessionToken(req) {
  return (
    (req.headers.get('cookie') || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith('session='))
      ?.slice(8) || ''
  );
}
export function authenticated(req) {
  const token = sessionToken(req);
  if (!/^[a-f0-9]{64}$/.test(token)) return false;
  const session = db.prepare('SELECT * FROM sessions WHERE token_hash=?').get(tokenHash(token));
  return !!session && session.expires_at > Date.now() && session.password_version === version();
}
export function createSession() {
  db.prepare('DELETE FROM sessions WHERE expires_at<? OR password_version!=?').run(
    Date.now(),
    version(),
  );
  const token = randomBytes(32).toString('hex');
  db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(
    tokenHash(token),
    Date.now() + 8 * 3600000,
    version(),
  );
  return token;
}
export function destroySession(req) {
  db.prepare('DELETE FROM sessions WHERE token_hash=?').run(tokenHash(sessionToken(req)));
}
export function sessionCookie(value, expired = false) {
  return `session=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${expired ? 0 : 28800}${process.env.SITE_URL?.startsWith('https:') ? '; Secure' : ''}`;
}
