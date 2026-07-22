import { describe, expect, it } from 'vitest';
import { DataModel } from '@src/dataModel.js';
import type { ThemeTokens } from '@src/types.js';

const mockTheme: ThemeTokens = {
  nodeFill: '#5B8FF9',
  nodeSize: 24,
  nodeStroke: '#fff',
  nodeStrokeWidth: 0,
  edgeStroke: '#99ADD1',
  edgeLineWidth: 1,
  edgeArrow: true,
  canvasBackground: '#fff',
  edgeDefaultColor: '#99ADD1',
  edgeCategoryPalette: [],
  edgeStateStyles: {},
  nodeStateStyles: {},
};

function createModel() {
  return new DataModel({ theme: mockTheme });
}

describe('DataModel', () => {
  describe('node operations', () => {
    it('should add a single node', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 10, y: 20 });
      expect(model.getNodeCount()).toBe(1);
      expect(model.hasNode('a')).toBe(true);
      const node = model.getNode('a');
      expect(node).toBeDefined();
      expect(node!.id).toBe('a');
      expect(node!.x).toBe(10);
      expect(node!.y).toBe(20);
    });

    it('should not add duplicate node', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.addNode({ id: 'a', x: 1, y: 1 });
      expect(model.getNodeCount()).toBe(1);
      expect(model.getNode('a')!.x).toBe(0);
    });

    it('should add multiple nodes', () => {
      const model = createModel();
      model.addNodes([
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 1, y: 1 },
        { id: 'c', x: 2, y: 2 },
      ]);
      expect(model.getNodeCount()).toBe(3);
      expect(model.getAllNodeIds()).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    });

    it('should remove a node', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.getChanges(); // clear
      model.removeNode('a');
      expect(model.hasNode('a')).toBe(false);
      expect(model.getNodeCount()).toBe(0);
    });

    it('should remove connected edges when removing a node', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.addNode({ id: 'b', x: 1, y: 1 });
      model.addEdge({ source: 'a', target: 'b' });
      model.getChanges(); // clear
      model.removeNode('a');
      expect(model.getEdgeCount()).toBe(0);
    });

    it('should update node position', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.getChanges(); // clear
      model.updateNodePosition('a', 100, 200);
      expect(model.getNode('a')!.x).toBe(100);
      expect(model.getNode('a')!.y).toBe(200);
    });

    it('should not record change if position is unchanged', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 10, y: 20 });
      model.getChanges(); // clear
      model.updateNodePosition('a', 10, 20);
      expect(model.hasChanges()).toBe(false);
    });

    it('should update node data', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0, data: { label: 'A' } });
      model.updateNodeData('a', { weight: 5 });
      expect(model.getNode('a')!.data).toEqual({ label: 'A', weight: 5 });
    });

    it('should remove multiple nodes', () => {
      const model = createModel();
      model.addNodes([
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 1, y: 1 },
        { id: 'c', x: 2, y: 2 },
      ]);
      model.getChanges(); // clear
      model.removeNodes(['a', 'c']);
      expect(model.getNodeCount()).toBe(1);
      expect(model.hasNode('b')).toBe(true);
    });
  });

  describe('edge operations', () => {
    it('should add a single edge with auto-generated ID', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.addNode({ id: 'b', x: 1, y: 1 });
      const edgeId = model.addEdge({ source: 'a', target: 'b' });
      expect(edgeId).toBe('e0');
      expect(model.getEdgeCount()).toBe(1);
    });

    it('should add multiple edges', () => {
      const model = createModel();
      model.addNodes([
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 1, y: 1 },
        { id: 'c', x: 2, y: 2 },
      ]);
      const ids = model.addEdges([
        { source: 'a', target: 'b' },
        { source: 'b', target: 'c' },
      ]);
      expect(ids).toHaveLength(2);
      expect(model.getEdgeCount()).toBe(2);
    });

    it('should remove an edge', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.addNode({ id: 'b', x: 1, y: 1 });
      const edgeId = model.addEdge({ source: 'a', target: 'b' });
      model.getChanges(); // clear
      model.removeEdge(edgeId);
      expect(model.hasEdge(edgeId)).toBe(false);
      expect(model.getEdgeCount()).toBe(0);
    });

    it('should update edge data', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.addNode({ id: 'b', x: 1, y: 1 });
      const edgeId = model.addEdge({ source: 'a', target: 'b', data: { weight: 1 } });
      model.updateEdgeData(edgeId, { weight: 10 });
      expect(model.getEdge(edgeId)!.data).toEqual({ weight: 10 });
    });

    it('should find adjacent edges', () => {
      const model = createModel();
      model.addNodes([
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 1, y: 1 },
        { id: 'c', x: 2, y: 2 },
      ]);
      model.addEdge({ source: 'a', target: 'b' });
      model.addEdge({ source: 'a', target: 'c' });
      const adj = model.getAdjacentEdges('a');
      expect(adj).toHaveLength(2);
    });

    it('should find neighbor nodes', () => {
      const model = createModel();
      model.addNodes([
        { id: 'a', x: 0, y: 0 },
        { id: 'b', x: 1, y: 1 },
        { id: 'c', x: 2, y: 2 },
      ]);
      model.addEdge({ source: 'a', target: 'b' });
      model.addEdge({ source: 'c', target: 'a' });
      const neighbors = model.getNeighborNodes('a');
      expect(neighbors).toEqual(expect.arrayContaining(['b', 'c']));
    });
  });

  describe('state management', () => {
    it('should set and clear node states', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.setNodeState('a', 'selected', true);
      expect(model.getNode('a')!.states.has('selected')).toBe(true);
      model.setNodeState('a', 'selected', false);
      expect(model.getNode('a')!.states.has('selected')).toBe(false);
    });

    it('should set and clear edge states', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.addNode({ id: 'b', x: 1, y: 1 });
      const edgeId = model.addEdge({ source: 'a', target: 'b' });
      model.setEdgeState(edgeId, 'active', true);
      expect(model.getEdge(edgeId)!.states.has('active')).toBe(true);
      model.clearEdgeStates(edgeId);
      expect(model.getEdge(edgeId)!.states.size).toBe(0);
    });

    it('should support multiple states', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.setNodeState('a', 'selected', true);
      model.setNodeState('a', 'highlight', true);
      const states = model.getNode('a')!.states;
      expect(states.has('selected')).toBe(true);
      expect(states.has('highlight')).toBe(true);
    });

    it('should clear node states', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.setNodeState('a', 'selected', true);
      model.setNodeState('a', 'active', true);
      model.clearNodeStates('a');
      expect(model.getNode('a')!.states.size).toBe(0);
    });
  });

  describe('change tracking', () => {
    it('should track nodeAdded changes', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      const changes = model.getChanges();
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('nodeAdded');
      expect(changes[0].ids).toEqual(['a']);
    });

    it('should track edgeAdded changes', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.addNode({ id: 'b', x: 1, y: 1 });
      model.getChanges(); // clear node changes
      model.addEdge({ source: 'a', target: 'b' });
      const changes = model.getChanges();
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('edgeAdded');
    });

    it('should track nodePositionChanged', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.getChanges();
      model.updateNodePosition('a', 100, 200);
      const changes = model.getChanges();
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('nodePositionChanged');
      expect(changes[0].ids).toEqual(['a']);
    });

    it('should track nodeStateChanged', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.getChanges();
      model.setNodeState('a', 'selected', true);
      const changes = model.getChanges();
      expect(changes[0].type).toBe('nodeStateChanged');
    });

    it('should clear changes after getChanges', () => {
      const model = createModel();
      model.addNode({ id: 'a', x: 0, y: 0 });
      model.getChanges();
      expect(model.hasChanges()).toBe(false);
    });

    it('should track dataReplaced on replaceData', () => {
      const model = createModel();
      model.replaceData([{ id: 'x', x: 0, y: 0 }], [{ source: 'x', target: 'x' }]);
      const changes = model.getChanges();
      expect(changes).toHaveLength(1);
      expect(changes[0].type).toBe('dataReplaced');
    });
  });

  describe('replaceData', () => {
    it('should replace all data', () => {
      const model = createModel();
      model.addNode({ id: 'old', x: 0, y: 0 });
      model.replaceData(
        [
          { id: 'new1', x: 10, y: 20 },
          { id: 'new2', x: 30, y: 40 },
        ],
        [{ source: 'new1', target: 'new2' }],
      );
      expect(model.getNodeCount()).toBe(2);
      expect(model.getEdgeCount()).toBe(1);
      expect(model.hasNode('old')).toBe(false);
      expect(model.hasNode('new1')).toBe(true);
    });

    it('should preserve states in replaced data', () => {
      const model = createModel();
      model.replaceData([{ id: 'a', x: 0, y: 0, states: ['selected', 'highlight'] }], []);
      const node = model.getNode('a')!;
      expect(node.states.has('selected')).toBe(true);
      expect(node.states.has('highlight')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle operations on non-existent nodes', () => {
      const model = createModel();
      model.removeNode('nonexistent');
      model.updateNodePosition('nonexistent', 0, 0);
      model.updateNodeData('nonexistent', {});
      model.setNodeState('nonexistent', 'selected', true);
      model.clearNodeStates('nonexistent');
      // No errors thrown
    });

    it('should handle operations on non-existent edges', () => {
      const model = createModel();
      model.removeEdge('nonexistent');
      model.updateEdgeData('nonexistent', {});
      model.setEdgeState('nonexistent', 'active', true);
      model.clearEdgeStates('nonexistent');
      // No errors thrown
    });

    it('should return undefined for getNode/getEdge on missing IDs', () => {
      const model = createModel();
      expect(model.getNode('missing')).toBeUndefined();
      expect(model.getEdge('missing')).toBeUndefined();
    });
  });
});

