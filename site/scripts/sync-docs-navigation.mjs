import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'docs-navigation.json'), 'utf8'));
const refs = [manifest.overview];
const groups = new Map();
function visit(entry) {
  if (typeof entry === 'string') { refs.push(entry); return; }
  if (entry.page) { refs.push(entry.page); groups.set(entry.page, entry.title); }
  entry.children.forEach(visit);
}
manifest.order.forEach((id) => manifest.sections[id].children.forEach(visit));
if (new Set(refs).size !== refs.length) throw new Error('Duplicate page in navigation manifest');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'demos/catalog.json'), 'utf8'));
const external = manifest.externalCollections.flatMap((group) => [
  group.directory + '/index',
  ...catalog.filter((item) => item.audiences.includes('site')).map((item) => group.directory + '/' + item.id),
]);
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) =>
    item.isDirectory() ? files(path.join(dir, item.name)) : item.name.endsWith('.mdx') ? [path.join(dir, item.name)] : []);
}
const output = {};
for (const locale of ['zh', 'en']) {
  const base = path.join(root, 'content/docs', locale);
  const actual = files(base).map((file) => path.relative(base, file).slice(0, -4)).sort();
  const expected = [...refs, ...external].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error('Page coverage mismatch (' + locale + '): ' + JSON.stringify({
      unlisted: actual.filter((ref) => !expected.includes(ref)),
      missing: expected.filter((ref) => !actual.includes(ref)),
    }));
  }
  const dirs = new Map();
  for (const ref of [...refs, ...external]) {
    const parts = ref.split('/');
    for (let i = 0; i < parts.length; i++) {
      const directory = parts.slice(0, i).join('/');
      const children = dirs.get(directory) ?? [];
      if (!children.includes(parts[i])) children.push(parts[i]);
      dirs.set(directory, children);
    }
  }
  for (const [directory, pages] of dirs) {
    let title;
    const physicalSection = manifest.physicalSections[directory];
    const collection = manifest.externalCollections.find((item) => item.directory === directory);
    if (!directory) title = manifest.rootTitle[locale];
    else if (physicalSection) title = manifest.sections[physicalSection].title[locale];
    else if (collection) title = collection.title[locale];
    else {
      const file = path.join(base, directory + '.mdx');
      const text = fs.readFileSync(file, 'utf8');
      title = /^title: (.+)$/m.exec(text)?.[1]?.replace(/^["']|["']$/g, '');
      if (!title) throw new Error('Missing folder title: ' + directory);
    }
    const target = path.join(base, directory, 'meta.json');
    output[path.relative(path.dirname(root), target)] = JSON.stringify({ title, ...(refs.includes(directory) ? { pagesIndex: '../' + path.basename(directory) + '.mdx' } : {}), pages }, null, 2) + '\n';
  }
}
if (process.argv.includes('--print')) {
  process.stdout.write(JSON.stringify(output)); 
} else {
  const drift = Object.entries(output).filter(([relative, body]) => {
    const target = path.join(path.dirname(root), relative);
    return !fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== body;
  });
  if (process.argv.includes('--check')) {
    if (drift.length) throw new Error('Run npm run docs:nav to update: ' + drift.map(([name]) => name).join(', '));
  } else {
    for (const [relative, body] of drift) fs.writeFileSync(path.join(path.dirname(root), relative), body);
  }
  console.log('Navigation and metadata cover ' + refs.length + ' docs + ' + external.length + ' example pages in both languages.');
}
