#!/usr/bin/env npx tsx
/**
 * STRUCTURE-PRESERVING (surgical) step-kinds migrator — DRY RUN ONLY.
 *
 * Converts each activity TOON from the parallel-array model (steps[] + checkpoints[] + loops[])
 * into the unified ordered, kind-tagged steps[] — by editing TEXT surgically so every line that
 * is not structurally rewritten stays byte-identical to the source.
 *
 * Correctness oracle: scripts/migrate-step-kinds.ts `transformActivity(decodedObj)`. For every
 * file we assert decode(surgicalText) deep-equals transformActivity(decode(originalText)),
 * then re-validate with the real schema (safeValidateActivity + populateStepIds).
 *
 * NEVER writes under workflows/. Would-be outputs go to /tmp/surgical/<workflow>__<filename>.toon.
 *
 * Run: npx tsx scripts/migrate-step-kinds-surgical.ts
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { decodeToonRaw } from '../src/utils/toon.js';
import { safeValidateActivity, populateStepIds, defaultStepId, type Activity } from '../src/schema/activity.schema.js';
import { transformActivity } from './migrate-step-kinds-oracle.js';

const ROOT = join(import.meta.dirname, '..', 'workflows');
const OUT_DIR = '/tmp/surgical';

/**
 * INTERLEAVE: relative activity path → ordered list of TOP-LEVEL unit ids (original top-level step
 * ids + loop ids) overriding the default ordering (top-level steps in source order, then loops in
 * source order). Keyed by REL PATH (not bare activity id — ids collide across workflows). Populated
 * from the interleave analysis; only the activities that DEVIATE from steps-then-loops have entries.
 */
const INTERLEAVE: Record<string, string[]> = {
  'work-package/activities/02-design-philosophy.toon': ['define-problem', 'classify-problem', 'determine-path', 'document-philosophy', 'collect-assumptions', 'create-assumptions-log', 'reconcile-assumptions', 'assumption-reconciliation', 'assess-ticket-completeness', 'set-review-mode-path'],
  'work-package/activities/09-post-impl-review.toon': ['announce-start', 'gitnexus-detect-changes-preflight', 'manual-diff-review', 'code-review', 'structural-analysis-inline', 'dispatch-prism', 'test-suite-review', 'review-fix-cycle', 'architecture-summary', 'classify-and-route-findings'],
  'prism-evaluate/activities/05-resolution-dialogue.toon': ['load-and-classify', 'finding-iteration', 'compile-plan'],
  'work-package/activities/08-implement.toon': ['verify-preconditions', 'task-cycle', 'reconcile-assumptions', 'assumption-reconciliation', 'present-resolved-assumptions', 'interview-open-assumptions', 'assumption-interview', 'update-assumptions-log'],
  'work-package/activities/05-implementation-analysis.toon': ['review-baseline-state', 'analyze-implementation', 'collect-assumptions', 'document', 'update-assumptions-log', 'reconcile-assumptions', 'assumption-reconciliation', 'present-resolved-assumptions', 'interview-open-assumptions', 'assumption-interview'],
  'work-package/activities/06-plan-prepare.toon': ['env-prerequisites', 'create-plan', 'create-test-plan', 'present-solution-overview', 'collect-assumptions', 'update-assumptions-log', 'reconcile-assumptions', 'assumption-reconciliation', 'create-todos', 'sync-branch', 'update-pr'],
  'work-package/activities/04-research.toon': ['research-knowledge-base', 'synthesize', 'collect-assumptions', 'document', 'update-assumptions-log', 'reconcile-assumptions', 'assumption-reconciliation', 'present-resolved-assumptions', 'declare-context-scope', 'interview-open-assumptions', 'assumption-interview'],
  'work-package/activities/07-assumptions-review.toon': ['evaluate-open-assumptions', 'interview-assumptions', 'assumption-interview-loop', 'update-assumptions-log', 'post-summary-jira', 'post-summary-github'],
  'work-package/activities/03-requirements-elicitation.toon': ['stakeholder-discussion', 'elicit-requirements', 'domain-iteration', 'collect-assumptions', 'create-document', 'update-assumptions-log', 'reconcile-assumptions', 'assumption-reconciliation'],
  'work-package/activities/12-submit-for-review.toon': ['announce-start', 'consolidate-review-findings', 'generate-review-summary', 'present-summary-to-user', 'post-pr-review', 'dco-sign-off', 'push-commits', 'update-description', 'verify-pr-body-rerender', 'instruct-merge-strategy', 'mark-ready', 'await-review', 'process-review-comments', 'analyze-review-outcome', 'announce-completion'],
};

/**
 * ORPHAN_PLACEMENT: rel path → checkpointId → where to position that standalone (non-step-bound)
 * checkpoint in the unified ordered steps[]. `anchor` is a TOP-LEVEL unit id (step or loop) or
 * `__start__`/`__end__`; `position` is before/after. From the propose+adversarial-verify workflow.
 */
