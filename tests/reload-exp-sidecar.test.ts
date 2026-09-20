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

/** Whether `name` resolves on PATH — the preflight sits behind the script's own docker/curl checks. */
function onPath(name: string): boolean {
  try {
    execFileSync('bash', ['-c', `command -v ${name}`], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const canReachPreflight = onPath('docker') && onPath('curl');

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
    expect(out.stdout).toContain('--rebuild-image');
    expect(out.stdout).toContain('workflow-server');
    expect(out.stdout).toContain('3000');
  });

  it('usage names the projects root, the log directory and the preflight opt-out', () => {
    const out = run(['--help']);
    expect(out.stdout).toContain('--projects-root=DIR');
    expect(out.stdout).toContain('--log-dir=DIR');
    expect(out.stdout).toContain('--no-preflight');
    // The check exists to answer whether a server can serve the corpus, not whether the corpus is
    // the one this repo ships — the help has to say which, or the escape reads as the normal path.
    expect(out.stdout.replace(/\s+/g, ' ')).toContain('load, resolve and parse');
    const flowed = out.stdout.replace(/\s+/g, ' ');
    expect(flowed).toContain('compiles the engine checkout on the host');
    expect(flowed).toContain('dist bind');
    expect(flowed).toContain('lockfile-triggered image rebuild');
    expect(flowed).toContain('do not compile on the host');
    expect(flowed).toContain("this script's start.sh is used so a host compile still binds");
    expect(flowed).toContain('Skips host compile and serves the image-baked dist');
  });

  it('usage asks only for --name, the corpus and port defaulting to the container record', () => {
    const out = run(['--help']);
    expect(out.stdout).toMatch(/Required:\s*\n\s*--name=NAME[^\n]*\n\s*\n/);
    // The record outlives the container running, so the help must not promise a running one. Read
    // against collapsed whitespace: the promise is the contract, where the help wraps it is not.
    const flowed = out.stdout.replace(/\s+/g, ' ');
    expect(flowed).toContain('Defaults to the corpus the named container binds, running or exited');
    expect(flowed).toContain('Defaults to the binding the named container records, running or exited');
  });

  it('refuses --no-build together with --rebuild-image', () => {
    const result = run([
      '--name=workflow-server-exp',
      '--host-port=32772',
      '--no-build',
      '--rebuild-image',
    ]);
    expect(result.status).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/cannot be combined/);
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

  it('asks for a corpus when no container of that name binds one', () => {
    const result = run(['--name=reload-exp-sidecar-absent', '--host-port=32772']);
    expect(result.status).not.toBe(0);
    expect(`${result.stderr}${result.stdout}`).toMatch(/pass --workflows-dir \(no corpus bind/);
  });

  it('refuses a projects root that is not a directory', () => {
    const corpus = withCorpus();
    try {
      const result = run([
        '--name=workflow-server-exp',
        `--workflows-dir=${corpus}`,
        '--host-port=32772',
        '--projects-root=/no/such/projects',
      ]);
      expect(result.status).not.toBe(0);
      expect(`${result.stderr}${result.stdout}`).toMatch(/projects root is not a directory/);
    } finally {
      rmSync(corpus, { recursive: true, force: true });
    }
  });

  // The corpus holds no workflow, so every corpus guard reports it unmeasurable. The refusal lands
  // before the stop, which is what leaves a running sidecar up when a reload is aimed at a tree
  // nothing can be served from.
  it.skipIf(!canReachPreflight)('refuses a corpus the guard sweep cannot measure', () => {
    const corpus = withCorpus();
    try {
      const result = run([
        '--name=reload-exp-sidecar-absent',
        `--workflows-dir=${corpus}`,
        '--host-port=32772',
        '--no-build',
      ]);
      expect(result.status).not.toBe(0);
      expect(`${result.stderr}${result.stdout}`).toMatch(/could not be measured \(guard sweep exit 2\)/);
      expect(`${result.stderr}${result.stdout}`).toMatch(/nothing has been stopped/);
    } finally {
      rmSync(corpus, { recursive: true, force: true });
    }
  }, 120_000);

  // Each pairs the new flag with a refusal that fires before the flag is acted on, so the parse is
  // proved without a container being stopped or started.
  it.each([
    '--no-preflight',
    '--log-dir=/tmp/reload-exp-sidecar-logs',
    '--projects-root=/tmp',
    '--rebuild-image',
  ])(
    'parses %s',
    (flag) => {
      const result = run([flag, '--name=workflow-server', '--host-port=32772']);
      expect(`${result.stderr}${result.stdout}`).not.toMatch(/unknown option/);
      expect(`${result.stderr}${result.stdout}`).toMatch(/install container name/);
    },
  );
});
