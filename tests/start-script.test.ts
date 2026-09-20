/**
 * start.sh / stop.sh flag surface for a second HTTP instance.
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const START = resolve(ROOT, 'scripts/start.sh');
const STOP = resolve(ROOT, 'scripts/stop.sh');

function help(script: string): string {
  return execFileSync('bash', [script, '--help'], { encoding: 'utf8' });
}

function runStart(args: string[]): { status: number; stderr: string; stdout: string } {
  try {
    const stdout = execFileSync('bash', [START, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stderr?: string; stdout?: string };
    return { status: e.status ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
}

function onPath(name: string): boolean {
  try {
    execFileSync('bash', ['-c', `command -v ${name}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const canDryRun = onPath('docker');

describe('start.sh isolated instance flags', () => {
  it('usage names --build, ephemeral --host-port=0, and a distinct --name', () => {
    const out = help(START);
    expect(out).toContain('--build[=DIR]');
    expect(out).toContain('--dist-dir=PATH');
    expect(out).toContain('--host-port=0');
    expect(out).toContain('workflow-server-trial');
    expect(out).toContain('workflow-server:local');
    expect(out).toContain('reload-exp-sidecar.sh --name=NAME');
    expect(out).not.toContain('--image=IMAGE --workflows-dir=CORPUS');
  });

  it('refuses --host-port=0 without -d', () => {
    const result = runStart(['--host-port=0', '--no-update-workflows', '--dry-run']);
    expect(result.status).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/ephemeral port and requires -d/);
  });

  it.skipIf(!canDryRun)('refuses --dist-dir without index.js', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'start-dist-'));
    try {
      mkdirSync(join(tmp, 'corpus'));
      mkdirSync(join(tmp, 'dist'));
      mkdirSync(join(tmp, 'projects'));
      const result = runStart([
        '--dry-run',
        '-d',
        '--no-update-workflows',
        '--no-pull',
        `--workflows-dir=${join(tmp, 'corpus')}`,
        `--dist-dir=${join(tmp, 'dist')}`,
        `--projects-root=${join(tmp, 'projects')}`,
        '--name=workflow-server-trial',
        '--host-port=32772',
      ]);
      expect(result.status).not.toBe(0);
      expect(`${result.stderr}${result.stdout}`).toMatch(/no index\.js/);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it.skipIf(!canDryRun)('dry-run binds --dist-dir onto /app/dist', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'start-dist-'));
    const dist = join(tmp, 'dist');
    try {
      mkdirSync(join(tmp, 'corpus'));
      mkdirSync(dist);
      mkdirSync(join(tmp, 'projects'));
      writeFileSync(join(dist, 'index.js'), 'export {}\n');
      const result = runStart([
        '--dry-run',
        '-d',
        '--no-update-workflows',
        '--no-pull',
        `--workflows-dir=${join(tmp, 'corpus')}`,
        `--dist-dir=${dist}`,
        `--projects-root=${join(tmp, 'projects')}`,
        '--name=workflow-server-trial',
        '--host-port=32772',
      ]);
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(`${dist}:/app/dist:ro`);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('stop.sh isolated instance flags', () => {
  it('usage tells the operator to match start.sh --name', () => {
    const out = help(STOP);
    expect(out).toContain('--name=NAME');
    expect(out).toContain('Match start.sh --name');
  });
});
