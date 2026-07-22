import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import process from 'node:process';

const require = createRequire(import.meta.url);

function readGit(args, fallback = 'unknown') {
  try {
    return execFileSync('git', args, { encoding: 'utf8' }).trim() || fallback;
  } catch {
    return fallback;
  }
}

export async function collectNodeEnvironment(mode) {
  const packageJson = JSON.parse(
    await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
  );
  const benchmarkPackage = require('benchmark/package.json');
  return {
    runtime: 'node',
    mode,
    generatedAt: new Date().toISOString(),
    gitCommit: readGit(['rev-parse', 'HEAD']),
    gitBranch: readGit(['branch', '--show-current']),
    worktreeDirty: readGit(['status', '--porcelain'], '') !== '',
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    benchmarkVersion: benchmarkPackage.version,
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    osRelease: os.release(),
    cpuModel: os.cpus()[0]?.model ?? 'unknown',
    cpuCount: os.cpus().length,
  };
}
