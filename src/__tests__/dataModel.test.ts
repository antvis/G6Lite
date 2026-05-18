import { describe, it, expect } from 'vitest';
import { DataModel } from '../dataModel.js';
import type { ThemeTokens } from '../types.js';

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
      expect(changes[0].type).toBe('nodePositionChanged');
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
