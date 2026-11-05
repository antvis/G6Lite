import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const plan = read('maintenance/examples/plan.json');
const catalog = read('demos/catalog.json').filter((item) => item.audiences.includes('site'));
const audited = new Set();
for (const group of plan.groups) {
  const receipt = read('maintenance/examples/' + group.batch.toLowerCase() + '.json');
  if (receipt.batch !== group.batch || receipt.status !== 'passed' || receipt.cases.length !== 3) throw new Error('Incomplete batch: ' + group.batch);
  if (JSON.stringify(receipt.cases.map((item) => item.id)) !== JSON.stringify(group.cases)) throw new Error('Batch membership changed: ' + group.batch);
  for (const item of receipt.cases) {
    const demo = catalog.find((entry) => entry.id === item.id);
    if (!demo || demo.file !== item.file || audited.has(item.id)) throw new Error('Invalid audited identity: ' + item.id);
    if (item.runtime !== 'passed' || item.refresh !== 'passed' || !item.observations?.length) throw new Error('Missing runtime evidence: ' + item.id);
    audited.add(item.id);
  }
}
if (audited.size !== catalog.length || catalog.length !== 51) throw new Error('Incomplete 51-case audit');
console.log(plan.groups.length + ' independent batches cover all ' + audited.size + ' cases exactly once.');
