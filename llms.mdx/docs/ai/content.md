# 用 AI 构建 G6Lite 图 (/docs/ai)





<div className="ai-entry-hero not-prose">
  <span>
    AI for graph visualization
  </span>

  <h2>
    把意图变成可验证的关系图
  </h2>

  <div className="ai-entry-description">
    G6Lite Skill 帮助 AI Agent 识别数据规模、布局、交互和浏览器边界，再使用当前包根 API
    生成可以继续验证和迭代的实现。
  </div>

  <div className="ai-entry-actions">
    <a href="https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph">
      查看 G6Lite Skill
    </a>

    <a className="is-secondary" href="https://sive.antv.antgroup.com/qa?message=%E4%BD%BF%E7%94%A8%20G6Lite%20%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E5%85%B3%E7%B3%BB%E5%9B%BE%EF%BC%8C%E5%85%88%E7%A1%AE%E8%AE%A4%E6%95%B0%E6%8D%AE%E8%A7%84%E6%A8%A1%E3%80%81%E5%B8%83%E5%B1%80%E3%80%81%E4%BA%A4%E4%BA%92%E5%92%8C%E5%85%BC%E5%AE%B9%E6%80%A7%E8%A6%81%E6%B1%82%EF%BC%8C%E5%86%8D%E7%BB%99%E5%87%BA%E5%8C%85%E6%A0%B9%20API%20%E7%A4%BA%E4%BE%8B%E3%80%82">
      在 Sive 中开始
    </a>
  </div>
</div>

## 两种使用方式 [#两种使用方式]

<Cards>
  <Card title="本地 Agent + G6Lite Skill" href="https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph">
    让支持 Skill 的 Agent 按 G6Lite 的真实 API、能力边界和性能路径完成开发。
  </Card>

  <Card title="Sive 在线问答" href="https://sive.antv.antgroup.com/qa?message=%E4%BD%BF%E7%94%A8%20G6Lite%20%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E5%85%B3%E7%B3%BB%E5%9B%BE%EF%BC%8C%E5%85%88%E7%A1%AE%E8%AE%A4%E6%95%B0%E6%8D%AE%E8%A7%84%E6%A8%A1%E3%80%81%E5%B8%83%E5%B1%80%E3%80%81%E4%BA%A4%E4%BA%92%E5%92%8C%E5%85%BC%E5%AE%B9%E6%80%A7%E8%A6%81%E6%B1%82%EF%BC%8C%E5%86%8D%E7%BB%99%E5%87%BA%E5%8C%85%E6%A0%B9%20API%20%E7%A4%BA%E4%BE%8B%E3%80%82">
    带着 G6Lite 上下文发起在线提问。回答能力取决于 Sive 当前知识库状态。
  </Card>

  <Card title="理解技术架构" href="/docs/concepts/architecture">
    了解数据、布局、调度、WebGL 渲染、Canvas 信息层与扩展如何协作。
  </Card>
</Cards>

## 在本地使用 Skill [#在本地使用-skill]

将 GitHub 中的 [`skills/antv-g6lite-graph`](https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph)
目录作为 Skill 源交给支持 Skill 的 Agent，然后在任务中显式调用：

```text
Use $antv-g6lite-graph to build a force-directed dependency graph
with hover highlighting and node dragging.
```

也可以直接让 Agent 从 GitHub 安装：

```text
Install the skill from
https://github.com/antvis/G6Lite/tree/master/skills/antv-g6lite-graph
```

Skill 会重点约束：

* 只从 `@antv/g6-lite` 包根导入，不依赖 `src/` 或 `dist/` 深层路径。
* 使用 ESM 和真实浏览器的 DOM、Canvas、WebGL 生命周期。
* 只生成 G6Lite 已支持的节点、边、布局、Behavior、Combo 和扩展能力。
* 区分 G6Lite 与 G6 v5，不机械复制插件、事件或元素配置。
* 对大图优先检查布局、标签密度、增量更新、DPR、GPU 和真实设备。

## 适合交给 Agent 的任务 [#适合交给-agent-的任务]

| 任务       | 推荐提示词重点                           |
| -------- | --------------------------------- |
| 创建关系图    | 数据字段、节点/边数量、布局、容器尺寸               |
| 增加交互     | 选择、拖拽、Tooltip、高亮、框选或套索            |
| 迁移 G6 v5 | 先列能力差异和不支持项，再修改代码                 |
| 排查空白画布   | 容器尺寸、数据端点、WebGL、生命周期和版本           |
| 优化大图     | 首屏、布局、标签、状态 patch、内存和真实设备         |
| 创建扩展     | 扩展类别、生命周期、公开 ExtensionContext 和清理 |

## 推荐工作流 [#推荐工作流]

<div className="ai-workflow not-prose">
  <ol>
    <li>
      <strong>
        澄清输入
      </strong>

      <span>
        确认数据、规模、坐标、布局、交互和运行环境。
      </span>
    </li>

    <li>
      <strong>
        最小渲染
      </strong>

      <span>
        先完成可见、可销毁、只使用包根 API 的最小图。
      </span>
    </li>

    <li>
      <strong>
        逐层增强
      </strong>

      <span>
        依次加入样式、布局、Behavior、状态、Combo 与扩展。
      </span>
    </li>

    <li>
      <strong>
        真实验证
      </strong>

      <span>
        在目标浏览器、DPR、GPU 和容器尺寸下检查结果。
      </span>
    </li>
  </ol>
</div>

AI 生成的代码仍需要类型检查、浏览器验证和业务数据验收。不要把 Agent 输出直接视为生产结果。

## Agent 需要理解的引擎 [#agent-需要理解的引擎]

<ArchitectureDiagram locale="zh" />

架构图只展示稳定职责层。详细的数据流、更新路径和扩展边界见[技术架构](/docs/concepts/architecture)。

## 继续阅读 [#继续阅读]

<Cards>
  <Card title="安装与第一个图" href="/docs/getting-started/quick-start" />

  <Card title="技术架构" href="/docs/concepts/architecture" />

  <Card title="示例中心" href="/docs/examples" />

  <Card title="API 参考" href="/docs/api" />

  <Card title="性能调优" href="/docs/metrics/performance-tuning" />

  <Card title="从 G6 v5 迁移" href="/docs/compatibility/g6-v5-migration" />
</Cards>
