import benchmarkTemplate from '../tests/perf/browser/bench.html?raw';
import aiPapersUrl from './datasets/ai-papers.json?url';
import wikipediaUrl from './datasets/wikipedia.json?url';

async function main(): Promise<void> {
  const template = new DOMParser().parseFromString(benchmarkTemplate, 'text/html');
  const style = template.head.querySelector('style');
  if (style) document.head.appendChild(style.cloneNode(true));
  document.body.innerHTML = template.body.innerHTML;
  document.querySelector('script[src="./bench-main.ts"]')?.remove();

  const wikipediaInput = document.getElementById('ds-wikipedia') as HTMLInputElement | null;
  const aiPapersInput = document.getElementById('ds-ai-papers') as HTMLInputElement | null;
  if (wikipediaInput) wikipediaInput.value = wikipediaUrl;
  if (aiPapersInput) aiPapersInput.value = aiPapersUrl;

  await import('../tests/perf/browser/bench-main.ts');
}

void main();