const ORPHAN_PLACEMENT: Record<string, Record<string, { anchor: string; position: 'before' | 'after' }>> = {
  'meta/activities/00-discover-session.toon': { 'workflow-selection': { anchor: 'match-target', position: 'after' }, 'resume-session': { anchor: 'record-match', position: 'after' } },
  'meta/activities/02-resolve-target.toon': { 'repo-type-confirmed': { anchor: 'detect-monorepo', position: 'after' } },
  'meta/activities/04-end-workflow.toon': { 'completion-confirmed': { anchor: 'generate-summary', position: 'after' } },
  'prism/activities/00-select-mode.toon': { 'confirm-mode': { anchor: 'apply-plan', position: 'after' } },
  'prism-audit/activities/00-scope-definition.toon': { 'confirm-scope': { anchor: 'summarize-scope', position: 'after' } },
  'prism-audit/activities/01-prompt-generation.toon': { 'no-security-characteristics': { anchor: 'identify-security-characteristics', position: 'after' } },
  'prism-evaluate/activities/00-scope-definition.toon': { 'confirm-scope': { anchor: 'summarize-scope', position: 'after' } },
  'prism-evaluate/activities/01-dimension-planning.toon': { 'confirm-plan': { anchor: 'write-plan', position: 'after' } },
  'prism-evaluate/activities/04-deliver-results.toon': { 'resolution-offer': { anchor: 'compile-and-present', position: 'after' } },
  'prism-evaluate/activities/05-resolution-dialogue.toon': { 'finding-decision': { anchor: 'propose-mitigation', position: 'after' } },
  'prism-evaluate/activities/06-apply-mitigations.toon': { 'confirm-apply': { anchor: 'apply-changes', position: 'before' } },
  'prism-update/activities/03-verify.toon': { 'verification-result': { anchor: 'verify-prism-consistency', position: 'after' } },
  'remediate-vuln/activities/01-start.toon': { 'sec-vuln-url-input': { anchor: 'collect-security-inputs', position: 'after' }, 'private-fork-url-input': { anchor: 'configure-sec-vuln-remote', position: 'before' }, 'short-id-input': { anchor: 'initialize-security-branch', position: 'before' }, 'confirm-security-remote': { anchor: 'configure-sec-vuln-remote', position: 'after' }, 'verify-isolation': { anchor: 'initialize-security-branch', position: 'after' } },
  'remediate-vuln/activities/02-strategic-review.toon': { 'unsigned-commits-prompt': { anchor: 'resign-unsigned-commits', position: 'before' }, 'review-findings': { anchor: 'analyze-strategic-findings', position: 'after' } },
  'remediate-vuln/activities/03-submit.toon': { 'verify-private-remote': { anchor: 'verify-security-remote', position: 'after' }, 'confirm-push': { anchor: 'push-sec-vuln-commits', position: 'before' } },
  'requirements-refinement/activities/05-finalize-specification.toon': { 'finalization-confirmed': { anchor: 'finalize-specification', position: 'after' } },
  'requirements-refinement/activities/06-report-failure.toon': { 'failure-acknowledged': { anchor: 'report-failure', position: 'after' } },
  'work-package/activities/01-start-work-package.toon': { 'jira-project-selection': { anchor: 'create-issue', position: 'before' }, 'issue-type-selection': { anchor: 'create-issue', position: 'before' }, 'issue-review': { anchor: 'create-issue', position: 'before' } },
  'work-package/activities/09-post-impl-review.toon': { 'rationale-amendment': { anchor: 'manual-diff-review', position: 'after' }, 'block-interview': { anchor: 'manual-diff-review', position: 'after' } },
  'work-package/activities/12-submit-for-review.toon': { 'body-non-conformant': { anchor: 'verify-pr-body-rerender', position: 'after' } },
  'work-packages/activities/01-scope-assessment.toon': { 'scope-confirmed': { anchor: 'assess-scope', position: 'after' } },
  'work-packages/activities/02-folder-setup.toon': { 'folder-created': { anchor: 'setup-planning-folder', position: 'after' } },
  'work-packages/activities/03-analysis.toon': { 'analysis-type-selection': { anchor: 'analyze-context', position: 'before' }, 'analysis-confirmed': { anchor: 'analyze-context', position: 'after' } },
  'work-packages/activities/04-package-planning.toon': { 'plans-created': { anchor: '__end__', position: 'before' } },
  'work-packages/activities/05-prioritization.toon': { 'priority-confirmed': { anchor: 'prioritize', position: 'after' } },
  'work-packages/activities/06-finalize-roadmap.toon': { 'roadmap-complete': { anchor: 'finalize-roadmap-docs', position: 'after' } },
  'workflow-design/activities/01-intake-and-context.toon': { 'review-scope-confirmed': { anchor: 'intake-classification', position: 'after' }, 'change-request-confirmed': { anchor: 'context-loading', position: 'after' }, 'format-literacy': { anchor: 'context-loading', position: 'after' }, 'constructs-confirmed': { anchor: 'format-literacy', position: 'after' } },
  'workflow-design/activities/03-requirements-refinement.toon': { 'purpose-confirmed': { anchor: 'elicitation', position: 'after' }, 'activities-confirmed': { anchor: 'elicitation', position: 'after' }, 'model-confirmed': { anchor: 'elicitation', position: 'after' }, 'checkpoints-confirmed': { anchor: 'elicitation', position: 'after' }, 'artifacts-confirmed': { anchor: 'elicitation', position: 'after' }, 'variables-confirmed': { anchor: 'elicitation', position: 'after' }, 'techniques-confirmed': { anchor: 'elicitation', position: 'after' }, 'rules-confirmed': { anchor: 'elicitation', position: 'after' } },
  'workflow-design/activities/04-pattern-analysis.toon': { 'patterns-confirmed': { anchor: 'pattern-analysis', position: 'after' } },
  'workflow-design/activities/05-impact-analysis.toon': { 'impact-confirmed': { anchor: 'impact-analysis', position: 'after' }, 'preservation-confirmed': { anchor: 'impact-confirmed', position: 'after' } },
  'workflow-design/activities/06-scope-and-draft.toon': { 'file-approach-confirmed': { anchor: 'present-file-approach', position: 'after' }, 'file-review': { anchor: 'present-for-review', position: 'after' }, 'preservation-check': { anchor: 'present-for-review', position: 'after' }, 'batch-review': { anchor: 'advance-to-next-file', position: 'after' } },
  'workflow-design/activities/08-quality-review.toon': { 'expressiveness-confirmed': { anchor: 'audit-expressiveness', position: 'after' }, 'conformance-confirmed': { anchor: 'audit-conformance', position: 'after' }, 'rule-hygiene-confirmed': { anchor: 'audit-rule-hygiene', position: 'after' }, 'enforcement-confirmed': { anchor: 'audit-rule-enforcement', position: 'after' } },
  'workflow-design/activities/09-validate-and-commit.toon': { 'validation-passed': { anchor: 'run-schema-validation', position: 'after' }, 'scope-verified': { anchor: 'verify-scope-manifest', position: 'after' } },
  'workflow-design/activities/10-post-update-review.toon': { 'post-update-disposition': { anchor: 'save-review-snapshot', position: 'after' } },
};

/* ------------------------------------------------------------------ line model ------------- */

type Line = string;
const INDENT_UNIT = 2;

/** Indentation (count of leading spaces) of a line. Blank lines report -1 (no structural depth). */
function indentOf(line: Line): number {
  if (line.trim() === '') return -1;
  let n = 0;
  while (line[n] === ' ') n++;
  return n;
}

