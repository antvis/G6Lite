import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const repositoryRoot = path.resolve('.');
const demosDirectory = path.join(repositoryRoot, 'playground/demos');

function hasAutoFitOnResize(options: ts.ObjectLiteralExpression): boolean {
  return options.properties.some((property) => {
    if (!ts.isPropertyAssignment(property)) return false;
    const { name } = property;
    return (ts.isIdentifier(name) || ts.isStringLiteral(name)) && name.text === 'autoFitOnResize';
  });
}

describe('Playground resize fitting policy', () => {
  it('configures every demo Graph through autoFitOnResize', () => {
    const demoFiles = readdirSync(demosDirectory).filter((file) => file.endsWith('.ts'));
    const missing: string[] = [];
    let graphCount = 0;

    for (const file of demoFiles) {
      const filePath = path.join(demosDirectory, file);
      const source = readFileSync(filePath, 'utf8');
      const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

      const visit = (node: ts.Node): void => {
        if (
          ts.isNewExpression(node) &&
          ts.isIdentifier(node.expression) &&
          node.expression.text === 'Graph'
        ) {
          graphCount++;
          const options = node.arguments?.[0];
          if (!options || !ts.isObjectLiteralExpression(options) || !hasAutoFitOnResize(options)) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            missing.push(`${file}:${line + 1}`);
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
    }

    expect(graphCount).toBe(71);
    expect(missing).toEqual([]);
  });

  it('keeps resize fitting in Graph config while preserving manual fitView handles', () => {
    const mainSource = readFileSync(path.join(repositoryRoot, 'playground/main.ts'), 'utf8');
    const demosIndexSource = readFileSync(path.join(demosDirectory, 'index.ts'), 'utf8');

    expect(mainSource).not.toContain('new ResizeObserver');
    expect(mainSource).not.toContain('scheduleFitView');
    expect(mainSource).not.toContain('scheduleFinalFitView');
    expect(demosIndexSource).toContain('fitView?');
    expect(demosIndexSource).toContain('result.fitView');
  });
});
