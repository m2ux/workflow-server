/**
 * Shared-fragment guard (#166 B10).
 *
 * Fragments exist to end copy-paste drift: a rule text or checkpoint body is declared once under
 * `fragments` in a workflow.yaml and imported by reference. This guard keeps the mechanism honest
 * in both directions — every reference resolves, and content that should be a reference is not
 * quietly re-inlined (the drift vector the mechanism was built against):
 *
 * - `malformed-ref` / `unresolved-ref` — a rules `{ ref }` or checkpoint `ref` that does not
 *   parse, or names no fragment under the resolver's semantics (bare: declaring workflow, then
 *   meta; `workflow::name`: that workflow only).
 * - `ref-body-conflict` — a checkpoint ref step that also declares body fields, or a condition
 *   declared on both the step and its fragment (two homes for one fact).
 * - `ref-opens-step` — a checkpoint step whose `- ` line is the `ref:` itself. The raw-YAML
 *   delivery path replaces standalone `ref:` lines only; give the step its `id:` first.
 * - `unused-fragment` — a declared fragment nothing references, corpus-wide.
 * - `inline-duplicate-of-fragment` — an inline rule or checkpoint body identical (normalized) to
 *   a declared fragment: the inline copy must become a reference.
 * - `duplicate-rule` / `duplicate-checkpoint` — identical (normalized) content authored inline at
 *   two or more sites: extract a fragment.
 * - `undeclared-effect-variable` — a referencing workflow whose variables[] does not declare a
 *   variable the fragment's setVariable effects write. The effect fires in the REFERENCING
 *   workflow's session bag (check:variable-model sees only the declaring workflow).
 *
 * Near-duplicates (token-Jaccard >= 0.85 against a fragment) are reported as warnings, not
 * failures — they catch an inline copy that has already begun to drift.
 *
 * Hard-zero: every error is a defect in the corpus, not the guard.
 *
 * Run: npx tsx scripts/check-fragments.ts [--root <workflows-dir>]
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import {
  type FragmentsLookup,
  parseFragmentRef,
  resolveCheckpointFragment,
  resolveRuleFragment,
  META_WORKFLOW_ID,
} from '../src/loaders/fragment-resolver.js';
import { fragmentsLookupSync } from './fragments-index.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolveWorkflowsRoot(resolve(join(DIR, '..', 'workflows')));

/** Rules shorter than this are generic connective phrases, not drift-worthy shared content. */
const MIN_DUP_RULE_LENGTH = 30;
const NEAR_DUP_THRESHOLD = 0.85;

export interface FragmentViolation {
  file: string;
  rule:
    | 'malformed-ref'
    | 'unresolved-ref'
    | 'ref-body-conflict'
    | 'ref-opens-step'
    | 'unused-fragment'
    | 'inline-duplicate-of-fragment'
    | 'duplicate-rule'
    | 'duplicate-checkpoint'
    | 'undeclared-effect-variable';
  detail: string;
}

export interface FragmentWarning { file: string; detail: string; }

const normalizeText = (s: string): string => s.trim().replace(/\s+/g, ' ').toLowerCase();

const tokenSet = (s: string): Set<string> => new Set(normalizeText(s).split(' '));

function jaccard(a: string, b: string): number {
  const sa = tokenSet(a); const sb = tokenSet(b);
  let inter = 0;
  for (const t of sa) if (sb.has(t)) inter++;
  return inter / (sa.size + sb.size - inter);
}

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

interface CheckpointSite { file: string; stepId: string; node: Record<string, unknown>; }

