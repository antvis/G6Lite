# 示例总览 (/docs/examples)





这里展示的是从 `playground/demos` 真实渲染出来的示例。每个示例都有截图、核心代码、运行入口和完整源码入口。

<div className="example-grid">
  <a className="example-card" href="withBasePath('/docs/examples/basic')">
    <img src="withBasePath('/examples/basic.png')" alt="最简示例" />

    <span className="example-card-body">
      <span className="example-card-kicker">
        基础
      </span>

      <span className="example-card-title">
        最简示例
      </span>

      <span className="example-card-desc">
        用最少配置渲染一个可缩放、可拖拽的关系图。
      </span>
    </span>
  </a>

  <a className="example-card" href="withBasePath('/docs/examples/node-style')">
    <img src="withBasePath('/examples/node-style.png')" alt="节点样式" />

    <span className="example-card-body">
      <span className="example-card-kicker">
        样式
      </span>

      <span className="example-card-title">
        节点样式
      </span>

      <span className="example-card-desc">
        按业务字段动态设置节点颜色、尺寸和高亮交互。
      </span>
    </span>
  </a>

  <a className="example-card" href="withBasePath('/docs/examples/edge-arrows')">
    <img src="withBasePath('/examples/edge-arrows.png')" alt="箭头方向" />

    <span className="example-card-body">
      <span className="example-card-kicker">
        边
      </span>

      <span className="example-card-title">
        箭头方向
      </span>

      <span className="example-card-desc">
        展示无箭头、单向箭头、双向箭头和粗边箭头。
      </span>
    </span>
  </a>

  <a className="example-card" href="withBasePath('/docs/examples/layouts')">
    <img src="withBasePath('/examples/layouts.png')" alt="布局切换" />

    <span className="example-card-body">
      <span className="example-card-kicker">
        布局
      </span>

      <span className="example-card-title">
        布局切换
      </span>

      <span className="example-card-desc">
        在同一份数据上切换 circular、force、grid、dagre。
      </span>
    </span>
  </a>

  <a className="example-card" href="withBasePath('/docs/examples/tooltip')">
    <img src="withBasePath('/examples/tooltip.png')" alt="Tooltip 浮层" />

    <span className="example-card-body">
      <span className="example-card-kicker">
        交互
      </span>

      <span className="example-card-title">
        Tooltip 浮层
      </span>

      <span className="example-card-desc">
        悬停节点或边时显示自定义业务信息。
      </span>
    </span>
  </a>

  <a className="example-card" href="withBasePath('/docs/examples/combo')">
    <img src="withBasePath('/examples/combo.png')" alt="Combo 分组容器" />

    <span className="example-card-body">
      <span className="example-card-kicker">
        进阶
      </span>

      <span className="example-card-title">
        Combo 分组容器
      </span>

      <span className="example-card-desc">
        节点分组、嵌套、折叠展开和整体拖拽。
      </span>
    </span>
  </a>

  <a className="example-card" href="withBasePath('/docs/examples/parallel-edges')">
    <img src="withBasePath('/examples/parallel-edges.png')" alt="平行边自动错开" />

    <span className="example-card-body">
      <span className="example-card-kicker">
        进阶
      </span>

      <span className="example-card-title">
        平行边自动错开
      </span>

      <span className="example-card-desc">
        处理同源同目标的多条边与反向边。
      </span>
    </span>
  </a>

  <a className="example-card" href="withBasePath('/docs/examples/real-dataset')">
    <img src="withBasePath('/examples/real-dataset.png')" alt="真实数据集" />

    <span className="example-card-body">
      <span className="example-card-kicker">
        大图
      </span>

      <span className="example-card-title">
        真实数据集
      </span>

      <span className="example-card-desc">
        使用 sigma 同款真实数据验证 G6-GL 的大图渲染。
      </span>
    </span>
  </a>
</div>

## 全部示例源码 [#全部示例源码]

完整示例源码位于 [playground/demos](https://github.com/antvis/G6Lite/tree/master/playground/demos)。运行本地 playground 后，可以通过 `http://localhost:5179/#<demo-id>` 打开指定示例。

```bash
npm run dev
```
