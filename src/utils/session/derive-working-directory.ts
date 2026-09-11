import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { normalizeRepoPath, type PathPresentationMap } from '../../config.js';
import { isPathUnderRoot, receivePathFromAgent } from '../path-presentation.js';

const execFileAsync = promisify(execFile);

export type DerivationDecisionName =
  | 'unbound-repo'
  | 'binding-mismatch'
  | 'component-choice'
  | 'unmapped-root';

export interface DerivationFacts {
  toplevel?: string;
  host_repo_path?: string;
  component_path?: string;
  derived_repo?: string;
  host_repo?: string;
}

export interface DerivationOk extends DerivationFacts {
  kind: 'ok';
  repo: string;
  toplevel: string;
  host_repo_path: string;
}

export interface DerivationDecision extends DerivationFacts {
  kind: 'decision';
  decision: DerivationDecisionName;
  candidates: Array<Record<string, unknown>>;
  recommendation: string;
}

export interface DerivationRefuse {
  kind: 'refuse';
  message: string;
}

export type WorkingDirectoryDerivation =
  | DerivationOk
  | DerivationDecision
  | DerivationRefuse;

export interface DeriveWorkingDirectoryInput {
  workingDirectory: string;
  pathPresentation?: PathPresentationMap;
  searchRoots?: string[];
  /** Caller-supplied `repo` (owner/repo) used to detect a named component. */
  namedRepo?: string;
  userRequest?: string;
}

interface SubmoduleSection {
  name: string;
  path: string;
  url?: string;
}

function isInfrastructurePath(submodulePath: string): boolean {
  return (
    submodulePath === 'workflows' ||
    submodulePath === '.engineering' ||
    submodulePath.startsWith('.engineering/')
  );
}

function namesComponent(
  candidate: { path: string; repo?: string },
  namedRepo?: string,
  userRequest?: string,
): boolean {
  const haystack = [namedRepo, userRequest].filter(Boolean).join(' ').toLowerCase();
  if (!haystack) return false;
  if (candidate.repo && haystack.includes(candidate.repo.toLowerCase())) return true;
  const last = basename(candidate.path).toLowerCase();
  if (last && haystack.includes(last)) return true;
  if (haystack.includes(candidate.path.toLowerCase())) return true;
  return false;
}

async function gitC(
  dir: string,
  args: readonly string[],
): Promise<{ ok: true; stdout: string } | { ok: false }> {
  try {
    const { stdout } = await execFileAsync('git', ['-C', dir, ...args], {
      encoding: 'utf8',
      timeout: 10_000,
    });
    return { ok: true, stdout: stdout.trim() };
  } catch {
    return { ok: false };
  }
}

async function showToplevel(dir: string): Promise<string | undefined> {
  const result = await gitC(dir, ['rev-parse', '--show-toplevel']);
  return result.ok && result.stdout ? resolve(result.stdout) : undefined;
}

async function originUrl(dir: string): Promise<string | undefined> {
  const result = await gitC(dir, ['remote', 'get-url', 'origin']);
  return result.ok && result.stdout ? result.stdout : undefined;
}

function tryNormalizeRepo(raw: string): string | undefined {
  try {
    return normalizeRepoPath(raw);
  } catch {
    return undefined;
  }
}

async function parseGitmodules(hostToplevel: string): Promise<SubmoduleSection[]> {
  let content: string;
  try {
    content = await readFile(join(hostToplevel, '.gitmodules'), 'utf8');
  } catch {
    return [];
  }
  const modules: SubmoduleSection[] = [];
  let current: { name: string; path?: string; url?: string } | undefined;
  const flush = (): void => {
    if (current?.path) {
      modules.push({
        name: current.name,
        path: current.path,
        ...(current.url ? { url: current.url } : {}),
      });
    }
  };
  for (const line of content.split(/\r?\n/)) {
    const section = line.match(/^\s*\[submodule\s+"([^"]+)"\]\s*$/);
    if (section?.[1]) {
      flush();
      current = { name: section[1] };
      continue;
    }
    const pathMatch = line.match(/^\s*path\s*=\s*(.+)$/);
    if (pathMatch?.[1] && current) current.path = pathMatch[1].trim();
    const urlMatch = line.match(/^\s*url\s*=\s*(.+)$/);
    if (urlMatch?.[1] && current) current.url = urlMatch[1].trim();
  }
  flush();
  return modules;
}

async function submodulePathNamesCurrent(
  parentToplevel: string,
  currentToplevel: string,
): Promise<string | undefined> {
  const rel = relative(parentToplevel, currentToplevel);
  if (!rel || rel.startsWith('..') || rel === '.') return undefined;
  const modules = await parseGitmodules(parentToplevel);
  const match = modules.find((m) => m.path === rel || m.path === basename(currentToplevel));
  return match?.path;
}

async function ascendHost(innermost: string): Promise<{
  hostToplevel: string;
  boundToplevel: string;
  componentPath?: string;
}> {
  let current = innermost;
  let lastNonInfra: string | undefined;
  for (;;) {
    const parentDir = dirname(current);
    if (parentDir === current) break;
    const parentTop = await showToplevel(parentDir);
    if (!parentTop) break;
    const submodulePath = await submodulePathNamesCurrent(parentTop, current);
    if (!submodulePath) break;
    if (!isInfrastructurePath(submodulePath)) {
      lastNonInfra = lastNonInfra ?? current;
    }
    current = parentTop;
  }
  const componentPath =
    lastNonInfra && lastNonInfra !== current
      ? relative(current, lastNonInfra)
      : undefined;
  return {
    hostToplevel: current,
    boundToplevel: innermost,
    ...(componentPath ? { componentPath } : {}),
  };
}