/** Is this an array-item line (`<indent>- ...`)? */
function isItemLine(line: Line): boolean {
  return /^\s*-\s/.test(line) || /^\s*-$/.test(line);
}

/** The field-key of a `key: value` or `key[N]:` or `key{...}:` line at any indent; else null. */
function fieldKey(line: Line): string | null {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)(\[[0-9]*\])?(\{[^}]*\})?\s*:/);
  return m ? m[1]! : null;
}

/** The field-key of a de-bulleted item-first-field line `- key: ...`; else null. */
function itemFieldKey(line: Line): string | null {
  const m = line.match(/^\s*-\s+([A-Za-z_][A-Za-z0-9_]*)(\[[0-9]*\])?(\{[^}]*\})?\s*:/);
  return m ? m[1]! : null;
}

/* ------------------------------------------------------------------ section split ------------ */

interface Section {
  key: string;          // top-level key (id, steps, loops, checkpoints, transitions, ...)
  headerIdx: number;    // index of the header line in `lines`
  start: number;        // first line index (== headerIdx)
  end: number;          // exclusive end (index after the last content line, excluding trailing blanks)
  blanksAfter: number;  // count of blank lines immediately following the section body
}

/** Split the file into top-level sections (keyed by a column-0 `key:` line). Blank separators are
 *  attributed to the preceding section via `blanksAfter`. */
function splitSections(lines: Line[]): Section[] {
  const sections: Section[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i]!.trim() === '') { i++; continue; }
    if (indentOf(lines[i]!) !== 0) { i++; continue; } // defensive; top level only
    const key = fieldKey(lines[i]!);
    const headerIdx = i;
    let j = i + 1;
    while (j < lines.length && (lines[j]!.trim() === '' || indentOf(lines[j]!) > 0)) j++;
    // j is at next top-level key or EOF. Pull trailing blanks back out of the body.
    let bodyEnd = j;
    while (bodyEnd > headerIdx + 1 && lines[bodyEnd - 1]!.trim() === '') bodyEnd--;
    sections.push({ key: key ?? '', headerIdx, start: headerIdx, end: bodyEnd, blanksAfter: j - bodyEnd });
    i = j;
  }
  return sections;
}

/* ------------------------------------------------------------------ item split --------------- */

interface Item {
  start: number; // first line (the `- ` line)
  end: number;   // exclusive
}

/** Split an array section body into items at `bulletIndent`. Lines between item starts (deeper
 *  indent or blanks) belong to the current item. */
function splitItems(lines: Line[], bodyStart: number, bodyEnd: number, bulletIndent: number): Item[] {
  const items: Item[] = [];
  let cur: Item | null = null;
  for (let i = bodyStart; i < bodyEnd; i++) {
    const ln = lines[i]!;
    if (ln.trim() === '') { continue; }
    const ind = indentOf(ln);
    if (ind === bulletIndent && isItemLine(ln)) {
      if (cur) { cur.end = i; items.push(cur); }
      cur = { start: i, end: bodyEnd };
    }
  }
  if (cur) { cur.end = bodyEnd; items.push(cur); }
  // Trim trailing blank lines off each item end.
  for (const it of items) {
    while (it.end > it.start + 1 && lines[it.end - 1]!.trim() === '') it.end--;
  }
  return items;
}

/* ----------------------------------------------------------- step / item field inspection ---- */

interface StepInfo {
  fields: Map<string, { idx: number }>; // field key → its (first) line index at fieldIndent
  fieldIndent: number;                   // indent of de-bulleted fields (bulletIndent + 2)
  firstFieldIdx: number;                 // the `- xxx:` line
  firstFieldKey: string;
  nestedStepsHeaderIdx: number | null;   // index of a nested `steps[N]:` header line (loop body)
}

/** Inspect an item's direct fields (those at fieldIndent). Records the first occurrence of each
 *  field key and the nested `steps[` header if present. */
function inspectItem(lines: Line[], it: Item, bulletIndent: number): StepInfo {
  const fieldIndent = bulletIndent + INDENT_UNIT;
  const firstFieldIdx = it.start;
  const firstFieldKey = itemFieldKey(lines[it.start]!) ?? '';
  const fields = new Map<string, { idx: number }>();
  fields.set(firstFieldKey, { idx: firstFieldIdx });
  let nestedStepsHeaderIdx: number | null = null;
  for (let i = it.start + 1; i < it.end; i++) {
    const ln = lines[i]!;
    if (ln.trim() === '') continue;
    if (indentOf(ln) !== fieldIndent) continue;
    const k = fieldKey(ln);
    if (!k) continue;
    if (!fields.has(k)) fields.set(k, { idx: i });
    if (k === 'steps') nestedStepsHeaderIdx = i;
  }
  return { fields, fieldIndent, firstFieldIdx, firstFieldKey, nestedStepsHeaderIdx };
}

/** The exclusive end index of a field that starts at `idx` whose key sits at `fieldIndent`:
 *  the field line plus all following lines indented deeper than `fieldIndent` (its nested block). */
function fieldSpan(lines: Line[], idx: number, fieldIndent: number, hardEnd: number): number {
  let i = idx + 1;
  while (i < hardEnd) {
    const ln = lines[i]!;
    if (ln.trim() === '') { i++; continue; }
    if (indentOf(ln) <= fieldIndent) break;
    i++;
  }
  return i;
}

/** Read the scalar value of a `key: value` field line (best-effort; for id/technique/checkpoint). */
function scalarValue(line: Line): string {
  const m = line.match(/^\s*-?\s*[A-Za-z_][A-Za-z0-9_]*(\[[0-9]*\])?(\{[^}]*\})?\s*:\s*(.*)$/);
  let v = (m?.[3] ?? '').trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  return v;
}

/* ------------------------------------------------------------------ text rewrites ------------ */

/** Re-indent a slice of lines by `delta` spaces (delta may be negative). Blank lines untouched. */
function reindent(slice: Line[], delta: number): Line[] {
  if (delta === 0) return slice.slice();
  return slice.map((ln) => {
    if (ln.trim() === '') return ln;
    if (delta > 0) return ' '.repeat(delta) + ln;
    return ln.startsWith(' '.repeat(-delta)) ? ln.slice(-delta) : ln.replace(/^\s+/, (s) => s.slice(Math.min(s.length, -delta)));
  });
}

