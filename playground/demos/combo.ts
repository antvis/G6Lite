/**
 * Combo (Group Container) Demo
 * Demonstrates: combo backgrounds, multi-select drag, collapse/expand, nested combos.
 */

import { Graph } from '../../src/index.ts';

export async function run(container: string | HTMLElement) {
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'n1', comboId: 'frontend', data: { cluster: 'frontend' } },
        { id: 'n2', comboId: 'frontend', data: { cluster: 'frontend' } },
        { id: 'n3', comboId: 'frontend', data: { cluster: 'frontend' } },
        { id: 'n4', comboId: 'backend', data: { cluster: 'backend' } },
        { id: 'n5', comboId: 'backend', data: { cluster: 'backend' } },
        { id: 'n6', comboId: 'backend', data: { cluster: 'backend' } },
        { id: 'n7', comboId: 'database', data: { cluster: 'database' } },
        { id: 'n8', comboId: 'database', data: { cluster: 'database' } },
        { id: 'n9' },
      ],
      edges: [
        { source: 'n1', target: 'n4' },
        { source: 'n2', target: 'n5' },
        { source: 'n3', target: 'n6' },
        { source: 'n4', target: 'n7' },
        { source: 'n5', target: 'n8' },
        { source: 'n6', target: 'n7' },
        { source: 'n9', target: 'n1' },
        { source: 'n9', target: 'n4' },
      ],
      combos: [
        { id: 'frontend', data: { name: 'Frontend' } },
        { id: 'backend', data: { name: 'Backend' } },
        { id: 'database', parentId: 'backend', data: { name: 'Database' } },
      ],
    },
    node: {
      type: 'circle',
      style: {
        size: 20,
        fill: (node) => {
          const cluster = node.data?.cluster;
          if (cluster === 'frontend') return '#5B8FF9';
          if (cluster === 'backend') return '#5AD8A6';
          if (cluster === 'database') return '#F6BD16';
          return '#aaa';
        },
        label: (node) => node.id,
        labelPlacement: 'bottom',
        labelFontSize: 11,
      },
      stateStyles: {
        selected: { stroke: '#1890ff', strokeWidth: 3 },
      },
    },
    edge: {
      style: {
        stroke: '#ccc',
        lineWidth: 1,
        endArrow: true,
      },
    },
    combo: {
      style: {
        fill: 'rgba(100, 150, 255, 0.06)',
        stroke: 'rgba(100, 150, 255, 0.3)',
        strokeWidth: 1,
        borderRadius: 12,
        padding: 30,
        label: (combo) => (combo.data as Record<string, string>)?.name ?? combo.id,
        labelPlacement: 'top',
        labelFontSize: 13,
        labelColor: 'rgba(0, 0, 0, 0.65)',
      },
    },
    layout: { type: 'd3-force' },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node', 'click-select'],
  });

  await graph.render();

  // Control panel
  const panel = document.createElement('div');
  panel.style.cssText =
    'position:absolute;top:10px;right:10px;background:#fff;padding:12px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.15);font-size:13px;z-index:10;';
  panel.innerHTML = `
    <div style="font-weight:600;margin-bottom:8px">Combo Controls</div>
    <button id="btn-collapse-fe">Collapse Frontend</button><br/>
    <button id="btn-expand-fe" style="margin-top:4px">Expand Frontend</button><br/>
    <button id="btn-collapse-be" style="margin-top:4px">Collapse Backend</button><br/>
    <button id="btn-expand-be" style="margin-top:4px">Expand Backend</button><br/>
    <button id="btn-toggle-db" style="margin-top:4px">Toggle Database</button><br/>
    <button id="btn-add-combo" style="margin-top:4px">Move n9 → Frontend</button><br/>
    <button id="btn-remove-combo" style="margin-top:4px">Remove n9 from combo</button>
    <div style="margin-top:8px;color:#666;font-size:11px">
      Tip: Select multiple nodes (click+select),<br/>then drag to move them together.
    </div>
  `;
  const containerEl =
    typeof container === 'string' ? document.querySelector(container)! : container;
  containerEl.style.position = 'relative';
  containerEl.appendChild(panel);

  panel.querySelector('#btn-collapse-fe')!.addEventListener('click', () => {
    graph.collapseCombo('frontend');
  });
  panel.querySelector('#btn-expand-fe')!.addEventListener('click', () => {
    graph.expandCombo('frontend');
  });
  panel.querySelector('#btn-collapse-be')!.addEventListener('click', () => {
    graph.collapseCombo('backend');
  });
  panel.querySelector('#btn-expand-be')!.addEventListener('click', () => {
    graph.expandCombo('backend');
  });
  panel.querySelector('#btn-toggle-db')!.addEventListener('click', () => {
    graph.toggleCombo('database');
  });
  panel.querySelector('#btn-add-combo')!.addEventListener('click', () => {
    graph.addToCombo('n9', 'frontend');
    graph.scheduleRender();
  });
  panel.querySelector('#btn-remove-combo')!.addEventListener('click', () => {
    graph.removeFromCombo('n9');
    graph.scheduleRender();
  });

  return {
    destroy() {
      graph.destroy();
      panel.remove();
    },
  };
}
