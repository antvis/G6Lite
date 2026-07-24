const e=`import { Graph } from '../../src/index.ts';
import type { EdgeLabelPlacement } from '../../src/index.ts';
import { buttonStyle, createDemoPanel } from './demo-panel.ts';

export async function run(container: string | HTMLElement) {
  let placement: EdgeLabelPlacement = 'center';
  const graph = new Graph({
    container,
    data: {
      nodes: [
        { id: 'single', x: 360, y: 290, data: { label: '1 条自环' } },
        { id: 'triple', x: 540, y: 290, data: { label: '3 条自环' } },
        { id: 'five', x: 720, y: 290, data: { label: '5 条自环' } },
      ],
      edges: [
        { id: 's-1', source: 'single', target: 'single', data: { label: 'S1' } },
        ...Array.from({ length: 3 }, (_, index) => ({
          id: \`t-\${index}\`,
          source: 'triple',
          target: 'triple',
          data: { label: \`T\${index + 1}\` },
        })),
        ...Array.from({ length: 5 }, (_, index) => ({
          id: \`f-\${index}\`,
          source: 'five',
          target: 'five',
          data: { label: \`F\${index + 1}\` },
        })),
      ],
    },
    node: {
      style: {
        size: 34,
        fill: '#1677ff',
        label: (node) => String(node.data?.label),
        labelPlacement: 'bottom',
      },
    },
    edge: {
      style: {
        stroke: '#7c3aed',
        lineWidth: 2,
        label: (_source, _target, edge) => String(edge.data?.label),
        labelPlacement: () => placement,
        labelBackground: '#fff',
        labelBackgroundPadding: 2,
      },
    },
    behaviors: ['zoom-canvas', 'drag-canvas', 'drag-node'],
  });
  await graph.render();

  const ui = createDemoPanel(
    container,
    '自环边标签',
    '标签应沿真实自环曲线定位，不能覆盖节点中心。拖动节点后仍应跟随。',
    \`\${(['start', 'center', 'end'] as EdgeLabelPlacement[])
      .map((value) => \`<button data-placement="\${value}" style="\${buttonStyle}">\${value}</button>\`)
      .join('')}\`,
  );
  const render = () => ui.setStatus(\`labelPlacement: \${placement}\\n标签位于自环曲线上且多环分离即 PASS\`);
  ui.controls.querySelectorAll<HTMLElement>('[data-placement]').forEach((button) => {
    button.addEventListener('click', () => {
      placement = button.dataset.placement as EdgeLabelPlacement;
      graph.updateOptions({
        edge: { style: { labelPlacement: () => placement } },
      });
      render();
    });
  });
  render();

  return { destroy: () => { graph.destroy(); ui.panel.remove(); } };
}
`;export{e as default};
