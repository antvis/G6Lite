/**
 * Demo list
 */
import * as basic from './basic.ts';
import * as nodeStyle from './node-style.ts';
import * as layouts from './layouts.ts';
import * as theme from './theme.ts';
import * as behaviors from './behaviors.ts';
import * as large from './large.ts';
import * as largeLabeled from './large-labeled.ts';
import * as shapes from './shapes.ts';
import * as hover from './hover.ts';
import * as tooltip from './tooltip.ts';
import * as edgeStates from './edge-states.ts';
import * as edgeTypes from './edge-types.ts';
import * as edgeColors from './edge-colors.ts';
import * as edgeArrows from './edge-arrows.ts';
import * as edgeLoops from './edge-loops.ts';
import * as nodeStates from './node-states.ts';
import * as nodeBorder from './node-border.ts';
import * as flowchart from './flowchart.ts';
import * as relationship from './relationship.ts';
import * as orgChart from './org-chart.ts';
import * as indentedTree from './indented-tree.ts';
import * as mindmap from './mindmap.ts';
import * as fishbone from './fishbone.ts';
import * as performanceTest from './performance-test.ts';
import * as setData from './set-data.ts';
import * as labels from './labels.ts';
import * as combo from './combo.ts';
import * as realDataset from './real-dataset.ts';
import basicSource from './basic.ts?raw';
import nodeStyleSource from './node-style.ts?raw';
import layoutsSource from './layouts.ts?raw';
import themeSource from './theme.ts?raw';
import behaviorsSource from './behaviors.ts?raw';
import largeSource from './large.ts?raw';
import largeLabeledSource from './large-labeled.ts?raw';
import shapesSource from './shapes.ts?raw';
import hoverSource from './hover.ts?raw';
import tooltipSource from './tooltip.ts?raw';
import edgeStatesSource from './edge-states.ts?raw';
import edgeTypesSource from './edge-types.ts?raw';
import edgeColorsSource from './edge-colors.ts?raw';
import edgeArrowsSource from './edge-arrows.ts?raw';
import edgeLoopsSource from './edge-loops.ts?raw';
import nodeStatesSource from './node-states.ts?raw';
import nodeBorderSource from './node-border.ts?raw';
import flowchartSource from './flowchart.ts?raw';
import relationshipSource from './relationship.ts?raw';
import orgChartSource from './org-chart.ts?raw';
import indentedTreeSource from './indented-tree.ts?raw';
import mindmapSource from './mindmap.ts?raw';
import fishboneSource from './fishbone.ts?raw';
import performanceTestSource from './performance-test.ts?raw';
import setDataSource from './set-data.ts?raw';
import labelsSource from './labels.ts?raw';
import comboSource from './combo.ts?raw';
import realDatasetSource from './real-dataset.ts?raw';

export interface DemoItem {
  id: string;
  name: string;
  run: (container: string | HTMLElement) => Promise<{ destroy?: () => void } | { destroy: () => void }>;
  source?: string;
}

export const demos: DemoItem[] = [
  { id: 'basic', name: '最简示例', run: basic.run, source: basicSource },
  { id: 'node-style', name: '节点样式', run: nodeStyle.run, source: nodeStyleSource },
  { id: 'layouts', name: '布局切换', run: layouts.run, source: layoutsSource },
  { id: 'theme', name: '主题切换', run: theme.run, source: themeSource },
  { id: 'behaviors', name: '交互高亮', run: behaviors.run, source: behaviorsSource },
  { id: 'hover', name: 'Hover 高亮', run: hover.run, source: hoverSource },
  { id: 'tooltip', name: 'Tooltip 浮层', run: tooltip.run, source: tooltipSource },
  { id: 'shapes', name: '图形类型', run: shapes.run, source: shapesSource },
  { id: 'large', name: '较大规模 (200节点)', run: large.run, source: largeSource },
  { id: 'large-labeled', name: '5000 节点 + 标签', run: largeLabeled.run, source: largeLabeledSource },
  { id: 'edge-states', name: '边状态 + 权重矩阵', run: edgeStates.run, source: edgeStatesSource },
  { id: 'edge-types', name: '边类型 (直线/虚线/弧线)', run: edgeTypes.run, source: edgeTypesSource },
  { id: 'edge-colors', name: '边颜色 (分类色板)', run: edgeColors.run, source: edgeColorsSource },
  { id: 'edge-arrows', name: '箭头方向', run: edgeArrows.run, source: edgeArrowsSource },
  { id: 'edge-loops', name: '自环边 (嵌套)', run: edgeLoops.run, source: edgeLoopsSource },
  { id: 'node-states', name: '节点状态 (6态)', run: nodeStates.run, source: nodeStatesSource },
  { id: 'node-border', name: '节点边框 + 圆角', run: nodeBorder.run, source: nodeBorderSource },
  { id: 'flowchart', name: '流程图 (决策树)', run: flowchart.run, source: flowchartSource },
  { id: 'relationship', name: '人物关系网络图', run: relationship.run, source: relationshipSource },
  { id: 'org-chart', name: '组织架构图', run: orgChart.run, source: orgChartSource },
  { id: 'indented-tree', name: '缩进树 (目录结构)', run: indentedTree.run, source: indentedTreeSource },
  { id: 'mindmap', name: '思维导图', run: mindmap.run, source: mindmapSource },
  { id: 'fishbone', name: '鱼骨图', run: fishbone.run, source: fishboneSource },
  { id: 'performance', name: '性能测试', run: performanceTest.run, source: performanceTestSource },
  { id: 'set-data', name: 'setData + layout()', run: setData.run, source: setDataSource },
  { id: 'labels', name: '标签 + 图标', run: labels.run, source: labelsSource },
  { id: 'combo', name: 'Combo 分组容器', run: combo.run, source: comboSource },
  { id: 'real-dataset', name: '真实数据集 (sigma 同款 8.8K 节点)', run: realDataset.run, source: realDatasetSource },
];
