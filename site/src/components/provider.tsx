'use client';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

export function Provider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const locale = pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'zh';

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
  }, [locale]);

  return (
    <RootProvider
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
