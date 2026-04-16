/**
 * Demo 列表：名称与 run 函数
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
import basicSource from './basic.ts?raw';
import nodeStyleSource from './node-style.ts?raw';
import layoutsSource from './layouts.ts?raw';
import themeSource from './theme.ts?raw';
import behaviorsSource from './behaviors.ts?raw';
import largeSource from './large.ts?raw';
import largeLabeledSource from './large-labeled.ts?raw';
import shapesSource from './shapes.ts?raw';
import hoverSource from './hover.ts?raw';

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
  { id: 'shapes', name: '图形类型', run: shapes.run, source: shapesSource },
  { id: 'large', name: '较大规模 (200节点)', run: large.run, source: largeSource },
  { id: 'large-labeled', name: '5000 节点 + 标签', run: largeLabeled.run, source: largeLabeledSource },
];