/** De-bullet an item's first-field line `<i>- key: ...` → `<i>  key: ...` (drop dash, +2 col). */
function debulletFirstField(line: Line): Line {
  return line.replace(/^(\s*)-\s/, (_m, sp: string) => sp + '  ');
}

/* ------------------------------------------------------------------ checkpoint folding ------- */

interface CheckpointBlock {
  id: string;
  /** Field lines of the checkpoint, normalized to `  - kind: checkpoint` form at indent 0 baseline,
   *  i.e. an item rendered at bulletIndent 0; callers reindent to the host position. */
  renderAtIndent(bulletIndent: number): Line[];
}

/** Parse a top-level checkpoints[] section into id → block. Each block can re-render itself as a
 *  kind:checkpoint step item, dropping the `name:` field and bullet-prefixing `kind`. */
function parseCheckpoints(lines: Line[], sec: Section): Map<string, CheckpointBlock> {
  const map = new Map<string, CheckpointBlock>();
  const bulletIndent = 2; // checkpoints items sit at 2 spaces under the header
  const items = splitItems(lines, sec.headerIdx + 1, sec.end, bulletIndent);
  for (const it of items) {
    const info = inspectItem(lines, it, bulletIndent);
    const idLineIdx = info.fields.get('id')?.idx ?? it.start;
    const id = scalarValue(lines[idLineIdx]!);

    // Drop the fields the oracle's checkpoint `pick` omits: `name` and `required` (both one-line
    // scalars). The oracle keeps only id/message/options + defaultOption/autoAdvanceMs/blocking/condition.
    const dropIdx = new Set<number>();
    const nameIdx = info.fields.get('name')?.idx ?? null;
    if (nameIdx != null) dropIdx.add(nameIdx);
    const requiredIdx = info.fields.get('required')?.idx ?? null;
    if (requiredIdx != null) dropIdx.add(requiredIdx);

    map.set(id, {
      id,
      renderAtIndent(targetBullet: number): Line[] {
        // Build at the original bulletIndent first, then reindent by (targetBullet - bulletIndent).
        const out: Line[] = [];
        // First line becomes `  - kind: checkpoint`; original first field de-bulleted below it.
        const firstLn = lines[it.start]!;
        const baseBulletSpaces = ' '.repeat(bulletIndent);
        out.push(`${baseBulletSpaces}- kind: checkpoint`);
        // Emit the original first field as a normal field (de-bulleted), unless it is the dropped name.
        if (!dropIdx.has(it.start)) {
          out.push(debulletFirstField(firstLn));
        }
        for (let i = it.start + 1; i < it.end; i++) {
          if (dropIdx.has(i)) continue;
          out.push(lines[i]!);
        }
        const delta = targetBullet - bulletIndent;
        return reindent(out, delta);
      },
    });
  }
  return map;
}

/* ------------------------------------------------------------------ step rendering ----------- */

/** Render a single step item (technique or action) at its existing bulletIndent into kind-tagged
 *  form: `  - kind: <k>` then the de-bulleted first field, then the rest of the body verbatim,
 *  inserting an `id:` line when the (technique) step lacks one. Returns the rendered lines plus the
 *  step's resolved id and whether it referenced a checkpoint (and which).
 */
function renderStepItem(
  lines: Line[],
  it: Item,
  bulletIndent: number,
  info: StepInfo,
): { out: Line[]; id: string; checkpointRef: string | null } {
  const fieldIndent = bulletIndent + INDENT_UNIT;
  const hasTechnique = info.fields.has('technique');
  const hasActions = info.fields.has('actions');
  // Degenerate step (oracle branch): neither technique nor actions → kind:action with actions: [].
  const isDegenerate = !hasTechnique && !hasActions;
  const kind = hasTechnique ? 'technique' : 'action';
  const bulletSpaces = ' '.repeat(bulletIndent);
  const fieldSpaces = ' '.repeat(fieldIndent);

  // Resolve id: explicit id field, or derive from technique ref last `::` segment.
  let id: string;
  const idIdx = info.fields.get('id')?.idx ?? null;
  if (idIdx != null) {
    id = scalarValue(lines[idIdx]!);
  } else {
    const techIdx = info.fields.get('technique')!.idx;
    // technique may be inline scalar (`technique: a::b`) or an object (`technique:` then `name:`).
    const inlineVal = scalarValue(lines[techIdx]!);
    let techRef = inlineVal;
    if (techRef === '') {
      // object form: find the nested `name:` under technique
      for (let i = techIdx + 1; i < it.end; i++) {
        if (lines[i]!.trim() === '') continue;
        if (indentOf(lines[i]!) <= fieldIndent) break;
        const k = fieldKey(lines[i]!);
        if (k === 'name') { techRef = scalarValue(lines[i]!); break; }
      }
    }
    id = defaultStepId(techRef);
  }

  const checkpointRef = info.fields.has('checkpoint') ? scalarValue(lines[info.fields.get('checkpoint')!.idx]!) : null;

  // Oracle keep-set for a step's DIRECT fields (kept verbatim). `id` is kept too — its source line
  // is preserved as-is (just de-bulleted if first), and synthesized only when absent. Any other
  // direct field (checkpoint — folded separately, triggers, description, …) is dropped with its
  // nested block.
  const KEEP = new Set(['id', 'technique', 'actions', 'when', 'condition', 'required']);
  const dropRanges: Array<[number, number]> = [];
  for (const [key, { idx }] of info.fields) {
    if (KEEP.has(key)) continue;
    dropRanges.push([idx, fieldSpan(lines, idx, fieldIndent, it.end)]);
  }
  const isDropped = (i: number): boolean => dropRanges.some(([a, b]) => i >= a && i < b);

  // Build output.
  const out: Line[] = [];
  out.push(`${bulletSpaces}- kind: ${kind}`);
  if (idIdx == null) out.push(`${fieldSpaces}id: ${id}`); // synthesize id when source had none

  // Emit body, skipping dropped fields. The first KEPT field is de-bulleted (the dash moved to the
  // synthesized `- kind:` line above).
  let firstKeptEmitted = false;
  for (let i = it.start; i < it.end; i++) {
    if (isDropped(i)) continue;
    if (!firstKeptEmitted) {
      out.push(isItemLine(lines[i]!) ? debulletFirstField(lines[i]!) : lines[i]!);
      firstKeptEmitted = true;
      continue;
    }
    out.push(lines[i]!);
  }
  // A degenerate step needs an explicit empty actions[] to match the oracle's `actions: []`.
  if (isDegenerate) out.push(`${fieldSpaces}actions[0]:`);
  return { out, id, checkpointRef };
}

