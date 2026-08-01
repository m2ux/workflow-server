/**
 * check-description-hygiene — mechanical net for Description Hygiene / bound-step prose.
 *
 * Activity YAML `description` fields and `action: set` descriptions are WHAT summaries. Procedure
 * essays, numbered HOW lists, and multi-sentence orchestration narration belong in technique
 * protocol (AP-15 procedure-in-protocol, AP-28 no-sequence-in-description). A `kind: technique`
 * step that still carries `description` or `name` violates AP-17 bound-step-no-description.
 *
 * This guard is a fail-closed *net*, not a full Detect walk: it keys on structural shape and a
 * small phrase set that has already shipped as false-green audit misses. Soft smells still need
 * the canon walk; a clean guard does not mean the Description Hygiene unit was walked.
 *
 * Run: npx tsx scripts/check-description-hygiene.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

/** Phrase markers from procedure essays that landed in activity/set description. */
const PROCEDURE_MARKERS =
  /\b(run every|wait-all|wait until|for each unit|seed the|ordered gather|under that bound|concurrency bound|append the|then wait|first seed|after that)\b/i;

/** Numbered or bulleted HOW lists inside a description field. */
const NUMBERED_HOW = /^\s*(?:\d+\.|[-*])\s+\S/m;

interface YamlMap {
  [key: string]: unknown;
}

function isMap(v: unknown): v is YamlMap {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function asString(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

function sentenceCount(text: string): number {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

/** Multi-sentence orchestration essay with imperative process verbs. */
function isProcedureEssay(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (NUMBERED_HOW.test(t)) return true;
  if (PROCEDURE_MARKERS.test(t) && t.length > 80) return true;
  const sentences = sentenceCount(t);
  if (sentences >= 3 && t.length > 160 && /\b(run|wait|append|seed|gather|combine|execute each|for each)\b/i.test(t)) {
    return true;
  }
  return false;
}

function walkSteps(
  steps: unknown,
  relFile: string,
  activityId: string,
  findings: Finding[],
  pathPrefix: string,
): void {
  if (!Array.isArray(steps)) return;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (!isMap(step)) continue;
    const stepId = asString(step.id) ?? String(i);
    const siteBase = `${relFile}#${pathPrefix}${stepId}`;

    if (step.kind === 'technique' && step.technique != null) {
      if (asString(step.description) !== undefined || asString(step.name) !== undefined) {
        const fields = [
          asString(step.description) !== undefined ? 'description' : null,
          asString(step.name) !== undefined ? 'name' : null,
        ]
          .filter(Boolean)
          .join('+');
        findings.push({
          check: 'bound-step-prose',
          site: siteBase,
          detail:
            `activity '${activityId}' bound technique step carries ${fields} — ` +
            'bound steps allow only kind/id/technique plus structural fields (bound-step-no-description); ' +
            'delete the prose and home WHAT/HOW on the bound op',
        });
      }
    }

    const stepDesc = asString(step.description);
    if (stepDesc && isProcedureEssay(stepDesc)) {
      findings.push({
        check: 'procedure-in-description',
        site: `${siteBase}.description`,
        detail:
          `activity '${activityId}' step description holds procedure/sequence prose — ` +
          'keep a one-line WHAT or delete when bound (procedure-in-protocol / no-sequence-in-description)',
      });
    }

    const actions = step.actions;
    if (Array.isArray(actions)) {
      for (const action of actions) {
        if (!isMap(action) || action.action !== 'set') continue;
        const target = asString(action.target) ?? '?';
        const setDesc = asString(action.description);
        if (setDesc && isProcedureEssay(setDesc)) {
          findings.push({
            check: 'procedure-in-set-description',
            site: `${siteBase}.set.${target}`,
            detail:
              `activity '${activityId}' action:set description for '${target}' holds procedure/sequence prose — ` +
              'keep a one-line WHAT for the value; move HOW to a technique protocol',
          });
        }
      }
    }

    if (step.kind === 'loop') {
      walkSteps(step.steps, relFile, activityId, findings, `${pathPrefix}${stepId}/`);
    }
  }
}

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const workflow of readdirSync(root).sort()) {
    const activitiesDir = join(root, workflow, 'activities');
    if (!existsSync(activitiesDir) || !statSync(activitiesDir).isDirectory()) continue;
    const stack = [activitiesDir];
    while (stack.length) {
      const dir = stack.pop()!;
      for (const entry of readdirSync(dir).sort()) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          stack.push(full);
          continue;
        }
        if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
        const def = parse(readFileSync(full, 'utf-8')) as YamlMap | null;
        scanned++;
        if (!isMap(def)) continue;
        const rel = relative(root, full);
        const activityId = asString(def.id) ?? entry;
        const activityDesc = asString(def.description);
        if (activityDesc && isProcedureEssay(activityDesc)) {
          findings.push({
            check: 'procedure-in-description',
            site: `${rel}#description`,
            detail:
              `activity '${activityId}' description holds procedure/sequence prose — ` +
              'state WHAT the activity delivers; sequence lives in steps[] (no-sequence-in-description)',
          });
        }
        walkSteps(def.steps, rel, activityId, findings, '');
      }
    }
  }
  assertScanned(scanned, 'activity files', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('description-hygiene', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no mechanical description-hygiene hits on activity YAML prose',
    remedy:
      'strip procedure from activity/set descriptions; delete description/name on bound technique steps',
  });
}
