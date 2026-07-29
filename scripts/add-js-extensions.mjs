import { access, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url));

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

function collectRelativeModuleLiterals(source, filePath) {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  const literals = [];

  function addLiteral(literal) {
    if (literal && ts.isStringLiteralLike(literal) && /^\.{1,2}\//.test(literal.text)) {
      literals.push(literal);
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addLiteral(node.moduleSpecifier);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
      addLiteral(node.arguments[0]);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      addLiteral(node.argument.literal);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return literals;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveSpecifier(filePath, specifier) {
  const target = resolve(dirname(filePath), specifier);

  if (await exists(`${target}.js`)) {
    return `${specifier}.js`;
  }
  if (await exists(resolve(target, 'index.js'))) {
    return `${specifier.replace(/\/$/, '')}/index.js`;
  }

  throw new Error(`Cannot resolve emitted module '${specifier}' from ${filePath}`);
}

async function addJsExtensions(filePath) {
  const source = await readFile(filePath, 'utf8');
  const edits = [];

  for (const literal of collectRelativeModuleLiterals(source, filePath)) {
    if (literal.text.endsWith('.js')) continue;
    edits.push({
      start: literal.getStart() + 1,
      end: literal.getEnd() - 1,
      replacement: await resolveSpecifier(filePath, literal.text),
    });
  }

  if (edits.length === 0) return 0;

  const output = edits
    .sort((left, right) => right.start - left.start)
    .reduce(
      (content, edit) =>
        `${content.slice(0, edit.start)}${edit.replacement}${content.slice(edit.end)}`,
      source,
    );

  await writeFile(filePath, output);
  return edits.length;
}

const outputFiles = (await collectFiles(distDirectory)).filter(
  (filePath) => filePath.endsWith('.js') || filePath.endsWith('.d.ts'),
);
const updatedSpecifierCount = (
  await Promise.all(outputFiles.map((filePath) => addJsExtensions(filePath)))
).reduce((total, count) => total + count, 0);

console.log(`Added .js extensions to ${updatedSpecifierCount} emitted module specifiers.`);
