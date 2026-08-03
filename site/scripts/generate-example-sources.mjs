import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { codeToHtml } from 'shiki';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = path.resolve(siteRoot, '..');
const catalog = JSON.parse(
  await readFile(path.join(repositoryRoot, 'playground/demos/catalog.json'), 'utf8'),
);
const examples = catalog.filter((entry) => entry.audiences.includes('site'));
const outputDirectory = path.join(siteRoot, 'public/example-sources');

await mkdir(outputDirectory, { recursive: true });

for (const example of examples) {
  const sourcePath = path.join(repositoryRoot, 'playground/demos', example.file);
  const source = await readFile(sourcePath, 'utf8');
  const publicSource = source
    .replace(
      /from\s+(['"])\.\.\/\.\.\/src\/index\.ts\1/g,
      "from '@antv/g6-lite'",
    )
    .replace(
      /from\s+(['"])\.\.\/\.\.\/src\/layout\/optional\/([a-z0-9-]+)\.ts\1/g,
      (_match, _quote, layout) => `from '@antv/g6-lite/layouts/${layout}'`,
    )
    .replace(/\r\n/g, '\n')
    .trim();

  const helperNote = /from\s+['"]\.\//.test(publicSource)
    ? '// Local presentation helpers in this repository are used only for the example controls.\n'
    : '';
  const generated = `${helperNote}${publicSource}\n`;
  const highlightedSource = generated.endsWith('\n') ? generated.slice(0, -1) : generated;
  const highlighted = await codeToHtml(highlightedSource, {
    lang: 'ts',
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });

  await writeFile(path.join(outputDirectory, `${example.id}.txt`), generated, 'utf8');
  await writeFile(path.join(outputDirectory, `${example.id}.highlighted.txt`), highlighted, 'utf8');
}

console.log(`Generated ${examples.length} website example source and highlighted text files.`);
