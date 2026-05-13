/**
 * Benchmark script to measure first render performance
 * Run: node performance/benchmark-render.js
 */

import { createRequire } from 'module';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body><canvas id="canvas" width="800" height="600"></canvas></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.HTMLCanvasElement = dom.window.HTMLCanvasElement;
global.WebGLRenderingContext = class MockWebGL {
  constructor() {
    this.COLOR_BUFFER_BIT = 0x00004000;
    this.TRIANGLES = 0x0004;
    this.LINES = 0x0001;
    this.STATIC_DRAW = 0x88E4;
    this.FLOAT = 0x1406;
    this.SRC_ALPHA = 0x0302;
    this.ONE_MINUS_SRC_ALPHA = 0x0303;
    this.BLEND = 0x0BE2;
    this.VERTEX_SHADER = 0x8B31;
    this.FRAGMENT_SHADER = 0x8B30;
    this.COMPILE_STATUS = 0x8B81;
    this.LINK_STATUS = 0x8B82;
  }
  getContextAttributes() { return { alpha: true }; }
  getExtension() { return null; }
  getParameter(p) {
    if (p === 0x1F00) return ['WebGL Mock']; // VENDOR
    if (p === 0x1F01) return ['WebGL Mock']; // RENDERER
    if (p === 0x1F02) return 'WebGL 1.0'; // VERSION
    return 0;
  }
  createShader() { return { id: Math.random() }; }
  shaderSource() {}
  compileShader() {}
  getShaderParameter() { return true; }
  createProgram() { return { id: Math.random() }; }
  attachShader() {}
  linkProgram() {}
  getProgramParameter() { return true; }
  getAttribLocation() { return 0; }
  getUniformLocation() { return { id: Math.random() }; }
  createBuffer() { return { id: Math.random() }; }
  bindBuffer() {}
  bufferData() {}
  enableVertexAttribArray() {}
  vertexAttribPointer() {}
  useProgram() {}
  uniform1i() {}
  uniform2f() {}
  uniform1f() {}
  uniformMatrix3fv() {}
  drawArrays() {}
  enable() {}
  disable() {}
  blendFunc() {}
  viewport() {}
  clearColor() {}
  clear() {}
  deleteBuffer() {}
  deleteProgram() {}
};

// Mock canvas getContext
dom.window.HTMLCanvasElement.prototype.getContext = function(type) {
  if (type === 'webgl' || type === 'experimental-webgl') {
    return new global.WebGLRenderingContext();
  }
  return null;
};

// Generate test data
function generateData(nodeCount, edgeCount) {
  const nodes = [];
  const edges = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: `node-${i}`,
      x: Math.random() * 800,
      y: Math.random() * 600,
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
      target: `node-${target}`,
      data: {}
    });
  }

  return { nodes, edges };
}

// Benchmark function
async function benchmark(nodeCount, edgeCount) {
  const { Renderer } = await import('../dist/renderer/renderer.js');

  const canvas = document.getElementById('canvas');
  const renderer = new Renderer(canvas);

  const data = generateData(nodeCount, edgeCount);

  const start = performance.now();

  renderer.updateData({
    nodes: data.nodes,
    edges: data.edges,
    theme: {
      nodeFill: '#5B8FF9',
      nodeSize: 24,
      edgeStroke: '#e2e2e2',
      edgeLineWidth: 1
    }
  });

  // Force process
  renderer.draw();

  const end = performance.now();

  return {
    nodeCount,
    edgeCount,
    totalMs: Math.round(end - start)
  };
}

// Run benchmarks
async function run() {
  console.log('G6Lite First Render Benchmark\n');
  console.log('Note: This measures process() time (CPU/GPU buffer building)');
  console.log('      Actual WebGL rendering is mocked.\n');

  const scenarios = [
    { nodes: 1000, edges: 3000 },
    { nodes: 5000, edges: 15000 },
  ];

  for (const { nodes, edges } of scenarios) {
    console.log(`Testing ${nodes} nodes, ${edges} edges...`);
    try {
      const result = await benchmark(nodes, edges);
      console.log(`  Result: ${result.totalMs}ms\n`);
    } catch (e) {
      console.log(`  Error: ${e.message}\n`);
    }
  }
}

run().catch(console.error);
