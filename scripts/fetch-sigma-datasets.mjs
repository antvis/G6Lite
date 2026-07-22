/**
 * 拉取 sigma.js 官网首页所用的两个真实图数据集,并转换成 G6-GL 的 GraphData 格式,
 * 供 playground 压测页 / 大图 demo 使用。
 *
 * 数据来源(均为 sigma.js 官方仓库,MIT License):
 *  1. Wikipedia 数据可视化网络(v3 官网首页)   2085 节点 / 5409 边
 *     https://github.com/jacomyal/sigma.js/blob/main/packages/demo/public/dataset.json
 *  2. 高被引 AI 论文引用/合著网络(v4 官网首页)  8797 节点 / 71076 边
 *     https://github.com/jacomyal/sigma.js/tree/v4/packages/website/public/data
 *       - demo-nodes.csv  (label,x,y,score,class,year,citations,title,doi)
 *       - demo-edges.csv  (source,target,type)  type: c=cites, a=coauthored
 *
 * 节点保留 sigma 预跑好的 ForceAtlas2 坐标(x/y)与聚类(data.cluster),
 * 因此压测页既可「直接用预置布局」,也可「忽略坐标重跑 layout」。
 *
 * 运行: node scripts/fetch-sigma-datasets.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../playground/datasets');
const RAW_DIR = resolve(OUT_DIR, 'raw');

const SRC = {
  wikipedia: 'https://raw.githubusercontent.com/jacomyal/sigma.js/main/packages/demo/public/dataset.json',
  aiNodes: 'https://raw.githubusercontent.com/jacomyal/sigma.js/v4/packages/website/public/data/demo-nodes.csv',
  aiEdges: 'https://raw.githubusercontent.com/jacomyal/sigma.js/v4/packages/website/public/data/demo-edges.csv',
};

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} -> HTTP ${res.status}`);
  return res.text();
}

/** 最小 CSV 行解析:支持双引号包裹与转义 ""。 */
function parseCSVRow(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

/** 1. Wikipedia: sigma JSON -> G6-GL GraphData */
function convertWikipedia(json) {
  const raw = JSON.parse(json);
  const clusterColor = Object.fromEntries((raw.clusters ?? []).map((c) => [c.key, c.color]));
  const nodes = raw.nodes.map((n) => ({
    id: n.key,
    name: n.label,
    x: n.x,
    y: n.y,
    data: {
      cluster: n.cluster,
      tag: n.tag,
      url: n.URL,
      score: n.score,
      color: clusterColor[n.cluster],
    },
  }));
  // sigma 的 edges 是 [source, target] 数组对
  const edges = raw.edges.map(([source, target]) => ({ source, target }));
  return { nodes, edges };
}

/** 2. AI papers: nodes.csv + edges.csv -> G6-GL GraphData(节点 id = 行号) */
function convertAIPapers(nodesCsv, edgesCsv) {
  const nodeLines = nodesCsv.trim().split('\n').slice(1);
  const edgeLines = edgesCsv.trim().split('\n').slice(1);

  const nodes = nodeLines.map((line, i) => {
    const f = parseCSVRow(line);
    return {
      id: String(i),
      name: f[7] || f[0], // title 优先,退回 label
      x: parseFloat(f[1]),
      y: parseFloat(f[2]),
      data: {
        cluster: f[4], // class
        author: f[0],
        score: parseFloat(f[3]),
        year: f[5] ? parseInt(f[5], 10) : undefined,
        citations: f[6] ? parseInt(f[6], 10) : undefined,
        doi: f[8] || undefined,
      },
    };
  });

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = [];
  for (const line of edgeLines) {
    const [source, target, type] = line.split(',');
    if (nodeIds.has(source) && nodeIds.has(target)) {
      edges.push({ source, target, data: { type: type === 'a' ? 'coauthored' : 'cites' } });
    }
  }
  return { nodes, edges };
}

async function main() {
  mkdirSync(RAW_DIR, { recursive: true });

  console.log('↓ 下载 Wikipedia 数据集 ...');
  const wikiRaw = await fetchText(SRC.wikipedia);
  writeFileSync(resolve(RAW_DIR, 'wikipedia.sigma.json'), wikiRaw);

  console.log('↓ 下载 AI papers 数据集 ...');
  const [aiNodesRaw, aiEdgesRaw] = await Promise.all([fetchText(SRC.aiNodes), fetchText(SRC.aiEdges)]);
  writeFileSync(resolve(RAW_DIR, 'ai-papers-nodes.csv'), aiNodesRaw);
  writeFileSync(resolve(RAW_DIR, 'ai-papers-edges.csv'), aiEdgesRaw);

  console.log('⇄ 转换为 G6-GL GraphData ...');
  const wiki = convertWikipedia(wikiRaw);
  const ai = convertAIPapers(aiNodesRaw, aiEdgesRaw);

  writeFileSync(resolve(OUT_DIR, 'wikipedia.json'), JSON.stringify(wiki));
  writeFileSync(resolve(OUT_DIR, 'ai-papers.json'), JSON.stringify(ai));

  const fmt = (n) => n.toLocaleString('en-US');
  console.log('\n✔ 完成:');
  console.log(`  playground/datasets/wikipedia.json   ${fmt(wiki.nodes.length)} 节点 / ${fmt(wiki.edges.length)} 边`);
  console.log(`  playground/datasets/ai-papers.json   ${fmt(ai.nodes.length)} 节点 / ${fmt(ai.edges.length)} 边`);
}

main().catch((err) => {
  console.error('✖ 失败:', err.message);
  process.exit(1);
});
