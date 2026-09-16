/**
 * Duplicated inline content (#738 W01).
 *
 * The same text authored at two sites drifts, because nothing holds the copies together and no
 * single file reveals the difference. This finds two shapes of it, and neither is about how a
 * shared thing is referenced — only about the same content existing twice.
 *
 * - `duplicate-rule` — identical (normalized) rule text authored inline in two or more workflows.
 *   A rule two workflows both need belongs in the conduct technique whose audience it binds, and
 *   both copies go.
 * - `duplicate-checkpoint` — identical (normalized) checkpoint body authored inline at two or more
 *   sites. A run of steps shared between activities is a routine, and a gate shared on its own is a
 *   one-step routine: the reference prefixes the identifiers it contributes, and its signature is
 *   held against its body.
 *
 * Hard-zero: every finding is a defect in the corpus, not the guard.
 *
 * Run: npx tsx guards/check-duplicate-bodies.ts [--root <workflows-dir>]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { corpusWorkflows, resolveWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { requireRootOrExit } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));
const ROOT = resolveWorkflowsRoot(DEFAULT_ROOT);

/** Rules shorter than this are generic connective phrases, not drift-worthy shared content. */
const MIN_DUP_RULE_LENGTH = 30;

export interface DuplicateViolation {
  file: string;
  rule: 'duplicate-rule' | 'duplicate-checkpoint';
  detail: string;
}

const normalizeText = (s: string): string => s.trim().replace(/\s+/g, ' ').toLowerCase();

/** Canonical form of a checkpoint body for duplicate detection: content fields only (no step id,
 *  no site gates), key order fixed, strings whitespace/case-normalized. */
function normalizeCheckpointBody(node: Record<string, unknown>): string | null {
  const message = node['message'];
  const options = node['options'];
  if (typeof message !== 'string' || !Array.isArray(options)) return null;
  const canon = {
    message: normalizeText(message),
    blocking: node['blocking'] ?? null,
    defaultOption: node['defaultOption'] ?? null,
    autoAdvanceMs: node['autoAdvanceMs'] ?? null,
    options: options.map((o) => {
      const opt = (o ?? {}) as Record<string, unknown>;
      return {
        id: typeof opt['id'] === 'string' ? normalizeText(opt['id']) : null,
        label: typeof opt['label'] === 'string' ? normalizeText(opt['label']) : null,
        description: typeof opt['description'] === 'string' ? normalizeText(opt['description']) : null,
        effect: opt['effect'] ?? null,
      };
    }),
  };
  return JSON.stringify(canon);
}

/** Walk a parsed activity document for kind:checkpoint steps (top level and loop bodies). */
function collectCheckpointSteps(doc: unknown): Array<Record<string, unknown>> {
  const out: Record<string, unknown>[] = [];
  const walk = (node: unknown): void => {
    if (Array.isArray(node)) { node.forEach(walk); return; }
    if (!node || typeof node !== 'object') return;
    const o = node as Record<string, unknown>;
    if (o['kind'] === 'checkpoint') out.push(o);
    if (Array.isArray(o['steps'])) walk(o['steps']);
  };
  walk((doc as { steps?: unknown } | null)?.steps);
  return out;
}

