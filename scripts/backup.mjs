import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { backupDatabase } from '../server/database.mjs';
await mkdir('backups', { recursive: true });
const output = resolve(
  'backups/site-' + new Date().toISOString().replace(/[:.]/g, '-') + '.sqlite',
);
await backupDatabase(output);
console.log('Veritabanı yedeği: ' + output);
console.log('Fotoğraflar için data/uploads klasörünü de yedekleyin.');
