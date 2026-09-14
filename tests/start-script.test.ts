/**
 * start.sh / stop.sh flag surface for a second HTTP instance.
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

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

describe('start.sh isolated instance flags', () => {
  it('usage names --build, ephemeral --host-port=0, and a distinct --name', () => {
    const out = help(START);
    expect(out).toContain('--build[=DIR]');
    expect(out).toContain('--host-port=0');
    expect(out).toContain('workflow-server-trial');
    expect(out).toContain('workflow-server:local');
    expect(out).toContain('reload-exp-sidecar.sh');
  });

  it('refuses --host-port=0 without -d', () => {
    const result = runStart(['--host-port=0', '--no-update-workflows', '--dry-run']);
    expect(result.status).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/ephemeral port and requires -d/);
  });
});

describe('stop.sh isolated instance flags', () => {
  it('usage tells the operator to match start.sh --name', () => {
    const out = help(STOP);
    expect(out).toContain('--name=NAME');
    expect(out).toContain('Match start.sh --name');
  });
});
