'use client';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Framework } from 'fumadocs-core/framework';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

// Fumadocs owns the navigation links, so configure its link adapter as well as
// the homepage CTAs. Keep document-to-document prefetching on its default path.
const NavigationLink: NonNullable<Framework['Link']> = ({ href = '#', prefetch, ...props }) => {
  const pathname = usePathname();
  const homepage = pathname === '/' || pathname === '/en' || pathname === '/en/';
  return <Link {...props} href={href} prefetch={homepage ? false : prefetch} />;
};

export function Provider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh';

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  return (
    <RootProvider
      components={{ Link: NavigationLink }}
      search={{ enabled: false }}
      i18n={{
        locale,
        locales: [
          { locale: 'zh', name: '中文' },
          { locale: 'en', name: 'English' },
        ],
        onLocaleChange(nextLocale) {
          const withoutEnglishPrefix = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
          router.push(
            nextLocale === 'en'
              ? `/en${withoutEnglishPrefix === '/' ? '' : withoutEnglishPrefix}`
              : withoutEnglishPrefix,
          );
        },
        translations:
          locale === 'zh'
            ? {
                displayName: '中文',
                toc: '目录',
                tocNoHeadings: '本页没有目录',
                tocInline: '本页目录',
                nextPage: '下一页',
                previousPage: '上一页',
                chooseLanguage: '选择语言',
                chooseTheme: '选择主题',
                editOnGithub: '在 GitHub 编辑',
                themeToggle: '切换主题',
                menuToggle: '切换菜单',
                codeBlockCopy: '复制代码',
                codeBlockCopied: '已复制',
                pageActionsCopyMarkdown: '复制 Markdown',
                sidebarOpen: '打开目录',
                sidebarCollapse: '收起目录',
              }
            : undefined,
      }}
    >
      {children}
    </RootProvider>
  );
}
