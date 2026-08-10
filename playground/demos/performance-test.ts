export async function run(container: string | HTMLElement) {
  const containerEl =
    typeof container === 'string' ? document.querySelector<HTMLElement>(container)! : container;
  const frame = document.createElement('iframe');
  frame.title = 'G6Lite Performance Benchmark';
  frame.src = new URL('./performance.html', window.location.href).href;
  frame.style.cssText = 'width:100%;height:100%;border:0;background:#f5f5f5;';
  containerEl.replaceChildren(frame);

  const ready = new Promise<void>((resolve, reject) => {
    frame.addEventListener('load', () => resolve(), { once: true });
    frame.addEventListener('error', () => reject(new Error('Failed to load performance benchmark')), {
      once: true,
    });
  });

  return {
    ready,
    destroy() {
      frame.remove();
    },
  };
}
