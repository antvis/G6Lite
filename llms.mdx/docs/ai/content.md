# G6Lite AI 使用指南 (/docs/ai)



## AI Skill [#ai-skill]

G6Lite 提供了一个 [AI Skill](https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph)（`antv-g6lite-graph`），可以帮你在项目中创建关系图、给现有图添加拖拽和缩放等交互，以及排查渲染问题。

### 安装和使用 [#安装和使用]

在项目目录运行下面的命令，将 Skill 安装到支持 Skill 的编程助手中。

```bash
npx skills add antvis/G6Lite --skill antv-g6lite-graph
```

安装后，在编程助手中打开项目，并在请求里指定使用 `antv-g6lite-graph`。新建图时，提供一份节点和边的数据样例，以及想要的布局和交互。修改现有图时，给出组件路径和需要保留的行为。排查问题时，附上报错和复现步骤。

### 示例提示词 [#示例提示词]

```text
请使用 G6Lite Skill（antv-g6lite-graph），根据项目安装的 @antv/g6-lite 版本实现一个 React + TypeScript 组件。
- 初始显示 A、B、C 三个节点，以及 A→B、A→C 两条边。
- 让节点环形排列并显示 ID，支持缩放、平移和拖拽节点。
- 加一个「添加节点」按钮。点击后新增节点 D 和边 B→D，保留画布的缩放和位置。
- 在浏览器中创建图，组件卸载时清理画布和事件监听。
给出完整组件和运行方式。
```

## Sive 在线问答 [#sive-在线问答]

想先查清楚某个 API 怎么用，或找一段可以参考的示例，可以打开 [Sive 在线问答](https://sive.antv.antgroup.com/qa)，直接用自然语言提问。遇到具体项目问题时，带上 G6Lite 版本、使用的框架和相关代码片段。

下面三个问题可以直接复制到 Sive。

* 「G6Lite 怎么开启节点拖拽？请给出最小配置。」
* 「用 `setData()` 更新节点和边时，怎么保留画布的缩放和位置？请给一段示例。」
* 「在 React 里切换页面时，应该在哪里调用 `destroy()`？如果图还没渲染完，要怎么处理？」

拿到示例后，可以对照[交互配置](/docs/api/options#options-behaviors)、[setData()](/docs/api/graph#graph-data-mutations-setdata)或[destroy()](/docs/api/graph#graph-lifecycle-destroy)，再把相关代码放到项目里运行。
