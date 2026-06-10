import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { AISearch, AISearchPanel, AISearchTrigger } from '@/components/ai/search';
import { MessageCircleIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  // 顶部导航栏复用首页的 HomeLayout(nd-nav),保证全站顶栏布局一致;
  // 内层 DocsLayout 只负责侧边栏:不传 links(否则会在侧栏顶部重复渲染顶栏链接),
  // 关闭其自带顶栏,并隐藏侧栏底部的搜索/主题控件(这些由顶栏 HomeLayout 提供)。
  return (
    <HomeLayout {...baseOptions()}>
      <DocsLayout
        tree={source.getPageTree()}
        nav={{ enabled: false }}
        searchToggle={{ enabled: false }}
        themeSwitch={{ enabled: false }}
      >
        <AISearch>
          <AISearchPanel />
          <AISearchTrigger
            position="float"
            className={cn(
              buttonVariants({
                variant: 'secondary',
                className: 'text-fd-muted-foreground rounded-2xl',
              }),
            )}
          >
            <MessageCircleIcon className="size-4.5" />
            Ask AI
          </AISearchTrigger>
        </AISearch>

        {children}
      </DocsLayout>
    </HomeLayout>
  );
}