describe('findAllByState', () => {
  it('should find nodes by state', () => {
    const model = createModel();
    model.addNode({ id: 'a', x: 0, y: 0 });
    model.addNode({ id: 'b', x: 1, y: 1 });
    model.addNode({ id: 'c', x: 2, y: 2 });
    model.setNodeState('a', 'selected', true);
    model.setNodeState('c', 'selected', true);

    const selected = model.findNodesByState('selected');
    expect(selected).toEqual(expect.arrayContaining(['a', 'c']));
    expect(selected).toHaveLength(2);
  });

  it('should return empty array when no nodes match state', () => {
    const model = createModel();
    model.addNode({ id: 'a', x: 0, y: 0 });
    const result = model.findNodesByState('selected');
    expect(result).toEqual([]);
  });

  it('should find edges by state', () => {
    const model = createModel();
    model.addNode({ id: 'a', x: 0, y: 0 });
    model.addNode({ id: 'b', x: 1, y: 1 });
    model.addNode({ id: 'c', x: 2, y: 2 });
    const e1 = model.addEdge({ source: 'a', target: 'b' });
    const e2 = model.addEdge({ source: 'b', target: 'c' });
    model.setEdgeState(e1, 'active', true);

    const active = model.findEdgesByState('active');
    expect(active).toEqual([e1]);
  });

  it('should find nodes with predicate', () => {
    const model = createModel();
    model.addNode({ id: 'a', x: 0, y: 0, data: { cluster: 'A' } });
    model.addNode({ id: 'b', x: 1, y: 1, data: { cluster: 'B' } });
    model.addNode({ id: 'c', x: 2, y: 2, data: { cluster: 'A' } });

    const clusterA = model.findNodes((n) => n.data?.cluster === 'A');
    expect(clusterA).toHaveLength(2);
    expect(clusterA.map((n) => n.id)).toEqual(expect.arrayContaining(['a', 'c']));
  });

  it('should find edges with predicate', () => {
    const model = createModel();
    model.addNode({ id: 'a', x: 0, y: 0 });
    model.addNode({ id: 'b', x: 1, y: 1 });
    model.addNode({ id: 'c', x: 2, y: 2 });
    model.addEdge({ source: 'a', target: 'b' });
    model.addEdge({ source: 'b', target: 'c' });

    const bEdges = model.findEdges((e) => e.source === 'b');
    expect(bEdges).toHaveLength(1);
    expect(bEdges[0].target).toBe('c');
  });
});

