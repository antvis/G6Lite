import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const source = path.resolve('playground/dist');
const target = path.resolve('site/out/playground');
const expectedTarget = path.join(path.resolve('site/out'), 'playground');

if (!existsSync(source)) throw new Error('Playground build output is missing');
if (target !== expectedTarget) throw new Error(`Unexpected Playground deploy target: ${target}`);

rmSync(target, { recursive: true, force: true });
mkdirSync(path.dirname(target), { recursive: true });
cpSync(source, target, { recursive: true });
console.log(`Copied Playground to ${target}`);
