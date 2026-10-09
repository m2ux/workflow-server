/**
 * reload-exp-sidecar.sh flag surface and safety refusals.
 */
import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { chmodSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SCRIPT = resolve(ROOT, 'tests/scripts/reload-exp-sidecar.sh');

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

/** An executable at `path` that does nothing and succeeds. */
function writeNoop(path: string): void {
  writeFileSync(path, '#!/usr/bin/env bash\nexit 0\n');
  chmodSync(path, 0o755);
}

/**
 * Launchers in `dir` that do nothing, named through the script's own overrides. Without the
 * overrides the script reads start.sh and stop.sh from the docker branch on origin, which a test
 * cannot reach offline.
 */
function stubLaunchers(dir: string): NodeJS.ProcessEnv {
  const start = join(dir, 'start.sh');
  const stop = join(dir, 'stop.sh');
  writeNoop(start);
  writeNoop(stop);
  return { WORKFLOW_SERVER_START: start, WORKFLOW_SERVER_STOP: stop };
}

/**
 * PATH led by `bin`, with stubbed launchers and a readiness probe in `bin` that answers at once, so
 * a run that reaches the start step finishes without a server to wait on.
 */
function stubbedStart(bin: string): NodeJS.ProcessEnv {
  writeNoop(join(bin, 'curl'));
  return { PATH: `${bin}:${process.env.PATH ?? ''}`, ...stubLaunchers(bin) };
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

  it('wipes dist and the incremental tsc cache before host compile', () => {
    const src = readFileSync(SCRIPT, 'utf8');
    expect(src).toMatch(/rm -rf "\$\{engine\}\/dist"/);
    expect(src).toMatch(/rm -f "\$\{engine\}\/tsconfig\.tsbuildinfo"/);
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
    expect(flowed).toContain('Dockerfile');
    expect(flowed).toContain('--docker-branch');
    expect(flowed).toContain('Do not compile on the host');
    expect(flowed).toContain("that branch's start.sh so a host compile still binds");
    expect(flowed).toContain('Skips host compile and serves the image-baked dist');
  });

  it('replaces a launcher that lacks --dist-dir with the selected branch', () => {
    const src = readFileSync(SCRIPT, 'utf8');
    expect(src).toContain('START="$(materialize_runner start.sh)"');
    expect(src).not.toContain('origin docker');
  });

  it('usage asks only for --name, pairing fields defaulting to the container record', () => {
    const out = run(['--help']);
    expect(out.stdout).toMatch(/Required:\s*\n\s*--name=NAME[^\n]*\n\s*\n/);
    // The record outlives the container running, so the help must not promise a running one. Read
    // against collapsed whitespace: the promise is the contract, where the help wraps it is not.
    const flowed = out.stdout.replace(/\s+/g, ' ');
    expect(flowed).toContain('Defaults to the corpus the named container binds, running or exited');
    expect(flowed).toContain('Defaults to the binding the named container records, running or exited');
    expect(flowed).toContain('Defaults to the engine the named container records, running or exited');
    expect(flowed).toContain('Defaults to the image the named container records, running or exited');
    // Later-cycle example is --name alone. The first-pairing block still names --image.
    expect(out.stdout).toMatch(
      /^  tests\/scripts\/reload-exp-sidecar\.sh --name=workflow-server-exp\s*$/m,
    );
  });

  it('inherits the engine checkout from the named container when --build is omitted', () => {
    const bin = mkdtempSync(join(tmpdir(), 'reload-fake-docker-'));
    const docker = join(bin, 'docker');
    writeFileSync(
      docker,
      `#!/usr/bin/env bash
for arg in "$@"; do
  if [[ "$arg" == *engine.dir* ]]; then
    echo /no/such/engine-from-label
    exit 0
  fi
done
exit 1
`,
    );
    chmodSync(docker, 0o755);
    try {
      const result = run(['--name=workflow-server-exp', '--host-port=32772'], {
        PATH: `${bin}:${process.env.PATH ?? ''}`,
      });
      expect(result.status).not.toBe(0);
      expect(`${result.stderr}${result.stdout}`).toMatch(/engine checkout is not a directory/);
      expect(`${result.stderr}${result.stdout}`).toMatch(/engine-from-label/);
    } finally {
      rmSync(bin, { recursive: true, force: true });
    }
  });

  it('keeps an explicit --build over the container engine record', () => {
    const bin = mkdtempSync(join(tmpdir(), 'reload-fake-docker-'));
    const docker = join(bin, 'docker');
    writeFileSync(
      docker,
      `#!/usr/bin/env bash
for arg in "$@"; do
  if [[ "$arg" == *engine.dir* ]]; then
    echo /no/such/engine-from-label
    exit 0
  fi
done
exit 1
`,
    );
    chmodSync(docker, 0o755);
    try {
      const result = run(
        ['--name=workflow-server-exp', '--build=/no/such/explicit-engine', '--host-port=32772'],
        { PATH: `${bin}:${process.env.PATH ?? ''}` },
      );
      expect(result.status).not.toBe(0);
      expect(`${result.stderr}${result.stdout}`).toMatch(/engine checkout is not a directory/);
      expect(`${result.stderr}${result.stdout}`).toMatch(/explicit-engine/);
      expect(`${result.stderr}${result.stdout}`).not.toMatch(/engine-from-label/);
    } finally {
      rmSync(bin, { recursive: true, force: true });
    }
  });

  it('inherits the image from the named container when --image is omitted', () => {
    const bin = mkdtempSync(join(tmpdir(), 'reload-fake-docker-'));
    const docker = join(bin, 'docker');
    const corpus = withCorpus();
    writeFileSync(
      docker,
      `#!/usr/bin/env bash
if [[ "\${1:-}" == inspect ]]; then
  for arg in "$@"; do
    if [[ "$arg" == *'workflow-server.image'* ]]; then
      echo workflow-server:exp-from-label
      exit 0
    fi
  done
fi
exit 1
`,
    );
    chmodSync(docker, 0o755);
    try {
      const result = run(
        [
          '--name=reload-exp-sidecar-image-inherit',
          '--host-port=32773',
          `--workflows-dir=${corpus}`,
          '--no-build',
          '--no-preflight',
        ],
        stubbedStart(bin),
      );
      expect(`${result.stderr}${result.stdout}`).toMatch(
        /image\s+:\s+workflow-server:exp-from-label/,
      );
    } finally {
      rmSync(bin, { recursive: true, force: true });
      rmSync(corpus, { recursive: true, force: true });
    }
  });

  it('keeps an explicit --image over the container image record', () => {
    const bin = mkdtempSync(join(tmpdir(), 'reload-fake-docker-'));
    const docker = join(bin, 'docker');
    const corpus = withCorpus();
    writeFileSync(
      docker,
      `#!/usr/bin/env bash
if [[ "\${1:-}" == inspect ]]; then
  for arg in "$@"; do
    if [[ "$arg" == *'workflow-server.image'* ]]; then
      echo workflow-server:exp-from-label
      exit 0
    fi
  done
fi
exit 1
`,
    );
    chmodSync(docker, 0o755);
    try {
      const result = run(
        [
          '--name=reload-exp-sidecar-image-explicit',
          '--image=workflow-server:explicit-tag',
          '--host-port=32773',
          `--workflows-dir=${corpus}`,
          '--no-build',
          '--no-preflight',
        ],
        stubbedStart(bin),
      );
      expect(`${result.stderr}${result.stdout}`).toMatch(
        /image\s+:\s+workflow-server:explicit-tag/,
      );
      expect(`${result.stderr}${result.stdout}`).not.toMatch(
        /image\s+:\s+workflow-server:exp-from-label/,
      );
    } finally {
      rmSync(bin, { recursive: true, force: true });
      rmSync(corpus, { recursive: true, force: true });
    }
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

  describe('displacement', () => {
    /**
     * A sidecar already serving a corpus, with two sessions standing on it: the bind and its pin
     * on the container record, the sessions on the instance's own readiness endpoint. `stop.sh`
     * announces itself, so the order of the run is readable in one stream.
     */
    function heldInstance(bin: string): NodeJS.ProcessEnv {
      const docker = join(bin, 'docker');
      writeFileSync(
        docker,
        [
          '#!/usr/bin/env bash',
          'if [[ "${1:-}" == inspect ]]; then',
          '  for arg in "$@"; do',
          '    case "$arg" in',
          "      */app/workflows*) echo /host/corpora/held-by-another; exit 0 ;;",
          '      *workflow-server.corpus.pin*) echo 9f3c1aa-dirty; exit 0 ;;',
          '      *workflow-server.image*) echo workflow-server:exp-held; exit 0 ;;',
          '    esac',
          '  done',
          'fi',
          'exit 1',
          '',
        ].join('\n'),
      );
      chmodSync(docker, 0o755);

      const curl = join(bin, 'curl');
      writeFileSync(
        curl,
        [
          '#!/usr/bin/env bash',
          "cat <<'JSON'",
          '{"status":"ready","checks":{},"corpus":{"dir":"/app/workflows","pin":"9f3c1aa-dirty"},'
            + '"sessions":[{"session_index":"K4R7TQ","workflow_id":"mvw","since":"2026-10-09T10:00:00.000Z",'
            + '"last_seen":"2026-10-09T10:04:00.000Z"},{"session_index":"P2XM9D","workflow_id":"specimen",'
            + '"since":"2026-10-09T10:02:00.000Z","last_seen":"2026-10-09T10:05:00.000Z"}]}',
          'JSON',
          '',
        ].join('\n'),
      );
      chmodSync(curl, 0o755);

      const start = join(bin, 'start.sh');
      const stop = join(bin, 'stop.sh');
      writeNoop(start);
      writeFileSync(stop, '#!/usr/bin/env bash\necho "stop.sh ran"\nexit 0\n');
      chmodSync(stop, 0o755);
      return {
        PATH: `${bin}:${process.env.PATH ?? ''}`,
        WORKFLOW_SERVER_START: start,
        WORKFLOW_SERVER_STOP: stop,
      };
    }

    function reloadOntoAnotherCorpus(bin: string, corpus: string): string {
      const result = run(
        [
          '--name=reload-exp-sidecar-displace',
          '--host-port=32774',
          `--workflows-dir=${corpus}`,
          '--no-build',
          '--no-preflight',
        ],
        heldInstance(bin),
      );
      return `${result.stdout}${result.stderr}`;
    }

    it('names the corpus it displaces and the sessions standing on it, before the stop', () => {
      const bin = mkdtempSync(join(tmpdir(), 'reload-displace-'));
      const corpus = withCorpus();
      try {
        const out = reloadOntoAnotherCorpus(bin, corpus);
        expect(out).toMatch(/Displacing on 127\.0\.0\.1:32774/);
        expect(out).toMatch(/corpus\s+:\s+\/host\/corpora\/held-by-another @ 9f3c1aa-dirty/);
        expect(out).toMatch(/standing\s+:\s+2 session\(s\): K4R7TQ P2XM9D/);
        expect(out.indexOf('Displacing')).toBeGreaterThanOrEqual(0);
        expect(out.indexOf('Displacing')).toBeLessThan(out.indexOf('stop.sh ran'));
      } finally {
        rmSync(bin, { recursive: true, force: true });
        rmSync(corpus, { recursive: true, force: true });
      }
    });

    it('reports the standing sessions as unknown when the instance does not answer', () => {
      const bin = mkdtempSync(join(tmpdir(), 'reload-displace-silent-'));
      const corpus = withCorpus();
      try {
        const env = heldInstance(bin);
        // A container that is recorded but not serving: the labels answer, the endpoint does not.
        writeFileSync(join(bin, 'curl'), '#!/usr/bin/env bash\nexit 7\n');
        chmodSync(join(bin, 'curl'), 0o755);
        const result = run(
          [
            '--name=reload-exp-sidecar-displace',
            '--host-port=32774',
            `--workflows-dir=${corpus}`,
            '--no-build',
            '--no-preflight',
          ],
          env,
        );
        const out = `${result.stdout}${result.stderr}`;
        expect(out).toMatch(/corpus\s+:\s+\/host\/corpora\/held-by-another @ 9f3c1aa-dirty/);
        expect(out).toMatch(/standing\s+:\s+unknown/);
      } finally {
        rmSync(bin, { recursive: true, force: true });
        rmSync(corpus, { recursive: true, force: true });
      }
    });

    it('says nothing about displacement when no container of that name is recorded', () => {
      const bin = mkdtempSync(join(tmpdir(), 'reload-displace-none-'));
      const corpus = withCorpus();
      try {
        // No container of that name: every lookup against the record comes back empty.
        writeFileSync(join(bin, 'docker'), '#!/usr/bin/env bash\nexit 1\n');
        chmodSync(join(bin, 'docker'), 0o755);
        const out = run(
          [
            '--name=reload-exp-sidecar-absent',
            '--host-port=32775',
            `--workflows-dir=${corpus}`,
            '--no-build',
            '--no-preflight',
            '--image=workflow-server:local',
          ],
          stubbedStart(bin),
        );
        expect(`${out.stdout}${out.stderr}`).not.toMatch(/Displacing/);
      } finally {
        rmSync(bin, { recursive: true, force: true });
        rmSync(corpus, { recursive: true, force: true });
      }
    });

    it('hands the corpus pin to the server it starts', () => {
      const src = readFileSync(SCRIPT, 'utf8');
      expect(src).toContain('--env "CORPUS_PIN=${CORPUS_PIN}"');
    });
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
    const launchers = mkdtempSync(join(tmpdir(), 'reload-launchers-'));
    try {
      const result = run(
        [
          '--name=reload-exp-sidecar-absent',
          `--workflows-dir=${corpus}`,
          '--host-port=32772',
          '--no-build',
        ],
        stubLaunchers(launchers),
      );
      expect(result.status).not.toBe(0);
      expect(`${result.stderr}${result.stdout}`).toMatch(/could not be measured \(guard sweep exit 2\)/);
      expect(`${result.stderr}${result.stdout}`).toMatch(/nothing has been stopped/);
    } finally {
      rmSync(corpus, { recursive: true, force: true });
      rmSync(launchers, { recursive: true, force: true });
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
