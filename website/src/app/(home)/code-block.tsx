import { codeToHtml } from 'shiki';

/**
 * 服务端语法高亮代码块(构建时渲染,零客户端 JS)。
 * 双主题:浅色 github-light / 暗色 github-dark,跟随 .dark class 切换。
 * 外层套 mac 窗口标题栏,与首页轻卡片风格统一。
 */
export async function CodeBlock({
  code,
  lang = 'ts',
  filename = 'graph.ts',
}: {
  code: string;
  lang?: string;
  filename?: string;
}) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: 'github-light', dark: 'github-dark' },
    defaultColor: false,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-fd-border bg-fd-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-fd-border bg-fd-background px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-xs text-fd-muted-foreground">{filename}</span>
      </div>
      <div
        className="shiki-host overflow-x-auto bg-fd-secondary p-5 text-sm leading-relaxed sm:p-6"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