describe('findNodesByState after state operations', () => {
  it('should find nodes after setting multiple states', () => {
    const model = createModel();
    model.addNode({ id: 'a', x: 0, y: 0 });
    model.addNode({ id: 'b', x: 1, y: 1 });
    model.addNode({ id: 'c', x: 2, y: 2 });
    model.setNodeState('a', 'selected', true);
    model.setNodeState('b', 'active', true);
    model.setNodeState('c', 'selected', true);

    expect(model.findNodesByState('selected')).toEqual(['a', 'c']);
    expect(model.findNodesByState('active')).toEqual(['b']);
    expect(model.findNodesByState('highlight')).toEqual([]);
  });

  it('should find nodes with multiple states', () => {
    const model = createModel();
    model.addNode({ id: 'a', x: 0, y: 0 });
    model.setNodeState('a', 'selected', true);
    model.setNodeState('a', 'active', true);

    expect(model.findNodesByState('selected')).toEqual(['a']);
    expect(model.findNodesByState('active')).toEqual(['a']);
    model.clearNodeStates('a');
    expect(model.findNodesByState('selected')).toEqual([]);
  });
});

describe('DataModel combo operations', () => {
  it('should add a combo and query it', () => {
    const model = createModel();
    model.addCombo({ id: 'c1', data: { name: 'Group 1' } });
    expect(model.hasCombos()).toBe(true);
    expect(model.getCombos()).toHaveLength(1);
    const combo = model.getCombo('c1');
    expect(combo).toBeDefined();
    expect(combo!.id).toBe('c1');
    expect(combo!.collapsed).toBe(false);
  });

  it('should not add a duplicate combo', () => {
    const model = createModel();
    model.addCombo({ id: 'c1' });
    model.addCombo({ id: 'c1' });
    expect(model.getCombos()).toHaveLength(1);
  });

  it('should nest a combo under its parent', () => {
    const model = createModel();
    model.addCombo({ id: 'parent' });
    model.addCombo({ id: 'child', parentId: 'parent' });
    expect(model.getCombo('parent')!.childComboIds.has('child')).toBe(true);
  });

  it('should associate nodes with a combo via initCombos', () => {
    const model = createModel();
    model.addNodes([
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 10, y: 10 },
    ]);
    model.initCombos(
      [{ id: 'c1' }],
      [
        { id: 'n1', comboId: 'c1' },
        { id: 'n2', comboId: 'c1' },
      ],
    );
    expect(model.getNodeCombo('n1')).toBe('c1');
    expect(model.getCombo('c1')!.childNodeIds.size).toBe(2);
  });

  it('should ignore missing nodes when initializing or updating Combo membership', () => {
    const model = createModel();
    model.addNode({ id: 'existing', x: 0, y: 0 });
    model.initCombos(
      [{ id: 'c1' }],
      [
        { id: 'existing', comboId: 'c1' },
        { id: 'missing', comboId: 'c1' },
      ],
    );

    model.setNodeCombo('another-missing', 'c1');

    expect(model.getCombo('c1')!.childNodeIds).toEqual(new Set(['existing']));
    expect(model.getNodeCombo('missing')).toBeUndefined();
    expect(model.getNodeCombo('another-missing')).toBeUndefined();
  });

  it('should move a node between combos with setNodeCombo', () => {
    const model = createModel();
    model.addNode({ id: 'n1', x: 0, y: 0 });
    model.addCombo({ id: 'a' });
    model.addCombo({ id: 'b' });
    model.setNodeCombo('n1', 'a');
    expect(model.getNodeCombo('n1')).toBe('a');
    model.setNodeCombo('n1', 'b');
    expect(model.getNodeCombo('n1')).toBe('b');
    expect(model.getCombo('a')!.childNodeIds.has('n1')).toBe(false);
    expect(model.getCombo('b')!.childNodeIds.has('n1')).toBe(true);
    // Detach
    model.setNodeCombo('n1', undefined);
    expect(model.getNodeCombo('n1')).toBeUndefined();
  });

  it('should remove a combo and clear node associations', () => {
    const model = createModel();
    model.addNode({ id: 'n1', x: 0, y: 0 });
    model.addCombo({ id: 'parent' });
    model.addCombo({ id: 'c1', parentId: 'parent' });
    model.setNodeCombo('n1', 'c1');
    model.removeCombo('c1');
    expect(model.getCombo('c1')).toBeUndefined();
    expect(model.getNodeCombo('n1')).toBeUndefined();
    expect(model.getCombo('parent')!.childComboIds.has('c1')).toBe(false);
  });

  it('should clear Combo membership and hidden ownership when removing a node', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'n1', x: 0, y: 0 },
        { id: 'outside', x: 100, y: 0 },
      ],
      [{ id: 'edge-1', source: 'n1', target: 'outside' }],
    );
    model.initCombos([{ id: 'combo-1', collapsed: true }], [{ id: 'n1', comboId: 'combo-1' }]);

    model.removeNode('n1');

    expect(model.getNodeCombo('n1')).toBeUndefined();
    expect(model.getCombo('combo-1')!.childNodeIds.has('n1')).toBe(false);

    model.addNode({ id: 'n1', x: 10, y: 10 });
    model.setNodeState('n1', 'hidden', false);
    expect(model.getNode('n1')!.states.has('hidden')).toBe(false);
  });

  it('should clear Combo hidden ownership when removing an edge', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'n1', x: 0, y: 0 },
        { id: 'outside', x: 100, y: 0 },
      ],
      [{ id: 'edge-1', source: 'n1', target: 'outside' }],
    );
    model.initCombos([{ id: 'combo-1', collapsed: true }], [{ id: 'n1', comboId: 'combo-1' }]);

    model.removeEdge('edge-1');
    model.addEdge({ id: 'edge-1', source: 'outside', target: 'outside' });
    model.setEdgeState('edge-1', 'hidden', false);

    expect(model.getEdge('edge-1')!.states.has('hidden')).toBe(false);
  });

  it('should toggle collapsed state', () => {
    const model = createModel();
    model.addCombo({ id: 'c1' });
    model.setComboCollapsed('c1', true);
    expect(model.getCombo('c1')!.collapsed).toBe(true);
    model.setComboCollapsed('c1', false);
    expect(model.getCombo('c1')!.collapsed).toBe(false);
  });

  it('should compute combo bounds from child node positions', () => {
    const model = createModel();
    model.addNodes([
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 100, y: 50 },
    ]);
    model.initCombos(
      [{ id: 'c1' }],
      [
        { id: 'n1', comboId: 'c1' },
        { id: 'n2', comboId: 'c1' },
      ],
    );
    model.updateComboBounds(20);
    const combo = model.getCombo('c1')!;
    expect(combo.x).toBe(50); // (0 + 100) / 2
    expect(combo.y).toBe(25); // (0 + 50) / 2
    expect(combo.width).toBe(140); // 100 - 0 + 20 * 2
    expect(combo.height).toBe(90); // 50 - 0 + 20 * 2
  });

  it('should give an empty combo zero bounds', () => {
    const model = createModel();
    model.addCombo({ id: 'c1' });
    model.updateComboBounds();
    const combo = model.getCombo('c1')!;
    expect(combo.width).toBe(0);
    expect(combo.height).toBe(0);
  });

  it('should expand nested combo bounds to include child combos', () => {
    const model = createModel();
    model.addNodes([
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 200, y: 200 },
    ]);
    model.initCombos(
      [{ id: 'parent' }, { id: 'child', parentId: 'parent' }],
      [
        { id: 'n1', comboId: 'parent' },
        { id: 'n2', comboId: 'child' },
      ],
    );
    model.updateComboBounds(10);
    const parent = model.getCombo('parent')!;
    // Parent bounds must enclose both its own node (0,0) and the child combo around (200,200)
    expect(parent.width).toBeGreaterThan(0);
    expect(parent.x).toBeGreaterThan(0);
  });

  it('should collect all node ids including nested combos', () => {
    const model = createModel();
    model.addNodes([
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 0, y: 0 },
    ]);
    model.initCombos(
      [{ id: 'parent' }, { id: 'child', parentId: 'parent' }],
      [
        { id: 'n1', comboId: 'parent' },
        { id: 'n2', comboId: 'child' },
      ],
    );
    const ids = model.getComboAllNodeIds('parent');
    expect(ids.sort()).toEqual(['n1', 'n2']);
  });

  it('should guard against circular combo references', () => {
    const model = createModel();
    model.addCombo({ id: 'a' });
    model.addCombo({ id: 'b', parentId: 'a' });
    // Force a cycle: make `a` also a child of `b`
    model.getCombo('b')!.childComboIds.add('a');
    // Should not stack-overflow
    expect(() => model.updateComboBounds()).not.toThrow();
    expect(() => model.getComboAllNodeIds('a')).not.toThrow();
  });

  it('should export current nodes, edges, and runtime combos through toData', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'n1', name: 'Node 1', x: 10, y: 20, data: { label: 'A' }, states: ['selected'] },
        { id: 'n2', x: 30, y: 40 },
      ],
      [{ id: 'edge-1', source: 'n1', target: 'n2', data: { weight: 2 }, states: ['active'] }],
    );
    model.initCombos(
      [
        {
          id: 'combo-1',
          collapsed: true,
          style: { collapsedSize: 48, fill: '#DEE8FF', stroke: '#2F7DF6', label: 'Group' },
          data: { source: 'graphx-group' },
          states: ['selected'],
        },
      ],
      [{ id: 'n1', comboId: 'combo-1' }],
    );

    const data = model.toData();

    expect(data.nodes.find((node) => node.id === 'n1')).toEqual({
      id: 'n1',
      name: 'Node 1',
      x: 10,
      y: 20,
      data: { label: 'A' },
      states: ['selected'],
      comboId: 'combo-1',
    });
    expect(data.edges[0]).toEqual({
      id: 'edge-1',
      source: 'n1',
      target: 'n2',
      data: { weight: 2 },
      states: ['active'],
    });
    expect(data.combos?.[0]).toEqual({
      id: 'combo-1',
      collapsed: true,
      style: { collapsedSize: 48, fill: '#DEE8FF', stroke: '#2F7DF6', label: 'Group' },
      data: { source: 'graphx-group' },
      states: ['selected'],
    });
  });

  it('should preserve business hidden while filtering combo-derived hidden on export', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'business-hidden', x: 0, y: 0, states: ['hidden'] },
        { id: 'combo-hidden', x: 10, y: 10 },
        { id: 'outside', x: 20, y: 20 },
      ],
      [
        { id: 'combo-edge', source: 'combo-hidden', target: 'outside' },
        {
          id: 'business-edge-hidden',
          source: 'business-hidden',
          target: 'outside',
          states: ['hidden'],
        },
      ],
    );
    model.initCombos(
      [{ id: 'combo-1', collapsed: true }],
      [
        { id: 'business-hidden', comboId: 'combo-1' },
        { id: 'combo-hidden', comboId: 'combo-1' },
      ],
    );

    const data = model.toData();

    expect(data.nodes.find((node) => node.id === 'business-hidden')?.states).toEqual(['hidden']);
    expect(data.nodes.find((node) => node.id === 'combo-hidden')?.states).toBeUndefined();
    expect(model.getEdge('combo-edge')!.states.has('hidden')).toBe(true);
    expect(data.edges.find((edge) => edge.id === 'combo-edge')?.states).toBeUndefined();
    expect(data.edges.find((edge) => edge.id === 'business-edge-hidden')?.states).toEqual([
      'hidden',
    ]);
  });

  it('should restore combo-derived hidden edges when combo expands', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'n1', x: 0, y: 0 },
        { id: 'n2', x: 10, y: 10 },
        { id: 'outside', x: 20, y: 20 },
      ],
      [
        { id: 'internal-edge', source: 'n1', target: 'n2' },
        { id: 'external-edge', source: 'n1', target: 'outside' },
      ],
    );
    model.initCombos(
      [{ id: 'combo-1', collapsed: true }],
      [
        { id: 'n1', comboId: 'combo-1' },
        { id: 'n2', comboId: 'combo-1' },
      ],
    );

    expect(model.getEdge('internal-edge')!.states.has('hidden')).toBe(true);
    expect(model.getEdge('external-edge')!.states.has('hidden')).toBe(true);

    model.releaseComboHidden(model.getComboAllNodeIds('combo-1'));

    expect(model.getEdge('internal-edge')!.states.has('hidden')).toBe(false);
    expect(model.getEdge('external-edge')!.states.has('hidden')).toBe(false);
  });

  it('should release an edge after both endpoints are added to one collapsed combo separately', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'n1', x: 0, y: 0 },
        { id: 'n2', x: 10, y: 10 },
      ],
      [{ id: 'edge-1', source: 'n1', target: 'n2' }],
    );
    model.initCombos([{ id: 'combo-1', collapsed: true }], []);

    // Mirror two separate Graph.addToCombo calls while the Combo is collapsed.
    model.setNodeCombo('n1', 'combo-1');
    model.applyComboHidden(['n1']);
    model.setNodeCombo('n2', 'combo-1');
    model.applyComboHidden(['n2']);

    expect(model.getEdge('edge-1')!.states.has('hidden')).toBe(true);

    model.releaseComboHidden(model.getComboAllNodeIds('combo-1'));

    expect(model.getNode('n1')!.states.has('hidden')).toBe(false);
    expect(model.getNode('n2')!.states.has('hidden')).toBe(false);
    expect(model.getEdge('edge-1')!.states.has('hidden')).toBe(false);
  });

  it('should keep combo-derived node and edge hidden through show and clear operations', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'n1', x: 0, y: 0 },
        { id: 'outside', x: 100, y: 0 },
      ],
      [{ id: 'e1', source: 'n1', target: 'outside' }],
    );
    model.initCombos([{ id: 'combo-1', collapsed: true }], [{ id: 'n1', comboId: 'combo-1' }]);

    model.replaceNodeStates('n1', ['selected']);
    model.replaceEdgeStates('e1', ['active']);
    expect(model.getNode('n1')!.states).toEqual(new Set(['selected', 'hidden']));
    expect(model.getEdge('e1')!.states).toEqual(new Set(['active', 'hidden']));

    model.setNodeState('n1', 'hidden', false);
    model.setNodeState('n1', 'selected', true);
    model.clearNodeStates('n1');
    model.setEdgeState('e1', 'hidden', false);
    model.setEdgeState('e1', 'selected', true);
    model.clearEdgeStates('e1');

    expect(model.getNode('n1')!.states).toEqual(new Set(['hidden']));
    expect(model.getEdge('e1')!.states).toEqual(new Set(['hidden']));
    expect(model.toData().nodes.find((node) => node.id === 'n1')?.states).toBeUndefined();
    expect(model.toData().edges.find((edge) => edge.id === 'e1')?.states).toBeUndefined();

    model.releaseComboHidden(model.getComboAllNodeIds('combo-1'));

    expect(model.getNode('n1')!.states.has('hidden')).toBe(false);
    expect(model.getEdge('e1')!.states.has('hidden')).toBe(false);
  });

  it('should preserve explicit business hidden but transfer a cleared hidden back to the Combo', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'business', x: 0, y: 0 },
        { id: 'cleared', x: 20, y: 0, states: ['hidden'] },
        { id: 'outside', x: 100, y: 0 },
      ],
      [
        { id: 'business-edge', source: 'business', target: 'outside' },
        { id: 'cleared-edge', source: 'cleared', target: 'outside', states: ['hidden'] },
      ],
    );
    model.initCombos(
      [{ id: 'combo-1', collapsed: true }],
      [
        { id: 'business', comboId: 'combo-1' },
        { id: 'cleared', comboId: 'combo-1' },
      ],
    );

    model.setNodeState('business', 'hidden', true);
    model.setEdgeState('business-edge', 'hidden', true);
    model.setNodeState('cleared', 'hidden', false);
    model.setEdgeState('cleared-edge', 'hidden', false);

    expect(model.getNode('cleared')!.states.has('hidden')).toBe(true);
    expect(model.getEdge('cleared-edge')!.states.has('hidden')).toBe(true);

    model.releaseComboHidden(model.getComboAllNodeIds('combo-1'));

    expect(model.getNode('business')!.states.has('hidden')).toBe(true);
    expect(model.getEdge('business-edge')!.states.has('hidden')).toBe(true);
    expect(model.getNode('cleared')!.states.has('hidden')).toBe(false);
    expect(model.getEdge('cleared-edge')!.states.has('hidden')).toBe(false);
  });

  it('should release nested combo hidden only after the final depth is removed', () => {
    const model = createModel();
    model.replaceData(
      [
        { id: 'n1', x: 0, y: 0 },
        { id: 'outside', x: 100, y: 0 },
      ],
      [{ id: 'e1', source: 'n1', target: 'outside' }],
    );
    model.initCombos(
      [
        { id: 'parent', collapsed: true },
        { id: 'child', parentId: 'parent', collapsed: true },
      ],
      [{ id: 'n1', comboId: 'child' }],
    );

    model.releaseComboHidden(model.getComboAllNodeIds('child'));
    expect(model.getNode('n1')!.states.has('hidden')).toBe(true);
    expect(model.getEdge('e1')!.states.has('hidden')).toBe(true);

    model.releaseComboHidden(model.getComboAllNodeIds('parent'));
    expect(model.getNode('n1')!.states.has('hidden')).toBe(false);
    expect(model.getEdge('e1')!.states.has('hidden')).toBe(false);
  });

  it('should support per-combo padding while computing bounds', () => {
    const model = createModel();
    model.addNodes([
      { id: 'n1', x: 0, y: 0 },
      { id: 'n2', x: 100, y: 50 },
    ]);
    model.initCombos(
      [{ id: 'c1', style: { padding: 40 } }],
      [
        { id: 'n1', comboId: 'c1' },
        { id: 'n2', comboId: 'c1' },
      ],
    );
    model.updateComboBounds((combo) => {
      const padding = combo.style?.padding;
      return typeof padding === 'number' ? padding : 20;
    });

    expect(model.getCombo('c1')!.width).toBe(180);
    expect(model.getCombo('c1')!.height).toBe(130);
  });
});
