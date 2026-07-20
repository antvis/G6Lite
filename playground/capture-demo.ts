const originalGetContext = HTMLCanvasElement.prototype.getContext;

HTMLCanvasElement.prototype.getContext = function (
  this: HTMLCanvasElement,
  kind: string,
  attrs?: WebGLContextAttributes,
) {
  if (kind === 'webgl' || kind === 'webgl2' || kind === 'experimental-webgl') {
    return originalGetContext.call(this, kind, { ...attrs, preserveDrawingBuffer: true });
  }
  return originalGetContext.call(this, kind, attrs);
} as typeof HTMLCanvasElement.prototype.getContext;

declare global {
  interface Window {
    __ready?: boolean;
    __captureError?: string;
  }
}

const demoAliases: Record<string, string> = {
  'g6-v5-compat': 'custom-node-extension',
};

function normalizeDemoId(id: string) {
  return demoAliases[id] ?? id;
}

const settleDelays: Record<string, number> = {
  'real-dataset': 1200,
  'large-labeled': 1500,
};

async function main() {
  const { demos } = await import('./demos/index.ts');
  const requested = normalizeDemoId(window.location.hash.slice(1) || 'basic');
  const demo = demos.find((item) => item.id === requested);
  const stage = document.getElementById('stage')!;

  if (!demo) {
    throw new Error(`Unknown demo: ${requested}`);
  }

  stage.innerHTML = '';
  await demo.run(stage);

  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, settleDelays[requested] ?? 450));

  document.querySelectorAll<HTMLElement>('[data-capture-ignore]').forEach((element) => {
    element.style.display = 'none';
  });

  await new Promise((resolve) => requestAnimationFrame(resolve));

  window.__ready = true;
}

main().catch((error) => {
  window.__captureError = error instanceof Error ? error.stack ?? error.message : String(error);
  const stage = document.getElementById('stage');
  if (stage) {
    stage.innerHTML = `<pre style="padding:16px;color:#d4380d;white-space:pre-wrap">${window.__captureError}</pre>`;
  }
});