/** Walk a parsed activity document for kind:checkpoint steps (top level and loop bodies). */
function collectCheckpointSteps(doc: unknown): CheckpointSite['node'][] {
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

const CHECKPOINT_BODY_FIELDS = ['message', 'options', 'defaultOption', 'autoAdvanceMs', 'blocking'] as const;

export function collectFragmentViolations(root: string = ROOT): { violations: FragmentViolation[]; warnings: FragmentWarning[] } {
  const violations: FragmentViolation[] = [];
  const warnings: FragmentWarning[] = [];
  const lookup: FragmentsLookup = fragmentsLookupSync(root);

  const workflowIds = readdirSync(root)
    .filter((d) => statSync(join(root, d)).isDirectory() && existsSync(join(root, d, 'workflow.yaml')))
    .sort();

  // Fragment registry + usage tracking for the unused-fragment check.
  const usedRuleFragments = new Set<string>();       // `${wf}::${name}` canonical
  const usedCheckpointFragments = new Set<string>();

  const canonicalTarget = (kind: 'rules' | 'checkpoints', declaringWf: string, ref: string): string | null => {
    try {
      const { workflowId, name } = parseFragmentRef(ref);
      const candidates = workflowId ? [workflowId] : declaringWf === META_WORKFLOW_ID ? [META_WORKFLOW_ID] : [declaringWf, META_WORKFLOW_ID];
      for (const wf of candidates) {
        const block = lookup(wf)?.[kind];
        if (block && block[name] !== undefined) return `${wf}::${name}`;
      }
      return null;
    } catch { return null; }
  };

  // Inline-content indices for duplicate detection.
  const inlineRuleSites = new Map<string, Array<{ file: string; wf: string; text: string }>>();
  const inlineCheckpointSites = new Map<string, Array<{ file: string; stepId: string }>>();

  for (const wf of workflowIds) {
    const wfYamlPath = join(root, wf, 'workflow.yaml');
    const wfRel = relative(root, wfYamlPath);
    let doc: Record<string, unknown> | null = null;
    try { doc = parseDefinition(readFileSync(wfYamlPath, 'utf-8')) as Record<string, unknown> | null; } catch { continue; }
    if (!doc) continue;

    const declaredVars = new Set(
      (Array.isArray(doc['variables']) ? doc['variables'] : [])
        .map((v) => (v && typeof v === 'object' ? (v as { name?: unknown }).name : undefined))
        .filter((n): n is string => typeof n === 'string'),
    );

    // Rules partitions: validate refs, index inline texts.
    const rules = (doc['rules'] ?? {}) as Record<string, unknown>;
    for (const partition of ['workflow', 'activity', 'universal']) {
      const entries = rules[partition];
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        if (typeof entry === 'string') {
          if (entry.length >= MIN_DUP_RULE_LENGTH) {
            const key = normalizeText(entry);
            const sites = inlineRuleSites.get(key) ?? [];
            sites.push({ file: wfRel, wf, text: entry });
            inlineRuleSites.set(key, sites);
          }
          continue;
        }
        const ref = entry && typeof entry === 'object' ? (entry as { ref?: unknown }).ref : undefined;
        if (typeof ref !== 'string') continue;
        try {
          resolveRuleFragment(lookup, wf, ref);
          const target = canonicalTarget('rules', wf, ref);
          if (target) usedRuleFragments.add(target);
        } catch (error) {
          const rule = error instanceof Error && error.message.startsWith('Malformed') ? 'malformed-ref' : 'unresolved-ref';
          violations.push({ file: wfRel, rule, detail: `rules.${partition}: ${error instanceof Error ? error.message : String(error)}` });
        }
      }
    }

    // Activity files: checkpoint refs and inline checkpoint bodies; activity-file inline rules.
    const adir = join(root, wf, 'activities');
    const activityFiles = existsSync(adir) ? readdirSync(adir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml')).sort() : [];
    for (const f of activityFiles) {
      const path = join(adir, f);
      const rel = relative(root, path);
      const rawText = readFileSync(path, 'utf-8');
      if (/^\s*- ref:/m.test(rawText)) {
        violations.push({ file: rel, rule: 'ref-opens-step', detail: 'a checkpoint step opens with `- ref:`; declare `id:` first so the delivery path can materialize the standalone ref line' });
      }
      let adoc: unknown;
      try { adoc = parseDefinition(rawText); } catch { continue; }

      const activityRules = (adoc as { rules?: unknown } | null)?.rules;
      if (Array.isArray(activityRules)) {
        for (const r of activityRules) {
          if (typeof r === 'string' && r.length >= MIN_DUP_RULE_LENGTH) {
            const key = normalizeText(r);
            const sites = inlineRuleSites.get(key) ?? [];
            sites.push({ file: rel, wf, text: r });
            inlineRuleSites.set(key, sites);
          }
        }
      }

      for (const step of collectCheckpointSteps(adoc)) {
        const stepId = typeof step['id'] === 'string' ? step['id'] : '?';
        const ref = step['ref'];
        if (typeof ref === 'string') {
          const localBody = CHECKPOINT_BODY_FIELDS.filter((field) => step[field] !== undefined);
          if (localBody.length > 0) {
            violations.push({ file: rel, rule: 'ref-body-conflict', detail: `checkpoint '${stepId}' declares ref '${ref}' alongside body field(s) ${localBody.join(', ')}` });
          }
          let body;
          try {
            body = resolveCheckpointFragment(lookup, wf, ref);
            const target = canonicalTarget('checkpoints', wf, ref);
            if (target) usedCheckpointFragments.add(target);
          } catch (error) {
            const rule = error instanceof Error && error.message.startsWith('Malformed') ? 'malformed-ref' : 'unresolved-ref';
            violations.push({ file: rel, rule, detail: `checkpoint '${stepId}': ${error instanceof Error ? error.message : String(error)}` });
            continue;
          }
          if (body.condition && step['condition'] !== undefined) {
            violations.push({ file: rel, rule: 'ref-body-conflict', detail: `checkpoint '${stepId}' declares a condition, but fragment '${ref}' already carries one` });
          }
          // The effect fires in THIS workflow's session bag: its variables[] must declare the targets.
          for (const option of body.options) {
            for (const name of Object.keys(option.effect?.setVariable ?? {})) {
              if (!declaredVars.has(name)) {
                violations.push({ file: rel, rule: 'undeclared-effect-variable', detail: `checkpoint '${stepId}' (fragment '${ref}') sets '${name}', which '${wf}' does not declare in workflow.yaml variables[]` });
              }
            }
          }
          continue;
        }
        const canon = normalizeCheckpointBody(step);
        if (canon) {
          const sites = inlineCheckpointSites.get(canon) ?? [];
          sites.push({ file: rel, stepId });
          inlineCheckpointSites.set(canon, sites);
        }
      }
    }
  }

  // Fragment registry sweep: exact/near matches against inline content, and unused declarations.
  for (const wf of workflowIds) {
    const fragments = lookup(wf);
    if (!fragments) continue;
    const wfRel = join(wf, 'workflow.yaml');
    for (const [name, value] of Object.entries(fragments.rules ?? {})) {
      const canonical = `${wf}::${name}`;
      if (!usedRuleFragments.has(canonical)) {
        violations.push({ file: wfRel, rule: 'unused-fragment', detail: `fragments.rules.${name} is referenced nowhere in the corpus` });
      }
      for (const text of typeof value === 'string' ? [value] : value) {
        const exact = inlineRuleSites.get(normalizeText(text)) ?? [];
        for (const site of exact) {
          violations.push({ file: site.file, rule: 'inline-duplicate-of-fragment', detail: `inline rule "${site.text.slice(0, 60)}…" duplicates fragment '${canonical}' — reference it instead` });
        }
        if (exact.length === 0) {
          for (const [key, sites] of inlineRuleSites) {
            const sim = jaccard(text, key);
            if (sim >= NEAR_DUP_THRESHOLD) {
              for (const site of sites) {
                warnings.push({ file: site.file, detail: `inline rule "${site.text.slice(0, 60)}…" is a near-duplicate (${sim.toFixed(2)}) of fragment '${canonical}' — likely drifted copy` });
              }
            }
          }
        }
      }
    }
    for (const [name, body] of Object.entries(fragments.checkpoints ?? {})) {
      const canonical = `${wf}::${name}`;
      if (!usedCheckpointFragments.has(canonical)) {
        violations.push({ file: wfRel, rule: 'unused-fragment', detail: `fragments.checkpoints.${name} is referenced nowhere in the corpus` });
      }
      const canon = normalizeCheckpointBody(body as unknown as Record<string, unknown>);
      const sites = canon ? inlineCheckpointSites.get(canon) ?? [] : [];
      for (const site of sites) {
        violations.push({ file: site.file, rule: 'inline-duplicate-of-fragment', detail: `checkpoint '${site.stepId}' duplicates fragment '${canonical}' — reference it instead` });
      }
    }
  }

  // Inline-content duplicated across sites with no fragment involved: extract one.
  for (const sites of inlineRuleSites.values()) {
    const distinctWf = new Set(sites.map((s) => s.wf));
    if (distinctWf.size >= 2) {
      const list = sites.map((s) => s.file).join(', ');
      violations.push({ file: sites[0]!.file, rule: 'duplicate-rule', detail: `rule "${sites[0]!.text.slice(0, 60)}…" is authored inline in ${distinctWf.size} workflows (${list}) — extract a fragment` });
    }
  }
  for (const sites of inlineCheckpointSites.values()) {
    if (sites.length >= 2) {
      const list = sites.map((s) => `${s.file}#${s.stepId}`).join(', ');
      violations.push({ file: sites[0]!.file, rule: 'duplicate-checkpoint', detail: `checkpoint body authored inline at ${sites.length} sites (${list}) — extract a fragment` });
    }
  }

  return { violations, warnings };
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const { violations, warnings } = collectFragmentViolations();
  for (const w of warnings) process.stdout.write(`  warning: ${w.file}: ${w.detail}\n`);
  if (violations.length === 0) {
    process.stdout.write('fragments: OK — every ref resolves, every fragment is used, no inline duplicates\n');
    process.exit(0);
  }
  process.stdout.write(`fragments: ${violations.length} violation(s):\n`);
  for (const v of violations) process.stdout.write(`  [${v.rule}] ${v.file}: ${v.detail}\n`);
  process.exit(1);
}
