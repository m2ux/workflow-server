#!/usr/bin/env node
/**
 * Census of identity maps (key === string value) on technique-step inputs/outputs
 * and nested-routine with/outputs. Usage:
 *   node survey.mjs [corpus-root]
 * Default corpus-root: .worktrees/workflows relative to the host checkout.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const host = join(here, '../../../../..');
const require = createRequire(join(host, 'package.json'));
const { parse } = require('yaml');

const root = process.argv[2] ?? join(host, '.worktrees/workflows');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (name.endsWith('.yaml') || name.endsWith('.yml')) acc.push(p);
  }
  return acc;
}

function classify(key, val) {
  if (typeof val === 'boolean' || typeof val === 'number') return 'literal';
  if (typeof val !== 'string') return 'other';
  if (val === key) return 'identity';
  if (val.includes('{')) return 'template';
  return 'rename-or-literal';
}

function visit(steps, rec, loc) {
  if (!Array.isArray(steps)) return;
  for (const step of steps) {
    if (!step || typeof step !== 'object') continue;
    if (step.kind === 'loop') visit(step.steps, rec, loc);
    if (step.kind === 'routine') {
      for (const [k, v] of Object.entries(step.with ?? {})) {
        rec.push({ loc, step: step.id, kind: 'routine.with', key: k, class: classify(k, v) });
      }
      for (const [k, v] of Object.entries(step.outputs ?? {})) {
        rec.push({ loc, step: step.id, kind: 'routine.outputs', key: k, class: classify(k, v) });
      }
    }
    if (step.kind !== 'technique') continue;
    const t = step.technique;
    if (typeof t === 'string' || t == null) {
      rec.push({ loc, step: step.id, kind: 'bare-string', class: 'bare' });
      continue;
    }
    const ins = Object.entries(t.inputs ?? {});
    const outs = Object.entries(t.outputs ?? {});
    if (ins.length === 0 && outs.length === 0) {
      rec.push({ loc, step: step.id, kind: 'object-empty-maps', class: 'empty-object' });
    }
    for (const [k, v] of ins) rec.push({ loc, step: step.id, kind: 'inputs', key: k, class: classify(k, v) });
    for (const [k, v] of outs) rec.push({ loc, step: step.id, kind: 'outputs', key: k, class: classify(k, v) });
  }
}

const files = walk(join(root, 'corpus'));
const rec = [];
for (const p of files) {
  const doc = parse(readFileSync(p, 'utf8'));
  if (doc?.steps) visit(doc.steps, rec, relative(root, p));
}

const identity = rec.filter((r) => r.class === 'identity');
const byKind = {};
for (const r of identity) byKind[r.kind] = (byKind[r.kind] || 0) + 1;
const byFile = {};
for (const r of identity.filter((r) => r.kind === 'inputs' || r.kind === 'outputs')) {
  byFile[r.loc] = (byFile[r.loc] || 0) + 1;
}

process.stdout.write(`${JSON.stringify({ root, identity: identity.length, byKind, byFile }, null, 2)}\n`);
