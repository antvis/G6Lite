const packageJson = JSON.stringify({
  name: 'g6lite-example',
  private: true,
  type: 'module',
  scripts: { dev: 'vite --host', build: 'vite build' },
  dependencies: { '@antv/g6-lite': '0.1.0', 'lil-gui': '^0.21.0' },
  devDependencies: { vite: '5.4.21' },
}, null, 2);

export function ExampleStackBlitz({
  label,
  title,
  entry,
  helper,
}: {
  label: string;
  title: string;
  entry: { name: string; source: string };
  helper: { name: string; source: string };
}) {
  const files = {
    'package.json': packageJson,
    'vite.config.ts': "import { defineConfig } from 'vite';\n\nexport default defineConfig({ worker: { format: 'es' } });\n",
    'index.html': `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>G6Lite example</title>
  </head>
  <body style="margin: 0">
    <div id="container" style="height: 100vh"></div>
    <script type="module" src="/main.ts"></script>
  </body>
</html>
`,
    'main.ts': `import { run } from './${entry.name}';\n\nvoid run('#container');\n`,
    [entry.name]: entry.source,
    [helper.name]: helper.source,
  };

  return (
    <form
      action={`https://stackblitz.com/run?file=${encodeURIComponent(entry.name)}`}
      method="post"
      rel="noopener noreferrer"
      target="_blank"
    >
      <input type="hidden" name="project[title]" value={title} />
      <input type="hidden" name="project[template]" value="node" />
      {Object.entries(files).map(([name, source]) => (
        <input key={name} type="hidden" name={`project[files][${name}]`} value={source} />
      ))}
      <button className="example-utility-button" type="submit">
        {label}<span aria-hidden="true">↗</span>
      </button>
    </form>
  );
}
