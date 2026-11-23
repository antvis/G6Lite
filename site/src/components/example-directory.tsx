'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { useLayoutEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { localizedPath, type Locale } from '@/lib/i18n';
import { getSiteExample, localizedExamplePath, localizedText, siteExampleCategories, siteExamples } from '@/lib/site-examples';
import { withBasePath } from '@/lib/shared';

const STORAGE_KEY = 'g6lite-example-directory-open';
const STORAGE_EVENT = 'g6lite-example-directory-change';
let fallbackSnapshot: string | undefined;

function getOpenCategoriesSnapshot(): string {
  if (fallbackSnapshot !== undefined) return fallbackSnapshot;
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? '[]';
  } catch {
    return '[]';
  }
}

function subscribeOpenCategories(onChange: () => void): () => void {
  window.addEventListener(STORAGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

function writeOpenCategories(categories: string[]): void {
  const snapshot = JSON.stringify(categories);
  try {
    sessionStorage.setItem(STORAGE_KEY, snapshot);
    fallbackSnapshot = undefined;
  } catch {
    // Keep the directory usable when session storage is unavailable.
    fallbackSnapshot = snapshot;
  }
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function parseOpenCategories(snapshot: string): string[] {
  try {
    const value: unknown = JSON.parse(snapshot);
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
  const snapshot = useSyncExternalStore(subscribeOpenCategories, getOpenCategoriesSnapshot, () => null);
  const openCategories = useMemo(() => snapshot === null ? undefined : parseOpenCategories(snapshot), [snapshot]);
  const search = query.trim().toLocaleLowerCase();
  const zh = locale === 'zh';
  const directoryLabel = zh ? '示例目录' : 'Example directory';
  const searchLabel = zh ? '搜索示例、能力或 API' : 'Search examples, capabilities, or APIs';

  useLayoutEffect(() => {
    const categories = parseOpenCategories(getOpenCategoriesSnapshot());
    if (activeCategory && !categories.includes(activeCategory)) {
      writeOpenCategories([...categories, activeCategory]);
    }
  }, [id, activeCategory]);

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
                    const previous = openCategories ?? [];
                    writeOpenCategories(open
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
