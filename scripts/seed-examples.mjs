import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { db, dataDir, id, transaction, audit } from '../server/database.mjs';
const examples = [
  {
    title: 'Banyo seramik yenileme · Örnek çalışma',
    district: 'Çayırova',
    kind: 'Yapılan iş',
    text: 'Örnek içerik: Banyo duvar ve zemin kaplamalarının yenilenmesine yönelik uygulama sunumu. Gerçek işin fotoğrafları, uygulama detayları ve kullanılan malzemeler bu alana eklenecek. Bu paylaşım tamamlanmış bir müşteri işi veya referansı değildir.',
    color: '#aeb7a2',
    label: 'BANYO & SERAMİK',
    shape: 'tile',
  },
  {
    title: 'İç cephe boya uygulaması · Örnek çalışma',
    district: 'İstanbul',
    kind: 'Yapılan iş',
    text: 'Örnek içerik: İç mekân duvar ve tavan boyası için hazırlanmış uygulama sunumu. Gerçek çalışmaya ait yüzey hazırlığı, renk seçimi ve uygulama fotoğraflarını daha sonra yönetim panelinden ekleyebilirsiniz. Bu paylaşım tamamlanmış bir müşteri işi veya referansı değildir.',
    color: '#d8c4a6',
    label: 'BOYA & BADANA',
    shape: 'paint',
  },
  {
    title: 'Duvar tamiri ve yenileme · Örnek çalışma',
    district: 'Kocaeli',
    kind: 'Yapılan iş',
    text: 'Örnek içerik: Duvar yüzeyi onarımı ve yenileme işlerini tanıtmak için hazırlanmıştır. Gerçek işin kapsamı, ilçe bilgisi ve öncesi/sonrası fotoğrafları daha sonra değiştirilebilir. Bu paylaşım tamamlanmış bir müşteri işi veya referansı değildir.',
    color: '#a5b7b1',
    label: 'DUVAR & TADİLAT',
    shape: 'wall',
  },
];
const records = [];
for (const p of examples) {
  const shape =
    p.shape === 'tile'
      ? '<rect x="410" y="110" width="280" height="220" rx="8" fill="none" stroke="#f6f3ec" stroke-width="5"/><path d="M410 220h280M550 110v220" stroke="#f6f3ec" stroke-width="5"/>'
      : p.shape === 'paint'
        ? '<rect x="420" y="115" width="230" height="80" rx="12" fill="none" stroke="#f6f3ec" stroke-width="5"/><path d="M650 155h35v85H535v40" fill="none" stroke="#f6f3ec" stroke-width="5"/><rect x="515" y="280" width="40" height="65" rx="8" fill="#f6f3ec"/>'
        : '<path d="M410 115h280v220H410zM410 190h280M410 265h280M500 115v75M600 190v75M500 265v70" fill="none" stroke="#f6f3ec" stroke-width="5"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="660"><rect width="1000" height="660" fill="${p.color}"/><rect x="0" y="410" width="1000" height="250" fill="#203b31"/>${shape}<text x="60" y="475" font-family="sans-serif" fill="#d7e4a6" font-size="18" letter-spacing="3">RIZA AYDIN DEKORASYON</text><text x="60" y="540" font-family="sans-serif" fill="#f6f3ec" font-size="34">${p.label.replaceAll('&', '&amp;')}</text><text x="60" y="605" font-family="sans-serif" fill="#f6f3ec" font-size="19">Örnek çalışma · Temsili çizim</text></svg>`;
  const name = id() + id().slice(0, 8) + '.webp';
  await writeFile(
    join(dataDir, 'uploads', name),
    await sharp(Buffer.from(svg)).webp({ quality: 85 }).toBuffer(),
  );
  records.push({ ...p, image: '/media/' + name });
}
transaction(() => {
  for (const p of records) {
    if (!db.prepare('SELECT id FROM posts WHERE title=?').get(p.title))
      db.prepare(
        'INSERT INTO posts(id,title,text,district,kind,image,published) VALUES (?,?,?,?,?,?,1)',
      ).run(id(), p.title, p.text, p.district, p.kind, p.image);
  }
  for (const [name, text] of [
    [
      'Osman T.',
      'Örnek metin: İş öncesindeki bilgilendirme ve uygulama sürecinden memnun kaldık. Bu metin gerçek bir müşteri yorumu değildir.',
    ],
    [
      'Ayşe K.',
      'Örnek metin: Boya ve yüzey hazırlığı detaylarını birlikte planladık. Bu metin gerçek bir müşteri yorumu değildir.',
    ],
    [
      'Mehmet Y.',
      'Örnek metin: Fayans yenileme ihtiyacımızı ve malzeme seçeneklerini görüştük. Bu metin gerçek bir müşteri yorumu değildir.',
    ],
  ])
    if (!db.prepare('SELECT id FROM reviews WHERE name=?').get(name))
      db.prepare('INSERT INTO reviews(id,name,text,rating,approved) VALUES (?,?,?,?,1)').run(
        id(),
        name,
        text,
        5,
      );
  audit('examples.created');
});
console.log('Üç örnek çalışma ve üç açıkça etiketlenmiş örnek yorum eklendi.');
db.close();
