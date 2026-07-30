import { getDocsNavigationTree } from '@/lib/docs-tree';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { HomeLayout } from 'fumadocs-ui/layouts/home';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  const tree = getDocsNavigationTree(source.getPageTree('zh'), 'zh');

  // 顶部导航栏复用首页的 HomeLayout(nd-nav),保证全站顶栏布局一致;
  // 内层 DocsLayout 只负责侧边栏:不传 links(否则会在侧栏顶部重复渲染顶栏链接),
  // 关闭其自带顶栏,并隐藏侧栏底部的搜索/主题控件(这些由顶栏 HomeLayout 提供)。
  return (
    <HomeLayout {...baseOptions('zh')}>
      <DocsLayout
        tree={tree}
        nav={{ enabled: false }}
        searchToggle={{ enabled: false }}
        themeSwitch={{ enabled: false }}
      >
        {children}
      </DocsLayout>
    </HomeLayout>
  );
}