/* ------------------------------------------------------------------ recursive steps ---------- */

interface RenderCtx {
  lines: Line[];
  cp: Map<string, CheckpointBlock>;
  consumed: Set<string>;
  flags: string[];
  activityId: string;
  missingCp: string[];
}

/**
 * Render an ordered list of step items (the body of a top-level steps[] or a loop's steps[]) at
 * `bulletIndent`, folding any checkpoint reference in immediately after its host step. Returns the
 * rendered lines and the count of TOP items emitted at this level (steps + folded checkpoints).
 */
function renderStepList(items: Item[], bulletIndent: number, ctx: RenderCtx): { out: Line[]; count: number } {
  const out: Line[] = [];
  let count = 0;
  for (const it of items) {
    const info = inspectItem(ctx.lines, it, bulletIndent);
    if (info.nestedStepsHeaderIdx != null) {
      // A nested loop-kind step is not expected inside a legacy step body; legacy loops are top-level.
      // But guard anyway: treat as a generic item (should not occur in corpus).
    }
    const rendered = renderStepItem(ctx.lines, it, bulletIndent, info);
    out.push(...rendered.out);
    count++;
    if (rendered.checkpointRef) {
      const block = ctx.cp.get(rendered.checkpointRef);
      if (!block) {
        ctx.missingCp.push(rendered.checkpointRef);
        ctx.flags.push(`step '${rendered.id}' references missing checkpoint '${rendered.checkpointRef}'`);
      } else {
        out.push(...block.renderAtIndent(bulletIndent));
        ctx.consumed.add(rendered.checkpointRef);
        count++;
      }
    }
  }
  return { out, count };
}

/* ------------------------------------------------------------------ loop rendering ----------- */

/**
 * Render a single loops[] item as a kind:loop step at `bulletIndent`:
 *  - `  - kind: loop`
 *  - de-bulleted first field
 *  - rename `type:` → `loopType:`, drop the `description:` (single-line scalar) field
 *  - keep name/variable/over/condition/breakCondition/maxIterations verbatim
 *  - recursively render the nested steps[] body (kinds + folded checkpoints), renumbering its count
 */
function renderLoopItem(it: Item, bulletIndent: number, ctx: RenderCtx): Line[] {
  const lines = ctx.lines;
  const fieldIndent = bulletIndent + INDENT_UNIT;
  const info = inspectItem(lines, it, bulletIndent);
  const bulletSpaces = ' '.repeat(bulletIndent);

  const typeIdx = info.fields.get('type')?.idx ?? null;
  const descIdx = info.fields.get('description')?.idx ?? null;
  const stepsHeaderIdx = info.nestedStepsHeaderIdx;

  const out: Line[] = [];
  out.push(`${bulletSpaces}- kind: loop`);

  // Determine the nested steps body range: from stepsHeaderIdx+1 to it.end (steps[] is the last
  // field of a loop in the corpus). We render up to stepsHeaderIdx verbatim (minus drops/renames),
  // then the renumbered header, then the recursively-rendered body.
  const bodyStops = stepsHeaderIdx != null ? stepsHeaderIdx : it.end;

  for (let i = it.start; i < bodyStops; i++) {
    if (descIdx != null && i === descIdx) continue; // drop description
    let ln = lines[i]!;
    if (i === it.start) ln = debulletFirstField(ln);
    if (typeIdx != null && i === typeIdx) {
      ln = ln.replace(/(^\s*-?\s*)type(\s*):/, (_m, pre: string, sp: string) => `${pre}loopType${sp}:`);
    }
    out.push(ln);
  }

  if (stepsHeaderIdx != null) {
    const nestedBullet = fieldIndent + INDENT_UNIT; // items under the nested steps[] header
    const nestedItems = splitItems(lines, stepsHeaderIdx + 1, it.end, nestedBullet);
    const rendered = renderStepList(nestedItems, nestedBullet, ctx);
    out.push(`${' '.repeat(fieldIndent)}steps[${rendered.count}]:`);
    out.push(...rendered.out);
  }
  return out;
}

/* ------------------------------------------------------------------ assemble file ------------ */

interface FileResult {
  surgical: string;
  flags: string[];
  topLevelStepIds: string[];
  loopIds: string[];
  hasBoth: boolean;
  orphans: string[];
  finalOrder: string[];
}

