import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function writeJsonReport(report, outputDirectory, basename) {
  await mkdir(outputDirectory, { recursive: true });
  const outputPath = path.join(outputDirectory, `${basename}.json`);
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return outputPath;
}
