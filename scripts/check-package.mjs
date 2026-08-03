import { access, readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const packageRoot = fileURLToPath(new URL('../', import.meta.url));

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? collectFiles(path) : [path];
    }),
  );

  return files.flat();
}

function collectRelativeModuleSpecifiers(source, filePath) {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  const specifiers = [];

  function addSpecifier(literal) {
    if (literal && ts.isStringLiteralLike(literal) && /^\.{1,2}\//.test(literal.text)) {
      specifiers.push(literal.text);
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addSpecifier(node.moduleSpecifier);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      addSpecifier(node.arguments[0]);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      addSpecifier(node.argument.literal);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return specifiers;
}

async function assertModuleSpecifierStyle(directory, includeFile, isValid, expectation) {
  const files = (await collectFiles(directory)).filter(includeFile).sort();
  const violations = [];

  for (const filePath of files) {
    const source = await readFile(filePath, 'utf8');
    for (const specifier of collectRelativeModuleSpecifiers(source, filePath)) {
      if (!isValid(specifier)) {
        violations.push(`${filePath.replace(`${packageRoot}/`, '')}: ${specifier}`);
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(`${expectation}:\n${violations.join('\n')}`);
  }
}

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const rootExport = packageJson.exports?.['.'];
const publicExportPaths = Object.keys(packageJson.exports ?? {}).sort();
const publishedDirectories = [...(packageJson.files ?? [])].sort();

if (
  packageJson.type !== 'module' ||
  packageJson.main !== 'dist/index.js' ||
  packageJson.module !== 'dist/index.js' ||
  rootExport?.import !== './dist/index.js' ||
  Object.hasOwn(rootExport ?? {}, 'require')
) {
  throw new Error('Package root must expose dist/index.js as ESM-only');
}

if (JSON.stringify(publicExportPaths) !== JSON.stringify(['.'])) {
  throw new Error(`Unexpected package export paths: ${publicExportPaths.join(', ')}`);
}

if (JSON.stringify(publishedDirectories) !== JSON.stringify(['dist', 'src'])) {
  throw new Error('Package files must publish both dist and src');
}

await assertModuleSpecifierStyle(
  resolve(packageRoot, 'src'),
  (filePath) => filePath.endsWith('.ts'),
  (specifier) => !specifier.endsWith('.js'),
  'Source relative module specifiers must not include .js extensions',
);

await assertModuleSpecifierStyle(
  resolve(packageRoot, 'dist'),
  (filePath) => filePath.endsWith('.js') || filePath.endsWith('.d.ts'),
  (specifier) => specifier.endsWith('.js'),
  'Emitted relative module specifiers must include .js extensions',
);

// Resolve through package.json#exports so this exercises the published root entry.
const publicApi = await import('@antv/g6-lite');
const expectedRuntimeExports = [
  'BaseNode',
  'BreathingNode',
  'EventEmitter',
  'Graph',
  'extensionFactory',
  'register',
  'registerNode',
  'resolveTheme',
  'runLayout',
];
const actualRuntimeExports = Object.keys(publicApi).sort();

if (JSON.stringify(actualRuntimeExports) !== JSON.stringify(expectedRuntimeExports)) {
  throw new Error(
    `Public runtime exports changed:\nexpected ${expectedRuntimeExports.join(
      ', ',
    )}\nactual   ${actualRuntimeExports.join(', ')}`,
  );
}

await access(new URL('../dist/layout/layoutWorker.js', import.meta.url));
await access(new URL('../src/index.ts', import.meta.url));