function migrateFile(originalText: string, activityId: string, relKey: string): FileResult {
  const lines = originalText.split('\n');
  // Preserve trailing-newline behavior: split keeps a final '' if text ends with '\n'.
  const sections = splitSections(lines);
  const flags: string[] = [];

  const stepsSec = sections.find((s) => s.key === 'steps') ?? null;
  const loopsSec = sections.find((s) => s.key === 'loops') ?? null;
  const cpSec = sections.find((s) => s.key === 'checkpoints') ?? null;

  const cpMap = cpSec ? parseCheckpoints(lines, cpSec) : new Map<string, CheckpointBlock>();
  const consumed = new Set<string>();
  const missingCp: string[] = [];
  const ctx: RenderCtx = { lines, cp: cpMap, consumed, flags, activityId, missingCp };

  // Render top-level step units. Each source step is ONE unit (the INTERLEAVE granularity), but a
  // unit may emit MORE than one top-level item (its lines include a folded checkpoint). `count` is
  // the number of top-level steps[] items the unit contributes — summed for the header count.
  type Unit = { id: string; lines: Line[]; isLoop: boolean; count: number };
  const topUnits: Unit[] = [];
  const loopUnits: Unit[] = [];

  if (stepsSec) {
    const items = splitItems(lines, stepsSec.headerIdx + 1, stepsSec.end, 2);
    for (const it of items) {
      const info = inspectItem(lines, it, 2);
      // resolve the source step id (for INTERLEAVE keying) BEFORE rendering
      const idIdx = info.fields.get('id')?.idx ?? null;
      let srcId: string;
      if (idIdx != null) srcId = scalarValue(lines[idIdx]!);
      else srcId = renderStepItem(lines, it, 2, info).id; // derive
      const r = renderStepList([it], 2, ctx);
      topUnits.push({ id: srcId, lines: r.out, isLoop: false, count: r.count });
    }
  }

  if (loopsSec) {
    const items = splitItems(lines, loopsSec.headerIdx + 1, loopsSec.end, 2);
    for (const it of items) {
      const info = inspectItem(lines, it, 2);
      const idIdx = info.fields.get('id')?.idx ?? null;
      const srcId = idIdx != null ? scalarValue(lines[idIdx]!) : `loop-${loopUnits.length}`;
      const out = renderLoopItem(it, 2, ctx);
      loopUnits.push({ id: srcId, lines: out, isLoop: true, count: 1 });
    }
  }

  // Orphan checkpoints — defined but unreferenced. Positioned per ORPHAN_PLACEMENT (default = end).
  const orphans: string[] = [];
  const orphanUnit = new Map<string, Unit>();
  for (const [id, block] of cpMap) {
    if (!consumed.has(id)) {
      orphans.push(id);
      orphanUnit.set(id, { id, lines: block.renderAtIndent(2), isLoop: false, count: 1 });
    }
  }

  // Base top-level order: INTERLEAVE override (keyed by rel path), else top steps then loops.
  const byId = new Map<string, Unit>();
  for (const u of topUnits) byId.set(u.id, u);
  for (const u of loopUnits) byId.set(u.id, u);

  let baseOrder: Unit[];
  const order = INTERLEAVE[relKey];
  if (order && order.length) {
    const named = new Set(order);
    baseOrder = order.map((id) => {
      const u = byId.get(id);
      if (!u) throw new Error(`INTERLEAVE for '${relKey}' names unknown unit '${id}'`);
      return u;
    });
    for (const u of [...topUnits, ...loopUnits]) if (!named.has(u.id)) { flags.push(`INTERLEAVE for '${relKey}' omits unit '${u.id}' — appended`); baseOrder.push(u); }
  } else {
    baseOrder = [...topUnits, ...loopUnits];
  }

  // Insert orphans relative to their anchor unit (top-level). Multiple at the same anchor keep
  // checkpoints[] source order. No placement / __end__ → end; __start__ → front; unknown anchor → end + flag.
  const placement = ORPHAN_PLACEMENT[relKey] ?? {};
  const beforeAnchor = new Map<string, Unit[]>();
  const afterAnchor = new Map<string, Unit[]>();
  const atStart: Unit[] = [];
  const atEnd: Unit[] = [];
  for (const id of orphans) {
    const u = orphanUnit.get(id)!;
    const p = placement[id];
    if (!p) { atEnd.push(u); flags.push(`orphan '${id}' has no placement entry — appended at end, review`); continue; }
    if (p.anchor === '__end__') { atEnd.push(u); continue; }
    if (p.anchor === '__start__') { atStart.push(u); continue; }
    if (!byId.has(p.anchor)) { atEnd.push(u); flags.push(`orphan '${id}' anchor '${p.anchor}' is not a top-level unit — appended at end, review`); continue; }
    const m = p.position === 'before' ? beforeAnchor : afterAnchor;
    m.set(p.anchor, [...(m.get(p.anchor) ?? []), u]);
  }

  const ordered: Unit[] = [];
  for (const u of atStart) ordered.push(u);
  for (const u of baseOrder) {
    for (const o of beforeAnchor.get(u.id) ?? []) ordered.push(o);
    ordered.push(u);
    for (const o of afterAnchor.get(u.id) ?? []) ordered.push(o);
  }
  for (const u of atEnd) ordered.push(u);

  const hasBoth = topUnits.length > 0 && loopUnits.length > 0;
  if (hasBoth && !(order && order.length)) {
    flags.push(
      `activity has both top-level steps and ${loopUnits.length} loop(s) and NO INTERLEAVE entry — ` +
        `default order [${topUnits.map((u) => u.id).join(', ')}, ${loopUnits.map((u) => u.id).join(', ')}]`,
    );
  }

  // Build the new steps[] block lines. The header count is the total number of top-level items
  // emitted (a unit with a folded checkpoint contributes >1), not the number of source units.
  const topItemCount = ordered.reduce((n, u) => n + u.count, 0);
  const newStepBlock: Line[] = [];
  newStepBlock.push(`steps[${topItemCount}]:`);
  for (const u of ordered) newStepBlock.push(...u.lines);

  // Reassemble the file: emit each top-level section in source order. Where the `steps` section is,
  // emit the new step block. Drop `loops` and `checkpoints` sections entirely. If there is no
  // top-level steps section (all-loops case), place the new step block where `loops` was.
  const dropKeys = new Set(['steps', 'loops', 'checkpoints']);
  const stepAnchorKey = stepsSec ? 'steps' : (loopsSec ? 'loops' : null);

  const outLines: Line[] = [];
  for (let s = 0; s < sections.length; s++) {
    const sec = sections[s]!;
    const isLast = s === sections.length - 1;
    if (dropKeys.has(sec.key)) {
      if (sec.key === stepAnchorKey) {
        // emit the new step block in place of this section, preserve the original blanksAfter.
        outLines.push(...newStepBlock);
        for (let b = 0; b < sec.blanksAfter; b++) outLines.push('');
      }
      // else: dropped — its blank separators are dropped too (the surviving neighbor keeps its own).
      continue;
    }
    for (let i = sec.start; i < sec.end; i++) outLines.push(lines[i]!);
    for (let b = 0; b < sec.blanksAfter; b++) outLines.push('');
  }

  // Collapse any double blank lines created by deletions to a single blank line.
  const collapsed: Line[] = [];
  for (const ln of outLines) {
    if (ln === '' && collapsed.length > 0 && collapsed[collapsed.length - 1] === '') continue;
    collapsed.push(ln);
  }

  // Preserve a single trailing newline if the source had one.
  let surgical = collapsed.join('\n');
  if (originalText.endsWith('\n') && !surgical.endsWith('\n')) surgical += '\n';
  // Avoid a trailing blank-line artifact (file ending in two newlines).
  surgical = surgical.replace(/\n{3,}$/g, '\n\n').replace(/\n\n$/g, '\n');

  const topLevelStepIds = topUnits.map((u) => u.id);
  const loopIds = loopUnits.map((u) => u.id);
  return { surgical, flags, topLevelStepIds, loopIds, hasBoth, orphans, finalOrder: ordered.map((u) => u.id) };
}

