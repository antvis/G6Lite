import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const root = new URL('../', import.meta.url);
const config = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
const units = { B: 1, KB: 1000, MB: 1000000 };

for (const { path, limit, gzip } of config['limit-size']) {
  const match = /^(\d+(?:\.\d+)?)\s*(B|KB|MB)$/i.exec(limit);
  if (!match) throw new Error(`Invalid size limit: ${limit}`);
  const maximum = Number(match[1]) * units[match[2].toUpperCase()];
  const content = readFileSync(new URL(path, root));
  const bytes = gzip ? gzipSync(content).byteLength : content.byteLength;
  const passed = bytes <= maximum;
  console.log(
    `${passed ? 'PASS' : 'FAIL'} ${path}: ${bytes} bytes${gzip ? ' gzip' : ''} / ${maximum} bytes`,
  );
  if (!passed) process.exitCode = 1;
}
