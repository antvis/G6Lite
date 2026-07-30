import Image from 'next/image';

import { localizedPath, type Locale } from '@/lib/i18n';
import {
  getExamplesByCategory,
  localizedExamplePath,
  localizedText,
  siteExampleCategories,
  siteExamples,
} from '@/lib/site-examples';
import { withBasePath } from '@/lib/shared';

export function ExamplesCenter({ locale }: { locale: Locale }) {
  const copy =
    locale === 'zh'
      ? {
          eyebrow: 'G6-GL 图表示例',
          title: '从真实运行效果理解图可视化 API',
          description:
            '按能力分类浏览示例，进入详情页直接体验图形交互、查看源码与数据，不需要跳转到研发 Playground。',
          examples: '个官网示例',
          categories: '个能力分类',
          detail: '查看示例详情',
          docs: '阅读快速开始',
        }
      : {
          eyebrow: 'G6-GL graph examples',
          title: 'Learn graph visualization APIs through live examples',
          description:
            'Browse examples by capability, then run the graph, inspect source and data, and interact without leaving the website.',
          examples: 'website examples',
          categories: 'capability groups',
          detail: 'Open example',
          docs: 'Read quick start',
        };

  return (
    <main className="examples-center">
      <section className="examples-center-hero">
        <div>
          <span className="examples-center-eyebrow">{copy.eyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <div className="examples-center-actions">
            <a href="#example-categories">{copy.detail}</a>
            <a href={withBasePath(localizedPath('/docs/getting-started/quick-start', locale))}>
              {copy.docs}
            </a>
          </div>
        </div>
        <div className="examples-center-summary" aria-label={copy.eyebrow}>
          <div>
            <strong>{siteExamples.length}</strong>
            <span>{copy.examples}</span>
          </div>
          <div>
            <strong>{siteExampleCategories.length}</strong>
            <span>{copy.categories}</span>
          </div>
        </div>
      </section>

      <nav className="examples-category-nav" aria-label={copy.eyebrow}>
        {siteExampleCategories.map((category) => (
          <a href={`#${category.id}`} key={category.id}>
            {localizedText(category.title, locale)}
          </a>
        ))}
      </nav>

      <div id="example-categories" className="examples-category-sections">
        {siteExampleCategories.map((category) => {
          const examples = getExamplesByCategory(category.id);
          if (examples.length === 0) return null;

          const groups = Array.from(
            new Map(examples.map((example) => [localizedText(example.group, locale), example.group])).values(),
          );

          return (
            <section className="examples-category-section" id={category.id} key={category.id}>
              <header className="examples-category-heading">
                <span>{String(siteExampleCategories.indexOf(category) + 1).padStart(2, '0')}</span>
                <div>
                  <h2>{localizedText(category.title, locale)}</h2>
                  <p>{localizedText(category.description, locale)}</p>
                </div>
              </header>

              {groups.map((group) => {
                const groupName = localizedText(group, locale);
                const groupExamples = examples.filter(
                  (example) => localizedText(example.group, locale) === groupName,
                );

                return (
                  <div className="examples-topic" key={groupName}>
                    <h3>{groupName}</h3>
                    <div className="examples-card-grid">
                      {groupExamples.map((example) => (
                        <a
                          className="examples-center-card"
                          href={withBasePath(localizedExamplePath(example.id, locale))}
                          key={example.id}
                        >
                          <span className="examples-center-card-image">
                            <Image
                              src={withBasePath(`/examples/${example.id}.png`)}
                              alt={localizedText(example.title, locale)}
                              width={960}
                              height={600}
                              loading={example.id === siteExamples[0]?.id ? 'eager' : 'lazy'}
                              unoptimized
                            />
                          </span>
                          <span className="examples-center-card-body">
                            <span className="examples-center-card-title">
                              {localizedText(example.title, locale)}
                            </span>
                            <span className="examples-center-card-description">
                              {localizedText(example.description, locale)}
                            </span>
                            <span className="examples-center-card-tags">
                              {example.tags.slice(0, 3).map((tag) => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </main>
  );
}
