import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
const svg = await readFile('public/logo.svg');
for (const size of [32, 48, 96, 180, 192, 512])
  await sharp(svg).resize(size, size).png().toFile(`public/icon-${size}.png`);
// ICO containing a PNG image, supported by modern browsers.
const png = await readFile('public/icon-48.png');
const ico = Buffer.alloc(22);
ico.writeUInt16LE(1, 2);
ico.writeUInt16LE(1, 4);
ico[6] = 48;
ico[7] = 48;
ico.writeUInt16LE(1, 10);
ico.writeUInt16LE(32, 12);
ico.writeUInt32LE(png.length, 14);
ico.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([ico, png]));
const card = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f6f3ec"/><rect x="0" y="0" width="20" height="630" fill="#203b31"/><text x="85" y="165" font-family="sans-serif" font-weight="bold" font-size="35" fill="#203b31">RIZA AYDIN DEKORASYON</text><text x="85" y="285" font-family="sans-serif" font-weight="bold" font-size="60" fill="#203b31">Fayans, boya ve tadilat.</text><text x="85" y="365" font-family="sans-serif" font-size="34" fill="#526256">İstanbul ve Kocaeli · Çayırova merkezli</text><text x="85" y="490" font-family="sans-serif" font-size="28" fill="#203b31">25 yılı aşkın deneyim</text><text x="85" y="545" font-family="sans-serif" font-size="30" fill="#203b31">0539 204 43 42</text></svg>`,
);
await sharp(card)
  .composite([{ input: await sharp(svg).resize(120, 120).toBuffer(), left: 990, top: 90 }])
  .png()
  .toFile('public/social-card.png');
