import { describe, expect, it } from 'vitest';
import { executeFishboneLayout } from '../layout/fishboneLayout.js';
import { executeIndentedLayout } from '../layout/indentedLayout.js';
import { executeMindmapLayout } from '../layout/mindmapLayout.js';
import { runLayout } from '../layout/runLayout.js';
import type { GraphData } from '../types.js';

describe('function-based built-in layouts', () => {
  it('executes the indented layout without mutating input data', () => {
    const data: GraphData = {
      nodes: [{ id: 'root', data: { label: 'Root' } }, { id: 'child' }, { id: 'leaf' }],
      edges: [
        { source: 'root', target: 'child' },
        { source: 'child', target: 'leaf' },
      ],
    };
    const original = structuredClone(data);

    const result = executeIndentedLayout(data, {
      indent: 60,
      rowHeight: 30,
      nodeColors: ['#root', '#child', '#leaf'],
      edgeColors: ['#edge-0', '#edge-1'],
    });

    expect(result.nodes).toMatchObject([
      {
        id: 'root',
        x: 0,
        y: 0,
        data: { label: 'Root', depth: 0, _isRoot: true, _nodeColor: '#root' },
      },
      { id: 'child', x: 60, y: 30, data: { depth: 1, _isRoot: false } },
      { id: 'leaf', x: 120, y: 60, data: { depth: 2, _isRoot: false } },
    ]);
    expect(data).toEqual(original);
  });

  it('executes the mindmap layout with deterministic branch sides and colors', () => {
    const data: GraphData = {
      nodes: [{ id: 'root' }, { id: 'left' }, { id: 'right' }, { id: 'left-child' }],
      edges: [
        { source: 'root', target: 'left' },
        { source: 'root', target: 'right' },
        { source: 'left', target: 'left-child' },
      ],
    };
    const original = structuredClone(data);

    const result = executeMindmapLayout(data, {
      branchColors: ['#left', '#right'],
      getSide: (_node, index, parentSide) => parentSide ?? (index === 0 ? 'left' : 'right'),
    });
    const byId = new Map(result.nodes.map((node) => [node.id, node]));

    expect(byId.get('root')).toMatchObject({ x: 0, y: 0 });
    expect(byId.get('left')).toMatchObject({ x: -220, y: 0, data: { _branchColor: '#left' } });
    expect(byId.get('right')).toMatchObject({ x: 220, y: 0, data: { _branchColor: '#right' } });
    expect(byId.get('left-child')).toMatchObject({
      x: -440,
      y: 0,
      data: { _branchColor: '#left' },
    });
    expect(data).toEqual(original);
  });

  it('executes the fishbone layout as a stateless function', () => {
    const data: GraphData = {
      nodes: [{ id: 'head' }, { id: 'category' }, { id: 'item' }],
      edges: [
        { source: 'head', target: 'category' },
        { source: 'category', target: 'item' },
      ],
    };
    const original = structuredClone(data);

    const result = executeFishboneLayout(data);
    const byId = new Map(result.nodes.map((node) => [node.id, node]));

    expect(byId.get('head')).toMatchObject({ x: 440, y: 280 });
    expect(byId.get('category')).toMatchObject({ x: 110, y: 80 });
    expect(byId.get('item')).toMatchObject({ x: 150, y: 180 });
    expect(data).toEqual(original);
  });

  it('keeps self-developed layouts on their executor path when worker is requested', async () => {
    const result = await runLayout(
      {
        nodes: [{ id: 'root' }, { id: 'child' }],
        edges: [{ source: 'root', target: 'child' }],
      },
      { type: 'indented', worker: true, indent: 50, rowHeight: 25 },
    );

    expect(result.nodes).toMatchObject([
      { id: 'root', x: 0, y: 0 },
      { id: 'child', x: 50, y: 25 },
    ]);
  });
});
