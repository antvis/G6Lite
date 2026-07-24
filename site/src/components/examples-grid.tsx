import catalog from '../../../playground/demos/catalog.json';
import { withBasePath } from '@/lib/shared';
import Image from 'next/image';

const categoryLabels: Record<string, string> = {
  'getting-started': '基础',
  node: '节点',
  edge: '边',
  layout: '布局',
  interaction: '交互',
  combo: '进阶',
  dataset: '大图',
};

export function ExamplesGrid() {
  const examples = catalog.filter((demo) => demo.audiences.includes('site'));

  return (
    <div className="example-grid">
      {examples.map((demo) => (
        <a className="example-card" href={withBasePath(`/docs/examples/${demo.id}`)} key={demo.id}>
          <Image
            src={withBasePath(`/examples/${demo.id}.png`)}
            alt={demo.title}
            width={960}
            height={600}
            unoptimized
          />
          <span className="example-card-body">
            <span className="example-card-kicker">
              {categoryLabels[demo.category] ?? demo.category}
            </span>
            <span className="example-card-title">{demo.title}</span>
            <span className="example-card-desc">{demo.description}</span>
          </span>
        </a>
      ))}
    </div>
  );
}
