'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useLayoutEffect, useMemo, useState } from 'react';
import { localizedPath, type Locale } from '@/lib/i18n';
import { getSiteExample, localizedExamplePath, localizedText, siteExampleCategories, siteExamples } from '@/lib/site-examples';
import { withBasePath } from '@/lib/shared';

const STORAGE_KEY = 'g6lite-example-directory-open';

function readOpenCategories(): string[] {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export function ExampleDirectory({ locale }: { locale: Locale }) {
  const id = useSelectedLayoutSegment();
  const activeCategory = id ? getSiteExample(id)?.category : undefined;
  const [query, setQuery] = useState('');
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>();
  const search = query.trim().toLocaleLowerCase();
  const zh = locale === 'zh';
  const directoryLabel = zh ? '示例目录' : 'Example directory';
  const searchLabel = zh ? '搜索示例、能力或 API' : 'Search examples, capabilities, or APIs';

  useLayoutEffect(() => {
    setOpenCategories((previous) => {
      const categories = previous ?? readOpenCategories();
      return activeCategory && !categories.includes(activeCategory) ? [...categories, activeCategory] : categories;
    });
  }, [id, activeCategory]);

  useLayoutEffect(() => {
    if (!openCategories) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(openCategories));
    } catch {
      // The directory still works when session storage is unavailable.
    }
  }, [openCategories]);

  const entries = useMemo(() => {
    if (!search) return siteExamples;
    return siteExamples.filter((item) => [
      localizedText(item.title, locale),
      localizedText(item.description, locale),
      localizedText(item.group, locale),
      ...item.tags,
    ].join(' ').toLocaleLowerCase().includes(search));
  }, [locale, search]);

  return (
    <aside className="example-directory">
      <div className="example-directory-sticky">
        <div className="example-directory-header">
          <Link className="example-directory-back" href={localizedPath('/docs/examples', locale)}>
            <span aria-hidden="true">←</span>
            {zh ? '示例总览' : 'All examples'}
          </Link>
          <button
            aria-expanded={directoryOpen}
            className="example-directory-toggle"
            onClick={() => setDirectoryOpen((value) => !value)}
            type="button"
          >
            {directoryOpen ? (zh ? '收起示例目录' : 'Close directory') : (zh ? '浏览示例目录' : 'Browse directory')}
          </button>
        </div>
        <div className={`example-directory-body${directoryOpen ? ' is-open' : ''}`}>
          <h2>{directoryLabel}</h2>
          <label className="example-directory-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label={searchLabel}
              placeholder={searchLabel}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <noscript>
            <style>{'.example-directory nav { visibility: visible !important; }'}</style>
          </noscript>
          <nav aria-label={directoryLabel} data-directory-ready={openCategories ? '' : undefined}>
            {siteExampleCategories.map((category) => {
              const items = entries.filter((item) => item.category === category.id);
              if (!items.length) return null;
              const open = openCategories?.includes(category.id) ?? category.id === activeCategory;
              return (
                <details key={category.id} data-example-category={category.id} open={Boolean(search) || open}>
                  <summary onClick={(event) => {
                    event.preventDefault();
                    if (search) return;
                    setOpenCategories((previous = []) => open
                      ? previous.filter((item) => item !== category.id)
                      : [...previous, category.id]);
                  }}>
                    <span>{localizedText(category.title, locale)}</span>
                    <small>{items.length}</small>
                  </summary>
                  <div>
                    {items.map((item) => (
                      <Link
                        aria-current={item.id === id ? 'page' : undefined}
                        href={localizedExamplePath(item.id, locale)}
                        key={item.id}
                        prefetch={false}
                        scroll={false}
                      >
                        <span className="example-directory-thumb">
                          <Image src={withBasePath(`/examples/${item.id}.png`)} alt="" fill sizes="3.5rem" unoptimized />
                        </span>
                        <span>
                          <strong>{localizedText(item.title, locale)}</strong>
                          <small>{localizedText(item.group, locale)}</small>
                        </span>
                      </Link>
                    ))}
                  </div>
                </details>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
}
