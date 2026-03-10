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

export interface DemoItem {
  id: string;
  name: string;
  run: (container: string | HTMLElement) => Promise<{ destroy?: () => void } | { destroy: () => void }>;
}

export const demos: DemoItem[] = [
  { id: 'basic', name: '最简示例', run: basic.run },
  { id: 'node-style', name: '节点样式', run: nodeStyle.run },
  { id: 'layouts', name: '布局切换', run: layouts.run },
  { id: 'theme', name: '主题', run: theme.run },
  { id: 'behaviors', name: '交互高亮', run: behaviors.run },
  { id: 'large', name: '较大规模', run: large.run },
  { id: 'large-labeled', name: '5000 节点 + 标签', run: largeLabeled.run },
];