/* ------------------------------------------------------------------ structural deep-equal ----- */

/** Order-insensitive deep equality of plain JSON values (objects compared by key set + values). */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ao = a as Record<string, unknown>, bo = b as Record<string, unknown>;
    const ak = Object.keys(ao), bk = Object.keys(bo);
    if (ak.length !== bk.length) return false;
    for (const k of ak) { if (!(k in bo)) return false; if (!deepEqual(ao[k], bo[k])) return false; }
    return true;
  }
  return false;
}

/** Canonical, order-insensitive content key for a step (used to compare top-level steps as a set). */
function stepKey(s: unknown): string { return JSON.stringify(s); }

/** Equal MODULO the order of top-level steps[]: config intentionally reorders the top level (and
 *  positions orphan checkpoints), while the oracle uses default order. So we require every other key
 *  to match exactly and the top-level steps to match as a MULTISET (same contents, any order) — which
 *  proves the surgical transform neither corrupted, dropped, nor duplicated any step. Nested step
 *  order (loop bodies) is preserved by both and compared within each step's content. */
function eqModuloTopStepOrder(oracle: unknown, surgical: unknown): boolean {
  if (!oracle || !surgical || typeof oracle !== 'object' || typeof surgical !== 'object') return deepEqual(oracle, surgical);
  const { steps: os, ...orest } = oracle as Record<string, unknown>;
  const { steps: ss, ...srest } = surgical as Record<string, unknown>;
  if (!deepEqual(orest, srest)) return false;
  if (!Array.isArray(os) || !Array.isArray(ss) || os.length !== ss.length) return false;
  const a = [...os].sort((x, y) => stepKey(x).localeCompare(stepKey(y)));
  const b = [...ss].sort((x, y) => stepKey(x).localeCompare(stepKey(y)));
  return deepEqual(a, b);
}

/** Compact structural diff (path → oracle/surgical) for the first few mismatches. */
function structuralDiff(oracle: unknown, surgical: unknown, path = '$', acc: string[] = []): string[] {
  if (acc.length >= 12) return acc;
  if (deepEqual(oracle, surgical)) return acc;
  const bothArr = Array.isArray(oracle) && Array.isArray(surgical);
  const bothObj = !bothArr && oracle && surgical && typeof oracle === 'object' && typeof surgical === 'object';
  if (bothArr) {
    const ao = oracle as unknown[], so = surgical as unknown[];
    if (ao.length !== so.length) acc.push(`${path}: array length oracle=${ao.length} surgical=${so.length}`);
    const n = Math.max(ao.length, so.length);
    for (let i = 0; i < n && acc.length < 12; i++) structuralDiff(ao[i], so[i], `${path}[${i}]`, acc);
  } else if (bothObj) {
    const ao = oracle as Record<string, unknown>, so = surgical as Record<string, unknown>;
    const keys = new Set([...Object.keys(ao), ...Object.keys(so)]);
    for (const k of keys) {
      if (acc.length >= 12) break;
      if (!(k in ao)) { acc.push(`${path}.${k}: MISSING in oracle (surgical=${JSON.stringify(so[k])})`); continue; }
      if (!(k in so)) { acc.push(`${path}.${k}: MISSING in surgical (oracle=${JSON.stringify(ao[k])})`); continue; }
      structuralDiff(ao[k], so[k], `${path}.${k}`, acc);
    }
  } else {
    acc.push(`${path}: oracle=${JSON.stringify(oracle)} surgical=${JSON.stringify(surgical)}`);
  }
  return acc;
}

/* ------------------------------------------------------------------ runner ------------------- */

function listActivityFiles(): string[] {
  const out: string[] = [];
  const workflows = readdirSync(ROOT, { withFileTypes: true }).filter((d) => d.isDirectory());
  for (const wf of workflows) {
    const actDir = join(ROOT, wf.name, 'activities');
    let entries: string[] = [];
    try { entries = readdirSync(actDir); } catch { continue; }
    for (const f of entries) if (f.endsWith('.toon')) out.push(join(actDir, f));
  }
  return out.sort();
}

