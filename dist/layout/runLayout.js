/**
 * Run AntV Layout on graph data and return nodes with x,y.
 * OpenSpec: layout spec — thin wrapper over @antv/layout.
 */
import { CircularLayout, ConcentricLayout, DagreLayout, D3ForceLayout, ForceLayout, ForceAtlas2Layout, FruchtermanLayout, GridLayout, MDSLayout, RandomLayout, RadialLayout, } from '@antv/layout';
const LAYOUT_MAP = {
    circular: CircularLayout,
    concentric: ConcentricLayout,
    dagre: DagreLayout,
    'd3-force': D3ForceLayout,
    force: ForceLayout,
    'force-atlas2': ForceAtlas2Layout,
    fruchterman: FruchtermanLayout,
    grid: GridLayout,
    mds: MDSLayout,
    random: RandomLayout,
    radial: RadialLayout,
};
/**
 * Run the configured layout on graph data; returns nodes with positions.
 * Layout options are passed through to the underlying @antv/layout algorithm.
 */
export async function runLayout(data, config) {
    const LayoutClass = LAYOUT_MAP[config.type] ?? RandomLayout;
    const { type, ...opts } = config;
    const layout = new LayoutClass(opts);
    const layoutData = {
        nodes: data.nodes.map((n) => ({ ...n, x: n.x ?? 0, y: n.y ?? 0 })),
        edges: data.edges.map((e) => ({ ...e, id: `${e.source}-${e.target}` })),
    };
    await layout.execute(layoutData);
    const posMap = new Map();
    layout.forEachNode((node) => {
        posMap.set(node.id, [node.x, node.y]);
    });
    const nodes = data.nodes.map((n) => {
        const pos = posMap.get(n.id) ?? [0, 0];
        return { ...n, x: pos[0], y: pos[1] };
    });
    return { nodes };
}
//# sourceMappingURL=runLayout.js.map