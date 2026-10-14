/** Offline, deterministic connected samples; no layout computation in the browser. */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const input = new URL('../../playground/datasets/wikipedia.json', import.meta.url);
const output = new URL('../public/homepage/', import.meta.url);
const source = JSON.parse(readFileSync(input, 'utf8'));
const byId = new Map(source.nodes.map((node) => [node.id, node]));
const adjacent = new Map(source.nodes.map((node) => [node.id, []]));
source.edges.forEach((edge, index) => {
  adjacent.get(edge.source)?.push({ id: edge.target, index });
  adjacent.get(edge.target)?.push({ id: edge.source, index });
});
const seed = 'data visualization';
if (!byId.has(seed)) throw new Error('Expected Wikipedia seed is missing');

function sample(limit, edgeLimit) {
  const ids = [seed];
  const selected = new Set(ids);
  const treeEdges = new Set();
  for (let cursor = 0; cursor < ids.length && ids.length < limit; cursor++) {
    for (const neighbor of adjacent.get(ids[cursor])) {
      if (selected.has(neighbor.id) || !byId.has(neighbor.id)) continue;
      selected.add(neighbor.id);
      ids.push(neighbor.id);
      treeEdges.add(neighbor.index);
      if (ids.length === limit) break;
    }
  }
  if (ids.length !== limit) throw new Error('Connected component is too small');
  const edgeIndices = [...treeEdges];
  source.edges.forEach((edge, index) => {
    if (edgeIndices.length >= edgeLimit || treeEdges.has(index)) return;
    if (selected.has(edge.source) && selected.has(edge.target)) edgeIndices.push(index);
  });
  const indexById = new Map(ids.map((id, index) => [id, String(index)]));
  const nodes = ids.map((id) => byId.get(id));
  const minX = Math.min(...nodes.map((node) => node.x));
  const maxX = Math.max(...nodes.map((node) => node.x));
  const minY = Math.min(...nodes.map((node) => node.y));
  const maxY = Math.max(...nodes.map((node) => node.y));
  const scale = 280 / (maxY - minY);
  const round = (number) => Math.round(number * 100) / 100;
  const degree = new Map(ids.map((id) => [id, 0]));
  for (const index of edgeIndices) {
    const edge = source.edges[index];
    degree.set(edge.source, degree.get(edge.source) + 1);
    degree.set(edge.target, degree.get(edge.target) + 1);
  }
  return {
    nodes: nodes.map((node) => ({
      id: indexById.get(node.id),
      x: round((node.x - (minX + maxX) / 2) * scale),
      y: round((node.y - (minY + maxY) / 2) * scale),
      data: {
        label: node.name,
        cluster: Number(node.data.cluster) || 0,
        size: round(Math.min(12, 4 + Math.log2(degree.get(node.id) + 1))),
      },
    })),
    edges: edgeIndices.map((index) => ({
      source: indexById.get(source.edges[index].source),
      target: indexById.get(source.edges[index].target),
    })),
  };
}

mkdirSync(output, { recursive: true });
for (const [name, limit, edgeLimit] of [
  ['desktop', 500, 1500],
  ['mobile', 250, 750],
]) {
  const data = sample(limit, edgeLimit);
  const text = JSON.stringify(data) + '\n';
  const target = new URL(`graph-${name}.json`, output);
  writeFileSync(target, text);
  console.log(
    `${fileURLToPath(target)}: ${data.nodes.length} nodes, ${data.edges.length} edges, ${Buffer.byteLength(text)} bytes`,
  );
}
