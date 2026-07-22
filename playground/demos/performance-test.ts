/**
 * Performance test page for G6-GL
 * Measures first render time and reports results
 */

import { Graph } from '../../src/index.js';

// Generate test data
function generateData(nodeCount: number, edgeCount: number) {
  const nodes: Array<{ id: string; x?: number; y?: number; data?: any }> = [];
  const edges: Array<{ source: string; target: string }> = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node-${i}`,
      data: { label: `Node ${i}` }
    });
  }

  for (let i = 0; i < edgeCount; i++) {
    const source = Math.floor(Math.random() * nodeCount);
    let target = Math.floor(Math.random() * nodeCount);
    while (target === source) {
      target = Math.floor(Math.random() * nodeCount);
    }
    edges.push({
      source: `node-${source}`,
      target: `node-${target}`
    });
  }

  return { nodes, edges };
}

// Run benchmark
async function runBenchmark(nodeCount: number, edgeCount: number, testContainer: HTMLElement): Promise<number> {
  testContainer.innerHTML = ''; // Clear previous
  testContainer.style.display = 'block';

  const graph = new Graph({
    container: testContainer,
    data: generateData(nodeCount, edgeCount),
    theme: 'light',
  });

  const start = performance.now();
  await graph.render();
  const end = performance.now();

  graph.destroy();
  testContainer.style.display = 'none';
  return end - start;

}

// Format number with commas
function formatNumber(n: number): string {
  return n.toLocaleString();
}

// Main
export async function run(container: string | HTMLElement) {
  const containerEl = typeof container === 'string' ? document.querySelector(container) : container;
  if (!containerEl) throw new Error('Container not found');

  // Set innerHTML for the test UI
  (containerEl as HTMLElement).innerHTML = testHtml;
  const output = document.getElementById('output') as HTMLPreElement;
  const runBtn = document.getElementById('runBtn') as HTMLButtonElement;
  const testContainer = document.getElementById('test-container') as HTMLElement;

  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    output.textContent = 'Running benchmarks...\n\n';

    const scenarios = [
      { nodes: 1000, edges: 3000, name: 'Small (1K nodes, 3K edges)' },
      { nodes: 5000, edges: 15000, name: 'Medium (5K nodes, 15K edges)' },
      { nodes: 10000, edges: 30000, name: 'Large (10K nodes, 30K edges)' },
    ];

    for (const scenario of scenarios) {
      output.textContent += `${scenario.name}:\n`;
      output.textContent += `  Generating data...\n`;

      try {
        const times: number[] = [];
        const runs = 3;

        for (let i = 0; i < runs; i++) {
          const time = await runBenchmark(scenario.nodes, scenario.edges, testContainer);
          times.push(time);
          output.textContent += `    Run ${i + 1}: ${time.toFixed(1)}ms\n`;
        }

        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);

        output.textContent += `  Average: ${avg.toFixed(1)}ms (min: ${min.toFixed(1)}ms, max: ${max.toFixed(1)}ms)\n\n`;
      } catch (e) {
        output.textContent += `  Error: ${e}\n\n`;
      }
    }

    output.textContent += 'Benchmark complete!\n';
    runBtn.disabled = false;
  });

  return {
    destroy() {
      // Cleanup if needed
    }
  };
}

// HTML structure for the test page
export const testHtml = `
<div style="padding: 20px; font-family: sans-serif;">
  <h2>G6-GL Performance Test</h2>
  <button id="runBtn" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Run Benchmark</button>
  <pre id="output" style="margin-top: 20px; padding: 15px; background: #f5f5f5; border-radius: 4px; font-family: monospace; white-space: pre-wrap;">Click "Run Benchmark" to start...</pre>
  <div id="test-container" style="width: 800px; height: 600px; border: 1px solid #ddd; margin-top: 20px; display: none;"></div>
</div>
`;