export function collectDuplicateViolations(root: string = ROOT): DuplicateViolation[] {
  const violations: DuplicateViolation[] = [];
  const index = indexCorpus(root);

  const inlineRuleSites = new Map<string, Array<{ file: string; wf: string; text: string }>>();
  const inlineCheckpointSites = new Map<string, Array<{ file: string; stepId: string }>>();

  for (const { id: wf, dir } of corpusWorkflows(root, index)) {
    const wfYamlPath = join(dir, 'workflow.yaml');
    const wfRel = relative(root, wfYamlPath);
    let doc: Record<string, unknown> | null = null;
    try { doc = parseDefinition(readFileSync(wfYamlPath, 'utf-8')) as Record<string, unknown> | null; } catch { continue; }
    if (!doc) continue;

    const rules = (doc['rules'] ?? {}) as Record<string, unknown>;
    for (const partition of ['workflow', 'activity', 'universal']) {
      const entries = rules[partition];
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        if (typeof entry !== 'string' || entry.length < MIN_DUP_RULE_LENGTH) continue;
        const key = normalizeText(entry);
        const sites = inlineRuleSites.get(key) ?? [];
        sites.push({ file: wfRel, wf, text: entry });
        inlineRuleSites.set(key, sites);
      }
    }

    const adir = join(dir, 'activities');
    const activityFiles = existsSync(adir)
      ? readdirSync(adir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')).sort()
      : [];
    for (const f of activityFiles) {
      const path = join(adir, f);
      const rel = relative(root, path);
      let adoc: unknown;
      try { adoc = parseDefinition(readFileSync(path, 'utf-8')); } catch { continue; }

      const activityRules = (adoc as { rules?: unknown } | null)?.rules;
      if (Array.isArray(activityRules)) {
        for (const r of activityRules) {
          if (typeof r !== 'string' || r.length < MIN_DUP_RULE_LENGTH) continue;
          const key = normalizeText(r);
          const sites = inlineRuleSites.get(key) ?? [];
          sites.push({ file: rel, wf, text: r });
          inlineRuleSites.set(key, sites);
        }
      }

      for (const step of collectCheckpointSteps(adoc)) {
        const canon = normalizeCheckpointBody(step);
        if (!canon) continue;
        const stepId = typeof step['id'] === 'string' ? step['id'] : '?';
        const sites = inlineCheckpointSites.get(canon) ?? [];
        sites.push({ file: rel, stepId });
        inlineCheckpointSites.set(canon, sites);
      }
    }

    // A routine is where a body shared between activities now lives, so it is a place a body can be
    // written twice. Scanning only activities would leave the guard blind to the duplication its own
    // remedy creates — one routine's gate copied into another, or into an activity that could have
    // referred to it.
    const rdir = join(dir, 'routines');
    const routineFiles = existsSync(rdir)
      ? readdirSync(rdir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')).sort()
      : [];
    for (const f of routineFiles) {
      const path = join(rdir, f);
      const rel = relative(root, path);
      let rdoc: unknown;
      try { rdoc = parseDefinition(readFileSync(path, 'utf-8')); } catch { continue; }
      for (const step of collectCheckpointSteps(rdoc)) {
        const canon = normalizeCheckpointBody(step);
        if (!canon) continue;
        const stepId = typeof step['id'] === 'string' ? step['id'] : '?';
        const sites = inlineCheckpointSites.get(canon) ?? [];
        sites.push({ file: rel, stepId });
        inlineCheckpointSites.set(canon, sites);
      }
    }
  }

  for (const sites of inlineRuleSites.values()) {
    const distinctWf = new Set(sites.map((s) => s.wf));
    if (distinctWf.size < 2) continue;
    const list = sites.map((s) => s.file).join(', ');
    violations.push({
      file: sites[0]!.file,
      rule: 'duplicate-rule',
      detail:
        `rule "${sites[0]!.text.slice(0, 60)}…" is authored inline in ${distinctWf.size} workflows (${list}) — `
        + 'move it to the meta conduct technique whose audience it binds and delete every copy',
    });
  }
  for (const sites of inlineCheckpointSites.values()) {
    if (sites.length < 2) continue;
    const list = sites.map((s) => `${s.file}#${s.stepId}`).join(', ');
    violations.push({
      file: sites[0]!.file,
      rule: 'duplicate-checkpoint',
      detail: `checkpoint body authored inline at ${sites.length} sites (${list}) — declare it as a routine and refer to it from each`,
    });
  }

  return violations;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectDuplicateViolations(requireRootOrExit('duplicate-bodies', DEFAULT_ROOT));
  if (violations.length === 0) {
    process.stdout.write('duplicate-bodies: OK — no rule text and no checkpoint body is authored twice\n');
    process.exit(0);
  }
  process.stdout.write(`duplicate-bodies: ${violations.length} violation(s):\n`);
  for (const v of violations) process.stdout.write(`  [${v.rule}] ${v.file}: ${v.detail}\n`);
  process.exit(1);
}
