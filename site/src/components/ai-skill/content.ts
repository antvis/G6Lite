import type { Locale } from '@/lib/i18n';

export const skillName = 'antv-g6lite-graph';
export const skillRepoPath = 'skills/antv-g6lite-graph';
export const skillSourceUrl =
  'https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph';

/** Reserved Sive experience entry for the AI page. */
export const siveExperienceUrl = 'https://sive.antv.antgroup.com/qa';

export const installCommand = 'npx skills add antvis/G6Lite --skill antv-g6lite-graph';

export const installPrompt = `Install the skill from\n${skillSourceUrl}`;

export const invokePrompt = `Use $antv-g6lite-graph to build a force-directed dependency graph.
Read nodes and edges from the data files already in this project, and map id, source, and target. Do not ask me to paste the dataset.
Add hover highlighting and node dragging, give the container an explicit size, and destroy the graph on unmount.`;

const zhInvokePrompt = `使用 $antv-g6lite-graph 做一张力导向依赖图。
节点和边从当前项目里已有的数据文件读取，按 id、source、target 映射，不要让我粘贴数据。
加上悬停高亮和节点拖拽，容器给出明确尺寸，卸载时销毁 Graph。`;

export type TerminalLine = {
  kind: 'blank' | 'command' | 'comment' | 'quote';
  text: string;
};

export function terminalText(lines: TerminalLine[]): string {
  return lines
    .map((line) => {
      if (line.kind === 'blank') return '';
      if (line.kind === 'command') return `$ ${line.text}`;
      return line.text;
    })
    .join('\n');
}

const zh = {
  eyebrow: 'Agent Skill',
  title: '把关系图交给你的 Agent',
  description: '通过 G6Lite Skill，在 AI 里创建、调整和排查关系图。',
  tab: 'Agent Skill',
  cardTitle: '把 G6Lite Skill 交给 Agent',
  cardBody:
    '支持 Skill 的 Agent 会读取 $antv-g6lite-graph。它先确认数据规模、布局、交互和运行环境，再按当前 @antv/g6-lite 包根 API 写出可以继续验证的实现。',
  trySive: '去 Sive 体验',
  readGuide: '阅读 Skill 说明',
  copy: '复制',
  copied: '已复制',
  copyFailed: '复制失败，请手动选择文本。',
  terminalLabel: 'bash',
  terminal: [
    { kind: 'comment', text: '# 为 Agent 安装 Skill' },
    { kind: 'command', text: installCommand },
    { kind: 'blank', text: '' },
    { kind: 'comment', text: '# 然后在新的 Agent 会话里：' },
    { kind: 'quote', text: `"${zhInvokePrompt}"` },
  ] satisfies TerminalLine[],
  usageTitle: '在 AI 里这样用',
  steps: [
    {
      title: '安装 Skill',
      text: '把 antv-g6lite-graph 安装到支持 Skill 的 Agent，或把仓库目录 skills/antv-g6lite-graph 交给它。',
    },
    {
      title: '点名调用',
      text: '示例已经写明数据来源：让 Agent 读取当前项目里的节点和边，不用自己粘贴数据。',
    },
    {
      title: '按边界验收',
      text: '只使用包根 API。先渲染最小 Graph，在有尺寸的浏览器里检查，卸载时销毁实例。',
    },
  ],
  note: 'Agent 写出的代码还需要类型检查、浏览器验证和业务数据验收。',
};

const en: typeof zh = {
  eyebrow: 'Agent Skill',
  title: 'Bring graphs to your agent.',
  description: 'Create, adjust, and troubleshoot relationship graphs with the G6Lite Skill.',
  tab: 'Agent Skill',
  cardTitle: 'Give your agent the G6Lite Skill.',
  cardBody:
    'An agent that supports Skills reads $antv-g6lite-graph. It checks data scale, layout, interactions, and the runtime, then writes an implementation through the current @antv/g6-lite package-root API.',
  trySive: 'Try it in Sive',
  readGuide: 'Read the Skill guide',
  copy: 'copy',
  copied: 'Copied',
  copyFailed: 'Copy failed. Select the text manually.',
  terminalLabel: 'bash',
  terminal: [
    { kind: 'comment', text: '# install the skill for your agent' },
    { kind: 'command', text: installCommand },
    { kind: 'blank', text: '' },
    { kind: 'comment', text: '# then, in a new agent session:' },
    { kind: 'quote', text: `"${invokePrompt}"` },
  ],
  usageTitle: 'Use it in an AI session',
  steps: [
    {
      title: 'Install the Skill',
      text: 'Install antv-g6lite-graph into an agent that supports Skills, or point it at skills/antv-g6lite-graph in this repository.',
    },
    {
      title: 'Invoke it by name',
      text: 'The example already names the data source: the agent reads nodes and edges from this project, so you do not paste the dataset.',
    },
    {
      title: 'Check the boundary',
      text: 'Stay on package-root APIs. Render a minimal Graph, validate it in a sized browser, and destroy the instance on unmount.',
    },
  ],
  note: 'Code from an agent still needs type checking, browser validation, and a review against product data.',
};

export const aiSkillCopy: Record<Locale, typeof zh> = { zh, en };
