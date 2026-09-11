import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { deriveWorkingDirectory } from '../src/utils/session/derive-working-directory.js';

const execFileAsync = promisify(execFile);

async function git(dir: string, args: string[]): Promise<void> {
  await execFileAsync('git', ['-C', dir, ...args], { encoding: 'utf8' });
}

async function initRepo(dir: string, origin?: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  await execFileAsync('git', ['init', dir], { encoding: 'utf8' });
  await git(dir, ['config', 'user.email', 'test@example.com']);
  await git(dir, ['config', 'user.name', 'test']);
  if (origin) await git(dir, ['remote', 'add', 'origin', origin]);
}

describe('deriveWorkingDirectory (PR528-TC-13)', () => {
  let root: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'sx-derive-'));
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it('binds HTTPS origin of the checkout under work', async () => {
    const checkout = join(root, 'workflow-server');
    await initRepo(checkout, 'https://github.com/acme/workflow-server.git');
    const result = await deriveWorkingDirectory({ workingDirectory: checkout });
    expect(result).toMatchObject({ kind: 'ok', repo: 'acme/workflow-server', toplevel: checkout });
    expect(result.kind === 'ok' && result.host_repo).toBeUndefined();
  });

  it('binds SSH origin of the checkout under work', async () => {
    const checkout = join(root, 'workflow-server');
    await initRepo(checkout, 'git@github.com:acme/workflow-server.git');
    const result = await deriveWorkingDirectory({ workingDirectory: checkout });
    expect(result).toMatchObject({ kind: 'ok', repo: 'acme/workflow-server' });
  });

  it('binds a non-infrastructure submodule origin, not the superproject', async () => {
    const host = join(root, 'monorepo');
    const child = join(host, 'app');
    await initRepo(host, 'https://github.com/acme/monorepo.git');
    await initRepo(child, 'https://github.com/acme/app.git');
    await writeFile(
      join(host, '.gitmodules'),
      '[submodule "app"]\n\tpath = app\n\turl = https://github.com/acme/app.git\n',
    );
    const result = await deriveWorkingDirectory({ workingDirectory: child });
    expect(result.kind).toBe('ok');
    if (result.kind !== 'ok') return;
    expect(result.repo).toBe('acme/app');
    expect(result.host_repo).toBe('acme/monorepo');
    expect(result.component_path).toBe('app');
    expect(result.host_repo_path).toBe(host);
  });

  it('refuses a path that is not a git checkout', async () => {
    const dir = join(root, 'empty');
    await mkdir(dir);
    const result = await deriveWorkingDirectory({ workingDirectory: dir });
    expect(result).toMatchObject({ kind: 'refuse' });
    if (result.kind === 'refuse') {
      expect(result.message).toMatch(/not a git checkout/);
    }
  });

  it('returns unbound-repo when origin is missing', async () => {
    const checkout = join(root, 'workflow-server');
    await initRepo(checkout);
    const result = await deriveWorkingDirectory({ workingDirectory: checkout });
    expect(result).toMatchObject({ kind: 'decision', decision: 'unbound-repo' });
    if (result.kind === 'decision') {
      expect(result.candidates.length).toBeGreaterThan(0);
      expect(result.recommendation).toMatch(/owner\/repo/);
      expect(result.toplevel).toBe(checkout);
    }
  });

  it('returns binding-mismatch when basename disagrees with the origin repo segment', async () => {
    const checkout = join(root, 'other-name');
    await initRepo(checkout, 'https://github.com/acme/workflow-server.git');
    const result = await deriveWorkingDirectory({ workingDirectory: checkout });
    expect(result).toMatchObject({ kind: 'decision', decision: 'binding-mismatch' });
    if (result.kind === 'decision') {
      expect(result.derived_repo).toBe('acme/workflow-server');
      expect(result.recommendation).toMatch(/basename/);
    }
  });

  it('returns unmapped-root when the checkout sits outside every search root', async () => {
    const checkout = join(root, 'workflow-server');
    await initRepo(checkout, 'https://github.com/acme/workflow-server.git');
    const result = await deriveWorkingDirectory({
      workingDirectory: checkout,
      searchRoots: [join(root, 'elsewhere')],
    });
    expect(result).toMatchObject({ kind: 'decision', decision: 'unmapped-root' });
  });

  it('returns component-choice when the working directory is a host with two unnamed components', async () => {
    const host = join(root, 'monorepo');
    await initRepo(host, 'https://github.com/acme/monorepo.git');
    await initRepo(join(host, 'alpha'), 'https://github.com/acme/alpha.git');
    await initRepo(join(host, 'beta'), 'https://github.com/acme/beta.git');
    await writeFile(
      join(host, '.gitmodules'),
      '[submodule "alpha"]\n\tpath = alpha\n\turl = https://github.com/acme/alpha.git\n' +
        '[submodule "beta"]\n\tpath = beta\n\turl = https://github.com/acme/beta.git\n' +
        '[submodule "workflows"]\n\tpath = workflows\n\turl = https://github.com/acme/workflows.git\n',
    );
    await initRepo(join(host, 'workflows'), 'https://github.com/acme/workflows.git');
    const result = await deriveWorkingDirectory({ workingDirectory: host });
    expect(result).toMatchObject({ kind: 'decision', decision: 'component-choice' });
    if (result.kind === 'decision') {
      expect(result.candidates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ path: 'alpha', repo: 'acme/alpha' }),
          expect.objectContaining({ path: 'beta', repo: 'acme/beta' }),
        ]),
      );
      expect(result.candidates.find((c) => c['path'] === 'workflows')).toBeUndefined();
    }
  });

  it('binds the host when the request names one of the component candidates', async () => {
    const host = join(root, 'monorepo');
    await initRepo(host, 'https://github.com/acme/monorepo.git');
    await initRepo(join(host, 'alpha'), 'https://github.com/acme/alpha.git');
    await initRepo(join(host, 'beta'), 'https://github.com/acme/beta.git');
    await writeFile(
      join(host, '.gitmodules'),
      '[submodule "alpha"]\n\tpath = alpha\n\turl = https://github.com/acme/alpha.git\n' +
        '[submodule "beta"]\n\tpath = beta\n\turl = https://github.com/acme/beta.git\n',
    );
    const result = await deriveWorkingDirectory({
      workingDirectory: host,
      namedRepo: 'acme/alpha',
    });
    expect(result).toMatchObject({ kind: 'ok', repo: 'acme/monorepo' });
  });
});
