import { codeToHtml } from 'shiki';

/**
 * 服务端语法高亮代码块(构建时渲染,零客户端 JS)。
 * 首页 terminal 风格跟随站点主题:浅色页用浅色代码面板,深色页用深色面板。
 */
export async function LegacyCodeBlock({
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
    <div className="home-terminal">
      <div className="home-terminal-glow" />
      <div className="home-terminal-bar">
        <div className="home-terminal-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <span className="home-terminal-title">{filename}</span>
        <span className="home-terminal-status">
          <span aria-hidden />
          WebGL ready
        </span>
      </div>
      <div
        className="shiki-host home-terminal-code overflow-x-auto text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
