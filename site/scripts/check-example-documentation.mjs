import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePath = path.join(root, 'src/lib/site-examples.ts');
const text = fs.readFileSync(sourcePath, 'utf8');
const source = ts.createSourceFile(sourcePath, text, ts.ScriptTarget.Latest, true);
let initializer;
function visit(node) {
  if (ts.isVariableDeclaration(node) && node.name.getText(source) === 'exampleDefinitions') initializer = node.initializer;
  ts.forEachChild(node, visit);
}
visit(source);
if (!initializer || !ts.isArrayLiteralExpression(initializer)) throw new Error('Expected literal example definitions');
const definitions = vm.runInNewContext('(' + initializer.getText(source) + ')');
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'example-documentation.json'), 'utf8'));
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'demos/catalog.json'), 'utf8')).filter((e) => e.audiences.includes('site'));
const ids = definitions.map((e) => e.id);
if (new Set(ids).size !== ids.length || JSON.stringify([...ids].sort()) !== JSON.stringify(catalog.map((e) => e.id).sort())) throw new Error('Example catalog identity mismatch');
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const matrix = [];
for (const example of definitions) {
  const docs = example.documentation ?? mapping.examples[example.id]?.map((id) => mapping.topics[id]);
  if (!docs?.length || docs.some((d) => !d)) throw new Error('Missing documentation: ' + example.id);
  if (!fs.existsSync(path.join(root, 'demos', example.file))) throw new Error('Missing runtime source: ' + example.id);
  for (const locale of ['zh', 'en']) {
    for (const field of ['title', 'description', 'interaction', 'dataDescription']) {
      if (!example[field]?.[locale]?.trim()) throw new Error('Missing ' + field + ': ' + example.id + ' ' + locale);
    }
    const prefix = locale === 'zh' ? '' : '/en';
    const html = fs.readFileSync(path.join(root, 'out', (prefix + '/docs/examples/' + example.id + '.html').slice(1)), 'utf8');
    const markdown = fs.readFileSync(path.join(root, 'out', (prefix + '/llms.mdx/docs/examples/' + example.id + '/content.md').slice(1)), 'utf8');
    const runtimeSource = fs.readFileSync(path.join(root, 'demos', example.file), 'utf8').replace(/\r\n/g, '\n').trim();
    const llm = fs.readFileSync(path.join(root, 'out', prefix.slice(1), 'llms-full.txt'), 'utf8');
    const flight = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].flatMap((match) => {
      const payload = /^self\.__next_f\.push\((.*)\)$/.exec(match[1].trim());
      if (!payload) return [];
      const chunk = JSON.parse(payload[1]);
      return typeof chunk[1] === 'string' ? [chunk[1]] : [];
    }).join('');
    const inlineSources = [...flight.matchAll(/"initialSource":("(?:[^"\\]|\\.)*")/g)].map((match) => JSON.parse(match[1]));
    if (!flight.includes(runtimeSource) && !inlineSources.some((code) => code.includes(runtimeSource))) throw new Error('Editor source mismatch: ' + example.id + ' ' + locale);
    if (!markdown.includes(runtimeSource) || !llm.includes(runtimeSource) || markdown.includes('<ExampleDetail')) throw new Error('Incomplete source export: ' + example.id + ' ' + locale);
    let reverse = false;
    for (const doc of docs) {
      const ref = doc.href.split('#')[0].replace('/docs/', '');
      const sourceFile = path.join(root, 'content/docs', locale, ref + '.mdx');
      if (!fs.existsSync(sourceFile)) throw new Error('Missing topic: ' + doc.href);
      const url = base + prefix + doc.href.split('#')[0];
      if (!html.includes('href="' + url) || !markdown.includes(url)) throw new Error('Missing rendered/exported topic link: ' + example.id + ' → ' + url);
      if (fs.readFileSync(sourceFile, 'utf8').includes('/docs/examples/' + example.id + ')')) reverse = true;
    }
    if (!reverse) throw new Error('Missing reverse link: ' + example.id + ' ' + locale);
  }
  matrix.push({ id: example.id, file: example.file, category: example.category, bilingualFields: true, documentation: docs.map((d) => d.href), reverseLinks: true, htmlAndMarkdown: true, visualScope: 'Existing runtime; representative cases are browser-checked separately' });
}
if (process.argv.includes('--json')) console.log(JSON.stringify(matrix, null, 2));
else console.log(matrix.length + ' example identities, bilingual descriptions, links and exact editor/Markdown/LLM runtime sources verified.');
