import { codeToHtml } from 'shiki';

/** Build-time syntax highlighting for the homepage terminal. */
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
