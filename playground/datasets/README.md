# Playground 数据集

供压测页(`bench.html`)与示例页(`real-dataset` demo)使用的**真实图数据集**,
取自 [sigma.js](https://github.com/jacomyal/sigma.js) 官方仓库官网首页同款数据(MIT License),
用于和 sigma.js 在相同数据上做横向性能/效果对比。

## 文件

| 文件 | 节点 | 边 | 来源 |
| --- | --- | --- | --- |
| `wikipedia.json` | 2,085 | 5,409 | sigma v3 官网首页:数据可视化维基百科网络(Sciences-Po médialab) |
| `ai-papers.json` | 8,798 | 71,077 | sigma v4 官网首页:高被引 AI 论文引用 / 合著网络 |
| `raw/` | — | — | 转换前的原始文件(sigma JSON / CSV),仅作溯源,运行时不使用 |

两个数据集的节点都自带 sigma 预跑好的 **ForceAtlas2 坐标**(`x` / `y`)与聚类(`data.cluster`),
因此压测时既可「直接复用预置布局」,也可「忽略坐标重跑 layout」。

## 数据格式

转换后为 G6-GL 标准 `GraphData`:

```jsonc
{
  "nodes": [
    { "id": "0", "name": "Deep Residual Learning…", "x": -6251.5, "y": 16.4,
      "data": { "cluster": "0", "author": "…", "year": 2016, "citations": 215357 } }
  ],
  "edges": [
    { "source": "0", "target": "8797", "data": { "type": "cites" } }
  ]
}
```

## 重新生成

```bash
node scripts/fetch-sigma-datasets.mjs
```

脚本会重新下载原始数据并转换。转换逻辑见 `scripts/fetch-sigma-datasets.mjs`。
