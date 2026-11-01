import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, cp, writeFile, rm, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { once } from 'node:events';
import { serviceCopy } from '../content/services.mjs';

// Isolated sample data: never publish the local database, sessions or customer records.
const temporary = await mkdtemp(join(tmpdir(), 'riza-preview-'));
const output = resolve('dist-preview');
const port = Number(process.env.PREVIEW_PORT || 43127);
const origin = `http://127.0.0.1:${port}`;
const basePath = (process.env.PREVIEW_BASE_PATH || '').replace(/\/$/, '');
if (basePath && !/^\/[a-zA-Z0-9_-]+$/.test(basePath))
  throw Error('PREVIEW_BASE_PATH tek bir depo yolu olmalıdır.');
const env = {
  ...process.env,
  DATA_DIR: temporary,
  ADMIN_PASSWORD: '',
  INDEXABLE: 'false',
  SITE_URL: origin,
  NEXT_TELEMETRY_DISABLED: '1',
  PORT: String(port),
};
let server;
async function run(command, args) {
  const child = spawn(command, args, { env, stdio: 'inherit' });
  const [code] = await once(child, 'exit');
  if (code !== 0) throw Error(`${command} işlemi başarısız: ${code}`);
}
try {
  await run(process.execPath, ['scripts/seed-examples.mjs']);
  await run(process.execPath, ['node_modules/next/dist/bin/next', 'build']);
  server = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)],
    { env, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let errors = '';
  server.stderr.on('data', (chunk) => {
    errors += chunk;
  });
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw Error('Önizleme sunucusu açılamadı: ' + errors);
    try {
      const r = await fetch(origin);
      if (r.ok) break;
    } catch {}
    if (i === 99) throw Error('Sunucu zamanında açılamadı.');
    await new Promise((r) => setTimeout(r, 100));
  }
  const { DatabaseSync } = await import('node:sqlite');
  const snapshot = new DatabaseSync(join(temporary, 'site.sqlite'), { readOnly: true });
  const posts = snapshot.prepare('SELECT id FROM posts WHERE published=1').all();
  snapshot.close();
  const routes = [
    '/',
    '/hizmetler',
    '/hakkinda',
    '/iletisim',
    '/yapilan-isler',
    '/yorumlar',
    '/hizmet-bolgeleri',
    '/gizlilik',
    ...Object.keys(serviceCopy).map((s) => '/hizmetler/' + s),
    ...posts.map((p) => '/gonderi/' + p.id),
  ];
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await cp('public', output, { recursive: true });
  await cp('.next/static', join(output, '_next/static'), { recursive: true });
  await cp(join(temporary, 'uploads'), join(output, 'media'), { recursive: true });
  function staticHtml(html) {
    let result = html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<link\b[^>]*(?:as="script"|rel="modulepreload")[^>]*>/gi, '');
    result = result.replace(
      /<form\b[^>]*id="review-form"[^>]*>[\s\S]*?<\/form>/gi,
      '<section class="preview-review-contact"><h2>Deneyiminizi paylaşın.</h2><p>Görüşlerinizi ve sorularınızı doğrudan bize iletebilirsiniz.</p><a class="button" href="https://wa.me/905392044342">WhatsApp’tan ulaşın</a></section>',
    );
    if (basePath)
      result = result.replace(
        /(href|src)="\/(?!\/)([^"#]*)"/g,
        (_, attribute, path) => `${attribute}="${basePath}/${path}"`,
      );
    result = result.replaceAll(origin, process.env.PREVIEW_SITE_URL || basePath);
    return result.replace('</body>', `<script src="${basePath}/preview.js" defer></script></body>`);
  }
  for (const route of routes) {
    const response = await fetch(origin + route);
    if (!response.ok) throw Error(`${route}: ${response.status}`);
    const folder = join(output, route.slice(1));
    await mkdir(folder, { recursive: true });
    await writeFile(join(folder, 'index.html'), staticHtml(await response.text()));
  }
  await writeFile(
    join(output, 'preview.js'),
    `const button=document.querySelector('.menu-toggle');const header=document.querySelector('.site-header');if(button&&header){const close=()=>{header.classList.remove('menu-open');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Menüyü aç');};button.addEventListener('click',()=>{const open=header.classList.toggle('menu-open');button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');});document.querySelectorAll('#site-navigation a').forEach(a=>a.addEventListener('click',close));document.addEventListener('pointerdown',e=>{if(!header.contains(e.target))close();});document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();button.focus();}});}`,
  );
  const manifest = await (await fetch(origin + '/manifest.webmanifest')).json();
  if (basePath) {
    manifest.start_url = basePath + '/';
    manifest.icons = manifest.icons.map((icon) => ({ ...icon, src: basePath + icon.src }));
  }
  await writeFile(join(output, 'manifest.webmanifest'), JSON.stringify(manifest));
  await writeFile(join(output, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  await writeFile(join(output, '.nojekyll'), '');
  await writeFile(
    join(output, '404.html'),
    `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="robots" content="noindex"><title>Sayfa bulunamadı</title><body><h1>Sayfa bulunamadı.</h1><a href="${basePath}/">Ana sayfaya dön</a></body></html>`,
  );
  const home = await readFile(join(output, 'index.html'), 'utf8');
  if (home.includes('/api/') || home.includes('self.__next') || !home.includes('noindex'))
    throw Error('Statik çıktı kontrolü başarısız.');
  console.log(
    `Statik arayüz hazır: ${output} (${routes.length} sayfa). Backend, parola veya veritabanı içermez.`,
  );
} finally {
  if (server && server.exitCode === null) {
    server.kill();
    await once(server, 'exit');
  }
  await rm(temporary, { recursive: true, force: true });
}