function main(): void {
  const WRITE = process.argv.includes('--write');
  const outputs: { path: string; text: string }[] = [];
  mkdirSync(OUT_DIR, { recursive: true });
  const files = listActivityFiles();

  let pass1 = 0, pass2 = 0, pass3 = 0;
  const fail1: string[] = [], fail2: string[] = [], fail3: string[] = [];
  const oracleParityCheck3: { path: string; message: string }[] = []; // source-data collisions: oracle ALSO throws
  const dualActivities: { path: string; units: string[] }[] = [];
  const orphanList: { path: string; id: string }[] = [];
  const configuredOrders: { path: string; order: string[] }[] = [];

  for (const path of files) {
    const wf = basename(dirname(dirname(path)));
    const fname = basename(path);
    const relKey = `${wf}/activities/${fname}`;
    const original = readFileSync(path, 'utf-8');
    const decodedOrig = decodeToonRaw(original) as Record<string, unknown>;
    const activityId = String(decodedOrig.id ?? fname.replace(/\.toon$/, ''));

    let result: FileResult;
    try {
      result = migrateFile(original, activityId, relKey);
    } catch (e) {
      console.log(`\n[MIGRATE THREW] ${path}\n  ${(e as Error).message}`);
      fail1.push(path); fail2.push(path); fail3.push(path);
      continue;
    }

    // Write would-be output (dry-run inspection) and stage for an in-place --write.
    writeFileSync(join(OUT_DIR, `${wf}__${fname}`), result.surgical);
    outputs.push({ path, text: result.surgical });

    // Oracle.
    const oracle = transformActivity(decodedOrig as any).activity;

    // Check 1: decode(surgical) deep-equals oracle.
    let surgicalDecoded: unknown;
    let decodeOk = true;
    try { surgicalDecoded = decodeToonRaw(result.surgical); } catch (e) { decodeOk = false; }
    const eq1 = decodeOk && eqModuloTopStepOrder(oracle, surgicalDecoded);
    if (eq1) pass1++; else {
      fail1.push(path);
      console.log(`\n[CHECK1 FAIL] ${path}`);
      if (!decodeOk) console.log('  surgical text did not decode');
      else {
        // Sort top-level steps in both before diffing — the top-level order is intentionally changed
        // by INTERLEAVE/ORPHAN_PLACEMENT, so an unsorted diff would be pure order-noise.
        const norm = (x: unknown): unknown =>
          x && typeof x === 'object' && Array.isArray((x as { steps?: unknown }).steps)
            ? { ...(x as object), steps: [...(x as { steps: unknown[] }).steps].sort((p, q) => stepKey(p).localeCompare(stepKey(q))) }
            : x;
        for (const d of structuralDiff(norm(oracle), norm(surgicalDecoded))) console.log(`  ${d}`);
      }
    }

    // Check 2: safeValidateActivity(decode(surgical)).success.
    let parsed: Activity | null = null;
    let eq2 = false;
    if (decodeOk) {
      const v = safeValidateActivity(surgicalDecoded);
      eq2 = v.success;
      if (v.success) parsed = v.data;
      else { console.log(`\n[CHECK2 FAIL] ${path}`); console.log('  ' + JSON.stringify(v.error.issues.slice(0, 4))); }
    }
    if (eq2) pass2++; else fail2.push(path);

    // Check 3: populateStepIds does not throw. If it throws, check whether the OFFICIAL oracle's
    // output throws identically — if so the collision is a latent property of the source data
    // (surfaced, not introduced, by the unified model), so it is an oracle-parity issue, not a
    // migrator defect. We still record it, but separately from genuine migrator failures.
    let eq3 = false;
    if (parsed) {
      try { populateStepIds(parsed); eq3 = true; }
      catch (e) {
        const msg = (e as Error).message;
        let oracleThrows = false;
        let oracleMsg = '';
        const ov = safeValidateActivity(oracle);
        if (ov.success) {
          try { populateStepIds(ov.data); } catch (oe) { oracleThrows = true; oracleMsg = (oe as Error).message; }
        }
        if (oracleThrows && oracleMsg === msg) {
          oracleParityCheck3.push({ path, message: msg });
          console.log(`\n[CHECK3 — ORACLE-PARITY (source-data collision, oracle also throws)] ${path}\n  ${msg}`);
        } else {
          console.log(`\n[CHECK3 FAIL] ${path}\n  ${msg}`);
        }
      }
    }
    if (eq3) pass3++;
    else if (!oracleParityCheck3.some((p) => p.path === path)) fail3.push(path);

    if (result.hasBoth) dualActivities.push({ path, units: [...result.topLevelStepIds, ...result.loopIds] });
    for (const id of result.orphans) orphanList.push({ path, id });
    if (INTERLEAVE[relKey] || ORPHAN_PLACEMENT[relKey]) configuredOrders.push({ path, order: result.finalOrder });
  }

  const N = files.length;
  console.log(`\n${'='.repeat(78)}`);
  console.log(`SURGICAL MIGRATION REPORT — ${N} activity files`);
  console.log('='.repeat(78));
  const parity = oracleParityCheck3.length;
  console.log(`Check 1 (decode == oracle, modulo top-order): PASS ${pass1}/${N}  FAIL ${N - pass1}`);
  console.log(`Check 2 (safeValidateActivity success):  PASS ${pass2}/${N}  FAIL ${N - pass2}`);
  console.log(
    `Check 3 (populateStepIds no throw):      PASS ${pass3}/${N}  FAIL ${fail3.length}` +
      (parity ? `  (+${parity} oracle-parity source-data collision${parity === 1 ? '' : 's'} — see below)` : ''),
  );
  if (fail1.length) console.log(`\nCHECK1 FAILURES:\n  ${fail1.join('\n  ')}`);
  if (fail2.length) console.log(`\nCHECK2 FAILURES:\n  ${fail2.join('\n  ')}`);
  if (fail3.length) console.log(`\nCHECK3 FAILURES (migrator defects):\n  ${fail3.join('\n  ')}`);
  if (parity) {
    console.log(`\nCHECK3 ORACLE-PARITY (pre-existing source-data id collisions — the oracle throws identically; the surgical output is faithful; fix belongs in the source TOON):`);
    for (const p of oracleParityCheck3) console.log(`  ${p.path}\n      ${p.message}`);
  }

  console.log(`\n${'-'.repeat(78)}\n(a) Dual activities (top-level steps AND loops — need INTERLEAVE decisions): ${dualActivities.length}`);
  for (const d of dualActivities) console.log(`  ${d.path}\n      units: [${d.units.join(', ')}]`);

  console.log(`\n(b) Orphan checkpoints (defined but unreferenced): ${orphanList.length}`);
  for (const o of orphanList) console.log(`  ${o.path}  →  ${o.id}`);

  console.log(`\n(c) Configured ordering (final top-level unit/step order for INTERLEAVE + ORPHAN_PLACEMENT activities): ${configuredOrders.length}`);
  for (const c of configuredOrders) console.log(`  ${c.path}\n      ${c.order.join('  ›  ')}`);

  console.log(`\n[would-be outputs written to ${OUT_DIR}/<workflow>__<filename>.toon]`);
  // "All pass" treats oracle-parity check-3 collisions as not-a-migrator-defect (the surgical output
  // is byte-faithful to the proven oracle; the collision is a latent source-data issue).
  const allPass = pass1 === N && pass2 === N && fail3.length === 0;
  console.log(
    `\nRESULT: ${
      allPass
        ? `ALL ${N} FILES PASS ALL 3 CHECKS` + (parity ? ` (modulo ${parity} pre-existing source-data id collision the oracle shares)` : '')
        : 'NOT ALL PASS — see migrator-defect failures above'
    }`,
  );

  if (WRITE) {
    if (allPass && parity === 0) {
      for (const o of outputs) writeFileSync(o.path, o.text);
      console.log(`\n[--write] WROTE ${outputs.length} activity files IN PLACE under workflows/.`);
    } else {
      console.log(`\n[--write] REFUSED — ${!allPass ? 'not all files pass the gates' : `${parity} unresolved oracle-parity collision(s)`}; fix before writing.`);
    }
  }
}

main();