async function componentCandidates(hostToplevel: string): Promise<
  Array<{ path: string; repo?: string }>
> {
  const modules = await parseGitmodules(hostToplevel);
  const out: Array<{ path: string; repo?: string }> = [];
  for (const m of modules) {
    if (isInfrastructurePath(m.path)) continue;
    const child = resolve(hostToplevel, m.path);
    const origin = m.url ?? (await originUrl(child));
    const repo = origin ? tryNormalizeRepo(origin) : undefined;
    out.push({ path: m.path, ...(repo ? { repo } : {}) });
  }
  return out;
}

function sitsUnderSearchRoots(path: string, searchRoots: string[]): boolean {
  return searchRoots.some((root) => isPathUnderRoot(path, root));
}

function decision(
  name: DerivationDecisionName,
  facts: DerivationFacts,
  candidates: Array<Record<string, unknown>>,
  recommendation: string,
): DerivationDecision {
  return { kind: 'decision', decision: name, candidates, recommendation, ...facts };
}

/**
 * Derive the bound `owner/repo` from the checkout under work. Invert path
 * presentation first, then `git -C` (no shell). The outermost superproject is
 * reported when it differs; it is not the bind unless it is the checkout.
 */
export async function deriveWorkingDirectory(
  input: DeriveWorkingDirectoryInput,
): Promise<WorkingDirectoryDerivation> {
  const inverted = receivePathFromAgent(input.workingDirectory, input.pathPresentation);
  if (!inverted) {
    return { kind: 'refuse', message: 'working_directory is empty after path inversion' };
  }
  const workingDir = resolve(inverted);

  const innermost = await showToplevel(workingDir);
  if (!innermost) {
    return {
      kind: 'refuse',
      message:
        `working_directory '${workingDir}' is not a git checkout. ` +
        'Pass the absolute path of a repository working tree.',
    };
  }

  const ascent = await ascendHost(innermost);
  const origin = await originUrl(innermost);
  const derivedRepo = origin ? tryNormalizeRepo(origin) : undefined;
  let hostRepo: string | undefined;
  if (ascent.hostToplevel === innermost) {
    hostRepo = derivedRepo;
  } else {
    const raw = await originUrl(ascent.hostToplevel);
    hostRepo = raw ? tryNormalizeRepo(raw) : undefined;
  }

  const facts: DerivationFacts = {
    toplevel: innermost,
    host_repo_path: ascent.hostToplevel,
    ...(ascent.componentPath ? { component_path: ascent.componentPath } : {}),
    ...(derivedRepo ? { derived_repo: derivedRepo } : {}),
    ...(hostRepo && hostRepo !== derivedRepo ? { host_repo: hostRepo } : {}),
  };

  if (!derivedRepo) {
    return decision(
      'unbound-repo',
      facts,
      [{ toplevel: innermost, ...(origin ? { origin } : {}) }],
      'Supply repo as owner/repo from the user or the workspace AGENTS.md, then retry.',
    );
  }

  if (basename(innermost) !== derivedRepo.split('/')[1]) {
    return decision(
      'binding-mismatch',
      { ...facts, derived_repo: derivedRepo },
      [
        { checkout_basename: basename(innermost), derived_repo: derivedRepo, toplevel: innermost },
      ],
      `The checkout basename '${basename(innermost)}' does not match repository '${derivedRepo.split('/')[1]}'. ` +
        'Pass a working_directory whose basename matches the origin, or correct the remote.',
    );
  }

  const roots = input.searchRoots?.filter(Boolean) ?? [];
  if (roots.length > 0 && !sitsUnderSearchRoots(innermost, roots) && !sitsUnderSearchRoots(ascent.hostToplevel, roots)) {
    return decision(
      'unmapped-root',
      facts,
      [{ toplevel: innermost, host_repo_path: ascent.hostToplevel, search_roots: roots }],
      'Mount this checkout under a configured session search root, or pass a working_directory the presentation map has mounted.',
    );
  }

  const atHost = innermost === ascent.hostToplevel;
  if (atHost) {
    const components = await componentCandidates(innermost);
    if (components.length > 1) {
      const named = components.some((c) => namesComponent(c, input.namedRepo, input.userRequest));
      if (!named) {
        return decision(
          'component-choice',
          facts,
          components,
          'Name one of the component submodules in the request or pass its working_directory, then retry. The host bind is kept until a component is named.',
        );
      }
    }
  }

  const ok: DerivationOk = {
    kind: 'ok',
    repo: derivedRepo,
    toplevel: innermost,
    host_repo_path: ascent.hostToplevel,
    ...(facts.component_path ? { component_path: facts.component_path } : {}),
    ...(facts.host_repo ? { host_repo: facts.host_repo } : {}),
    derived_repo: derivedRepo,
  };
  return ok;
}

/** Shape an open decision as the successful tool JSON (no session_index). */
export function openDecisionPayload(d: DerivationDecision | (Omit<DerivationDecision, 'kind'> & { kind: 'decision' })): Record<string, unknown> {
  const { kind: _kind, ...rest } = d;
  return rest;
}
