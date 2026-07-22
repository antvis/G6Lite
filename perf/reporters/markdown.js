import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

function formatNumber(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : 'n/a';
}

export function renderMarkdownReport(report) {
  const lines = [
    '# G6Lite Performance Report',
    '',
    `- Generated: ${report.environment.generatedAt}`,
    `- Runtime: ${report.environment.runtime}`,
    `- Benchmark.js: ${report.environment.benchmarkVersion}`,
    '',
  ];

  if (report.environment.runtime === 'node') {
    lines.splice(
      4,
      0,
      `- Mode: ${report.environment.mode}`,
      `- Git: ${report.environment.gitCommit}${report.environment.worktreeDirty ? ' (dirty)' : ''}`,
      `- Node: ${report.environment.nodeVersion}`,
      `- Platform: ${report.environment.platform} ${report.environment.architecture}`,
      `- CPU: ${report.environment.cpuModel} × ${report.environment.cpuCount}`,
    );
  } else {
    lines.splice(
      4,
      0,
      `- User agent: ${report.environment.userAgent}`,
      `- Viewport: ${report.environment.viewport?.width} × ${report.environment.viewport?.height}`,
      `- DPR: ${report.environment.devicePixelRatio}`,
    );
  }

  let currentSuite = '';
  for (const result of report.micro) {
    if (result.suite !== currentSuite) {
      currentSuite = result.suite;
      lines.push(`## ${currentSuite}`, '');
    }
    lines.push(
      `### ${result.name}`,
      '',
      `- Scope: ${result.scope}`,
      `- Tier: ${result.tier ?? 'n/a'}`,
      `- Operations/sec: ${formatNumber(result.hz, 0)}`,
      `- Mean: ${formatNumber(result.meanMs, 4)} ms`,
      `- RME: ±${formatNumber(result.rme)}%`,
      `- Samples: ${result.sampleSize}`,
      `- Status: ${result.status}`,
      '',
    );
    if (result.error) lines.push(`- Error: ${result.error}`, '');
  }

  if (report.warnings.length > 0) {
    lines.push('## Warnings', '');
    for (const warning of report.warnings) lines.push(`- ${warning}`);
    lines.push('');
  }

  if (report.scenarios.length > 0) {
    lines.push('## Scenarios', '');
    for (const scenario of report.scenarios) {
      lines.push(
        `### ${scenario.scale.nodes} nodes / ${scenario.scale.edges} edges`,
        '',
        `- First render: ${formatNumber(scenario.firstRender.total)} ms`,
        `- First render p95: ${formatNumber(scenario.firstRender.p95)} ms (${
          scenario.firstRender.samples
        } samples)`,
        `- Layout: ${formatNumber(scenario.firstRender.layout)} ms`,
        `- Render excluding layout: ${formatNumber(scenario.firstRender.render)} ms`,
        `- Highlight median: ${formatNumber(scenario.highlight.median)} ms`,
        `- Drag FPS: ${formatNumber(scenario.dragFPS, 0)}`,
        `- Drag p95 frame: ${formatNumber(scenario.dragFrame?.p95FrameMs)} ms`,
        `- Drag dropped frames: ${formatNumber(
          (scenario.dragFrame?.droppedFrameRatio ?? 0) * 100,
        )}%`,
        `- Drag Long Tasks: ${scenario.dragFrame?.longTaskCount ?? 0}`,
        `- Zoom FPS: ${formatNumber(scenario.zoomFPS, 0)}`,
        `- Zoom p95 frame: ${formatNumber(scenario.zoomFrame?.p95FrameMs)} ms`,
        `- Zoom dropped frames: ${formatNumber(
          (scenario.zoomFrame?.droppedFrameRatio ?? 0) * 100,
        )}%`,
        `- Zoom Long Tasks: ${scenario.zoomFrame?.longTaskCount ?? 0}`,
        `- Picking median: ${formatNumber(scenario.pickAt.median, 4)} ms`,
        `- Post-destroy heap delta: ${
          scenario.memory?.supported
            ? `${formatNumber(scenario.memory.postDestroyDelta / 1024 / 1024)} MB`
            : 'unsupported'
        }`,
        '- Memory note: this value is a trend signal, not proof of a leak; garbage collection may not have run.',
        '',
      );
    }
  }
  return `${lines.join('\n')}\n`;
}

export async function writeMarkdownReport(report, outputDirectory, basename) {
  await mkdir(outputDirectory, { recursive: true });
  const outputPath = path.join(outputDirectory, `${basename}.md`);
  await writeFile(outputPath, renderMarkdownReport(report), 'utf8');
  return outputPath;
}
