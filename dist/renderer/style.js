/**
 * Resolve style value or function for nodes and edges.
 */
export function resolveNodeStyle(node, config, theme) {
    const fill = resolveStyleValue(config?.style?.fill, node, theme.nodeFill ?? '#5B8FF9');
    const size = resolveStyleValue(config?.style?.size ?? config?.style?.width, node, theme.nodeSize ?? 8);
    return { fill, size: typeof size === 'number' ? size : 8 };
}
export function resolveEdgeStyle(source, target, edge, config, theme) {
    const stroke = resolveEdgeStyleValue(config?.style?.stroke, source, target, edge, theme.edgeStroke ?? '#e2e2e2');
    const lineWidth = resolveEdgeStyleValue(config?.style?.lineWidth, source, target, edge, theme.edgeLineWidth ?? 1);
    return { stroke, lineWidth: typeof lineWidth === 'number' ? lineWidth : 1 };
}
function resolveStyleValue(value, node, fallback) {
    if (value === undefined)
        return fallback;
    return typeof value === 'function' ? value(node) : value;
}
function resolveEdgeStyleValue(value, source, target, edge, fallback) {
    if (value === undefined)
        return fallback;
    return typeof value === 'function' ? value(source, target, edge) : value;
}
//# sourceMappingURL=style.js.map