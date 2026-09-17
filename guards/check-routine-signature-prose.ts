#!/usr/bin/env npx tsx
/**
 * Routine signatures that teach the reference site instead of stating their contract.
 *
 * A routine's `inputs` are its bind points: declaring one already says a site may bind it, and the
 * schema already says what an unbound one falls through to. A description that goes on to name
 * which inputs a site must bind, or to explain what happens when a site binds nothing, states the
 * declaration again in prose — so the two drift, and the prose copy is the one nothing checks.
 *
 * The phrases below are the ones that carry it, each of them addressing a reader at the reference
 * site rather than describing the value. A description that says what a value IS never needs them.
 *
 * Run: npx tsx guards/check-routine-signature-prose.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { requireRootOrExit, report, type Finding } from './guard-protocol.js';
import { resolveWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));
const ROOT = resolveWorkflowsRoot(DEFAULT_ROOT);

/**
 * Reference-site instruction, as a description spells it. Each names the site or its binding rather
 * than the value, which is what separates them from prose about shape or meaning.
 */
const SITE_PROSE: { pattern: RegExp; names: string }[] = [
  { pattern: /\brefer to (it|this run) from\b/i, names: 'tells a reader where to refer to the run from' },
  { pattern: /\b(at|from) (the|each|every) (reference|call) site\b/i, names: 'addresses the reference site' },
  { pattern: /\b(every|each) site\b/i, names: 'addresses the reference site' },
  { pattern: /\bleaves? it unbound\b/i, names: 'restates what an unbound input falls through to' },
  { pattern: /\bthe host supplies\b/i, names: 'restates what an unbound input falls through to' },
  { pattern: /\bbound by no reference site\b/i, names: 'restates what an unbound input falls through to' },
  { pattern: /\bbinding (the|what|which)\b/i, names: 'enumerates what a site must bind' },
];

/** Every `routines/` directory under the corpus — the workflow a routine belongs to is its parent. */
function routineFiles(root: string, out: string[] = []): string[] {
  const corpus = join(root, 'corpus');
  const base = existsSync(corpus) ? corpus : root;
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === '.git') continue;
      const p = join(dir, name);
      if (!statSync(p).isDirectory()) continue;
      if (name === 'routines') {
        for (const file of readdirSync(p)) if (file.endsWith('.yaml')) out.push(join(p, file));
        continue;
      }
      walk(p);
    }
  };
  walk(base);
  return out;
}

function flag(findings: Finding[], site: string, where: string, text: unknown): void {
  if (typeof text !== 'string') return;
  for (const { pattern, names } of SITE_PROSE) {
    const match = pattern.exec(text);
    if (!match) continue;
    findings.push({
      check: 'site-prose-in-signature',
      site,
      detail: `${where} ${names} — '${match[0]}'; the declaration is the bind contract, so state what the value is and let the signature carry the rest`,
    });
    return;
  }
}

function collect(root: string = ROOT): Finding[] {
  const findings: Finding[] = [];
  for (const file of routineFiles(root)) {
    let routine: any;
    try {
      routine = parse(readFileSync(file, 'utf-8'));
    } catch {
      continue;
    }
    if (!routine || typeof routine !== 'object') continue;
    const site = relative(root, file);
    flag(findings, site, 'description', routine.description);
    for (const input of routine.inputs ?? []) {
      flag(findings, site, `inputs[${input?.id ?? '?'}].description`, input?.description);
    }
    for (const output of routine.outputs ?? []) {
      flag(findings, site, `outputs[${output?.id ?? '?'}].description`, output?.description);
    }
  }
  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = requireRootOrExit('routine-signature-prose', DEFAULT_ROOT);
  report('routine-signature-prose', collect(root), {
    okMessage: 'no routine signature teaches the reference site what to bind',
    root,
    remedy: 'state what the value is; the declaration already says a site may bind it, and the schema says what an unbound one falls through to',
  });
}

export { collect };
