/**
 * reload-exp-sidecar.sh flag surface and safety refusals.
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SCRIPT = resolve(ROOT, 'scripts/reload-exp-sidecar.sh');

function run(
  args: string[],
  env: NodeJS.ProcessEnv = {},
): { status: number; stderr: string; stdout: string } {
  try {
    const stdout = execFileSync('bash', [SCRIPT, ...args], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status?: number; stderr?: string; stdout?: string };
    return { status: e.status ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
}

function withCorpus(): string {
  const tmp = mkdtempSync(join(tmpdir(), 'reload-exp-sidecar-'));
  mkdirSync(join(tmp, 'corpus'));
  return tmp;
}

describe('reload-exp-sidecar.sh', () => {
  it('parses as bash', () => {
    execFileSync('bash', ['-n', SCRIPT]);
  });

  it('usage names the required flags and the install-instance refusal', () => {
    const out = run(['--help']);
    expect(out.status).toBe(0);
    expect(out.stdout).toContain('--name=NAME');
    expect(out.stdout).toContain('--workflows-dir=CORPUS');
    expect(out.stdout).toContain('--image=IMAGE');
    expect(out.stdout).toContain('--host-port=N');
    expect(out.stdout).toContain('--no-build');
    expect(out.stdout).toContain('workflow-server');
    expect(out.stdout).toContain('3000');
  });

  it('refuses a missing --name', () => {
    const result = run(['--workflows-dir=/no/such/corpus', '--host-port=32772']);
    expect(result.status).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/pass --name/);
  });

  it('refuses the install container name', () => {
    const corpus = withCorpus();
    try {
      const result = run([
        '--name=workflow-server',
        `--workflows-dir=${corpus}`,
        '--host-port=32772',
      ]);
      expect(result.status).not.toBe(0);
      expect(`${result.stderr}${result.stdout}`).toMatch(/install container name/);
    } finally {
      rmSync(corpus, { recursive: true, force: true });
    }
  });

  it('refuses a missing corpus', () => {
    const result = run([
      '--name=workflow-server-exp',
      '--workflows-dir=/no/such/corpus',
      '--host-port=32772',
    ]);
    expect(result.status).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/not a directory|corpus not found/);
  });

  it('refuses host port 3000', () => {
    const corpus = withCorpus();
    try {
      const result = run([
        '--name=workflow-server-exp',
        `--workflows-dir=${corpus}`,
        '--host-port=3000',
      ]);
      expect(result.status).not.toBe(0);
      expect(`${result.stderr}${result.stdout}`).toMatch(/refusing to bind an experiment sidecar on :3000/);
    } finally {
      rmSync(corpus, { recursive: true, force: true });
    }
  });

  it('accepts EXP_* environment fallbacks in place of flags', () => {
    const result = run([], {
      EXP_NAME: 'workflow-server-exp',
      EXP_CORPUS: '/no/such/corpus',
      EXP_HOST_PORT: '32772',
    });
    expect(result.status).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/not a directory|corpus not found/);
  });
});
