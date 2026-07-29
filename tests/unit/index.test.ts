import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';
import * as publicApi from '@src/index.js';

function collectTypeScriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? collectTypeScriptFiles(path) : path.endsWith('.ts') ? [path] : [];
  });
}

function collectRelativeModuleSpecifiers(source: string, filePath: string): string[] {
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);
  const specifiers: string[] = [];

  function addSpecifier(literal: ts.Expression | undefined): void {
    if (literal && ts.isStringLiteralLike(literal) && /^\.{1,2}\//.test(literal.text)) {
      specifiers.push(literal.text);
    }
  }

  function visit(node: ts.Node): void {
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

function collectDirectories(directory: string): string[] {
  const directories = [directory];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) directories.push(...collectDirectories(join(directory, entry.name)));
  }

  return directories;
}

function collectExportSpecifiers(indexFile: string): string[] {
  const source = readFileSync(indexFile, 'utf8');
  const sourceFile = ts.createSourceFile(indexFile, source, ts.ScriptTarget.Latest, true);

  return sourceFile.statements.flatMap((statement) => {
    if (!ts.isExportDeclaration(statement) || !statement.moduleSpecifier) return [];
    return ts.isStringLiteralLike(statement.moduleSpecifier)
      ? [statement.moduleSpecifier.text]
      : [];
  });
}

function getDirectModuleSpecifiers(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.ts') && entry.name !== 'index.ts')
    .map((entry) => `./${entry.name.slice(0, -'.ts'.length)}`)
    .sort();
}
describe('package public API boundary', () => {
  it('exports the reviewed runtime surface only', () => {
    expect(Object.keys(publicApi).sort()).toEqual([
      'BaseNode',
      'BreathingNode',
      'EventEmitter',
      'Graph',
      'extensionFactory',
      'register',
      'registerNode',
      'resolveTheme',
      'runLayout',
    ]);
  });

  it('does not expose engine implementation classes from the package root', () => {
    expect(publicApi).not.toHaveProperty('DataModel');
    expect(publicApi).not.toHaveProperty('RenderScheduler');
    expect(publicApi).not.toHaveProperty('RefreshLevel');
  });

  it('uses directory barrels instead of reaching through directory internals', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/index.ts'), 'utf8');
    const directoryImports = [...source.matchAll(/from ['"]\.\/(\w+)\/([^'"]+)['"]/g)].map(
      (match) => match[0],
    );

    expect(directoryImports).toEqual(
      expect.arrayContaining([
        "from './behaviors/index'",
        "from './extensions/index'",
        "from './layout/index'",
        "from './renderer/index'",
      ]),
    );
    expect(directoryImports.every((entry) => entry.endsWith("/index'"))).toBe(true);
  });

  it('keeps source relative module specifiers extensionless', () => {
    const sourceDirectory = resolve(process.cwd(), 'src');
    const violations = collectTypeScriptFiles(sourceDirectory).flatMap((filePath) =>
      collectRelativeModuleSpecifiers(readFileSync(filePath, 'utf8'), filePath)
        .filter((specifier) => specifier.endsWith('.js'))
        .map((specifier) => `${filePath.replace(`${process.cwd()}/`, '')}: ${specifier}`),
    );

    expect(violations).toEqual([]);
  });

  it('provides an index.ts for every source directory', () => {
    const sourceDirectory = resolve(process.cwd(), 'src');
    const missingIndexes = collectDirectories(sourceDirectory)
      .filter((directory) => !readdirSync(directory).includes('index.ts'))
      .map((directory) => basename(directory));

    expect(missingIndexes).toEqual([]);
  });

  it('keeps every barrel export at its own directory level', () => {
    const sourceDirectory = resolve(process.cwd(), 'src');
    const violations = collectDirectories(sourceDirectory).flatMap((directory) => {
      const indexFile = join(directory, 'index.ts');

      return collectExportSpecifiers(indexFile)
        .filter((specifier) => {
          if (!specifier.startsWith('./')) return true;
          const segments = specifier.slice(2).split('/');
          return segments.length > 2 || (segments.length === 2 && segments[1] !== 'index');
        })
        .map((specifier) => `${indexFile}: ${specifier}`);
    });

    expect(violations).toEqual([]);
  });

  it('exposes every renderer program through the programs directory API', () => {
    const programsDirectory = resolve(process.cwd(), 'src/renderer/programs');
    const exports = new Set(collectExportSpecifiers(join(programsDirectory, 'index.ts')));

    expect(
      getDirectModuleSpecifiers(programsDirectory).filter((specifier) => !exports.has(specifier)),
    ).toEqual([]);
    expect(exports).toContain('./shaders/index');
  });

  it('exposes every shader through the shaders directory API', () => {
    const shadersDirectory = resolve(process.cwd(), 'src/renderer/programs/shaders');
    const exports = new Set(collectExportSpecifiers(join(shadersDirectory, 'index.ts')));

    expect(
      getDirectModuleSpecifiers(shadersDirectory).filter((specifier) => !exports.has(specifier)),
    ).toEqual([]);
  });
});
