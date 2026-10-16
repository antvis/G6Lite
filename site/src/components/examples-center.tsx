'use client';

import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { useMemo, useState, type CSSProperties } from 'react';

import exampleCrops from '@/data/example-crops';

import { localizedPath, type Locale } from '@/lib/i18n';
import {
  getExamplesByCategory,
  localizedExamplePath,
  localizedText,
  siteExampleCategories,
  siteExamples,
} from '@/lib/site-examples';
import { withBasePath } from '@/lib/shared';

const crops = exampleCrops as Record<
  string,
  { width: number; height: number; left: number; top: number; cropWidth: number; cropHeight: number }
>;

export function ExamplesCenter({ locale }: { locale: Locale }) {
  const [query, setQuery] = useState('');
  const copy =
    locale === 'zh'
      ? {
          back: '返回文档',
          directory: '图表示例',
          search: '搜索示例、能力或 API',
          eyebrow: 'G6Lite 图表示例',
          title: '图表示例',
          description:
            '按能力浏览可直接运行的图可视化示例。查看真实效果、源码与数据，快速理解每个公开 API 的使用方式。',
          examples: '官网示例',
          categories: '能力分类',
          empty: '没有找到匹配的示例，请尝试其他关键词。',
          open: '查看示例',
        }
      : {
          back: 'Back to docs',
          directory: 'Graph examples',
          search: 'Search examples, capabilities, or APIs',
          eyebrow: 'G6Lite graph examples',
          title: 'Graph examples',
          description:
            'Browse live graph visualization examples by capability. Inspect real output, source, and data to understand each public API.',
          examples: 'website examples',
          categories: 'capability groups',
          empty: 'No examples match this search. Try another keyword.',
          open: 'View example',
        };

  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchedExamples = useMemo(() => {
    if (!normalizedQuery) return siteExamples;

    return siteExamples.filter((example) => {
      const category = siteExampleCategories.find((item) => item.id === example.category);
      const haystack = [
        localizedText(example.title, locale),
        localizedText(example.description, locale),
        localizedText(example.group, locale),
        category ? localizedText(category.title, locale) : '',
        ...example.tags,
      ]
        .join(' ')
        .toLocaleLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [locale, normalizedQuery]);

  return (
    <main className="examples-center">
      <div className="examples-center-layout">
        <aside className="examples-center-directory">
          <div className="examples-center-directory-sticky">
            <a className="examples-center-back" href={withBasePath(localizedPath('/docs', locale))}>
              <span aria-hidden="true">←</span>
              {copy.back}
            </a>
            <h2>{copy.directory}</h2>
            <label className="examples-center-search">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label={copy.search}
                placeholder={copy.search}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <nav aria-label={copy.directory}>
              {siteExampleCategories.map((category) => (
                <a href={`#${category.id}`} key={category.id}>
                  <span>{localizedText(category.title, locale)}</span>
                  <small>{getExamplesByCategory(category.id).length}</small>
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <div className="examples-center-content">
          <header className="examples-center-header">
            <div>
              <span className="examples-center-eyebrow">{copy.eyebrow}</span>
              <h1>{copy.title}</h1>
              <p>{copy.description}</p>
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
          </header>

          <div id="example-categories" className="examples-category-sections">
            {siteExampleCategories.map((category, categoryIndex) => {
              const examples = getExamplesByCategory(category.id).filter((example) =>
                matchedExamples.includes(example),
              );
              if (examples.length === 0) return null;

              return (
                <section className="examples-category-section" id={category.id} key={category.id}>
                  <header className="examples-category-heading">
                    <div className="examples-category-title">
                      <span>{String(categoryIndex + 1).padStart(2, '0')}</span>
                      <h2>{localizedText(category.title, locale)}</h2>
                    </div>
                    <p>{localizedText(category.description, locale)}</p>
                    <small>{examples.length}</small>
                  </header>

                  <div className="examples-card-grid">
                    {examples.map((example) => {
                      const crop = crops[example.id];
                      return (
                      <a
                        className="examples-center-card"
                        href={withBasePath(localizedExamplePath(example.id, locale))}
                        key={example.id}
                      >
                        <span className="examples-center-card-image">
                          {crop ? (
                            <span
                              className="examples-center-card-crop"
                              style={{ '--crop-ratio': crop.cropWidth / crop.cropHeight } as CSSProperties}
                            >
                              <Image
                                src={withBasePath(`/examples/${example.id}.png`)}
                                alt={localizedText(example.title, locale)}
                                width={crop.width}
                                height={crop.height}
                                loading={example.id === siteExamples[0]?.id ? 'eager' : 'lazy'}
                                unoptimized
                                style={{
                                  width: `${(crop.width / crop.cropWidth) * 100}%`,
                                  height: `${(crop.height / crop.cropHeight) * 100}%`,
                                  left: `${(-crop.left / crop.cropWidth) * 100}%`,
                                  top: `${(-crop.top / crop.cropHeight) * 100}%`,
                                }}
                              />
                            </span>
                          ) : null}
                        </span>
                        <span className="examples-center-card-body">
                          <span className="examples-center-card-title-row">
                            <span className="examples-center-card-title">
                              {localizedText(example.title, locale)}
                            </span>
                            <span className="examples-center-card-action">
                              <span>{copy.open}</span>
                              <ArrowUpRight aria-hidden="true" />
                            </span>
                          </span>
                          <span className="examples-center-card-description">
                            {localizedText(example.description, locale)}
                          </span>
                        </span>
                      </a>
                      );
                    })}
                  </div>
                </section>
              );
            })}
            {matchedExamples.length === 0 ? <p className="examples-center-empty">{copy.empty}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
