#!/usr/bin/env npx tsx
/**
 * Agreement between the schema construct inventory and the schemas it maps onto.
 *
 * The inventory is where an author is sent to decide which formal construct a piece of prose should
 * become, and each of its sections names the schema it maps onto in its own heading. A row naming a
 * field that schema does not declare therefore routes an author at a definition the loader refuses,
 * and it reads exactly like a row that works — which is how a retired construct survived in the
 * inventory after the schema, the source and the guard that policed it had all gone.
 *
 * Two checks, both keyed on what the schemas declare rather than on a list kept here:
 *
 *   `unknown-field`  — a field path in a section's rows whose root the named schema has no property
 *                      for. Only paths with structure are read (`fragments.checkpoints`,
 *                      `exits[].id`); a bare backticked word is as often a value, an operator or an
 *                      enum member as a field, and telling those apart is a reading rather than a
 *                      check.
 *   `kind-without-row` — a member of the step `kind` enum that no row declares. The inventory maps
 *                      informal prose onto constructs, so a step kind with no row is a construct an
 *                      author cannot be routed to, whatever else the section says about it.
 *
 * Run: npx tsx guards/check-inventory-schema-agreement.ts [--root <workflows-dir>]
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { requireRootOrExit, report, type Finding } from './guard-protocol.js';
import { resolveWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const REPO = join(DIR, '..');
const DEFAULT_ROOT = defaultCorpusDest(REPO);
const ROOT = resolveWorkflowsRoot(DEFAULT_ROOT);

const INVENTORY = 'corpus/workflow-design/resources/schema-construct-inventory.md';

/** A section heading naming the schema its rows map onto: `## Activity-Level Constructs (activity.schema.json)`. */
const SECTION = /^##\s+(.+?)\s+\((\w[\w-]*\.schema\.json)\)\s*$/;

/** A backticked token. */
const TOKEN = /`([^`]+)`/g;

/**
 * A field path: a lowercase head, optional `[]`, then at least one more segment. The second segment
 * is what makes it a path rather than a word — `fragments.checkpoints` is a claim about a schema,
 * `forEach` is a value that happens to be spelled like one.
 */
const FIELD_PATH = /^([a-z][A-Za-z0-9_]*)(\[\])?(\.[A-Za-z0-9_]+)+$/;

/**
 * A placeholder segment stands where a name the author chooses goes — `tools.{name}.when`,
 * `graph.<activity>.<exit>`. It is part of the path, so it is folded to a segment rather than
 * disqualifying the token, which would hide the root the path is making a claim about.
 */
function normalisePath(token: string): string {
  return token.replace(/\{[^}]*\}|<[^>]*>/g, 'PLACEHOLDER');
}

/**
 * Every property name the generated schemas declare, at any depth and across all of them.
 *
 * Not the named section's schema alone: a row under one level routinely cites a field of another —
 * an activity's exit row naming the workflow `graph` that binds it — and those citations are the
 * inventory doing its job. A name no schema declares anywhere is the claim worth failing.
 */
function declaredProperties(): Set<string> {
  const names = new Set<string>();
  const walk = (node: any): void => {
    if (!node || typeof node !== 'object') return;
    for (const [key, value] of Object.entries<any>(node['properties'] ?? {})) {
      names.add(key);
      walk(value);
    }
    for (const value of Object.values<any>(node['definitions'] ?? {})) walk(value);
    walk(node['items']);
    for (const branch of ['anyOf', 'oneOf', 'allOf'] as const) {
      for (const value of node[branch] ?? []) walk(value);
    }
  };
  for (const file of readdirSync(join(REPO, 'schemas'))) {
    if (file.endsWith('.schema.json')) walk(JSON.parse(readFileSync(join(REPO, 'schemas', file), 'utf-8')));
  }
  return names;
}

/**
 * The `kind` discriminator's members, read from the activity schema wherever a step variant declares
 * one. The variants sit inline under the step array's branches rather than as named definitions, so
 * this walks for the field rather than addressing a place it happens to occupy today.
 */
function stepKinds(): string[] {
  const path = join(REPO, 'schemas', 'activity.schema.json');
  if (!existsSync(path)) return [];
  const kinds = new Set<string>();
  const walk = (node: any): void => {
    if (!node || typeof node !== 'object') return;
    const kind = node['properties']?.['kind'];
    if (typeof kind?.const === 'string') kinds.add(kind.const);
    for (const member of kind?.enum ?? []) if (typeof member === 'string') kinds.add(member);
    for (const value of Object.values<any>(node['properties'] ?? {})) walk(value);
    for (const value of Object.values<any>(node['definitions'] ?? {})) walk(value);
    walk(node['items']);
    for (const branch of ['anyOf', 'oneOf', 'allOf'] as const) {
      for (const value of node[branch] ?? []) walk(value);
    }
  };
  walk(JSON.parse(readFileSync(path, 'utf-8')));
  return [...kinds].sort();
}

function collect(root: string = ROOT): Finding[] {
  const path = join(root, INVENTORY);
  if (!existsSync(path)) return [];
  const findings: Finding[] = [];
  const lines = readFileSync(path, 'utf-8').split('\n');

  const properties = declaredProperties();
  let section: { title: string; schema: string } | undefined;
  let fenced = false;
  const declaredKinds = new Set<string>();

  lines.forEach((line, index) => {
    if (line.startsWith('```')) { fenced = !fenced; return; }
    if (fenced) return;

    const heading = SECTION.exec(line);
    if (heading) {
      section = { title: heading[1]!, schema: heading[2]! };
      return;
    }
    if (line.startsWith('## ')) { section = undefined; return; }

    for (const match of line.matchAll(TOKEN)) {
      const token = match[1]!;
      const kind = /^kind:\s*([a-z]+)$/.exec(token);
      if (kind) declaredKinds.add(kind[1]!);
      if (!section) continue;
      const field = FIELD_PATH.exec(normalisePath(token));
      if (!field) continue;
      const head = field[1]!;
      if (properties.has(head)) continue;
      findings.push({
        check: 'unknown-field',
        site: `${INVENTORY}:${index + 1}`,
        detail: `'${token}' is rooted at '${head}', which no schema declares a property for — `
          + `a row under '${section.title}' routes an author at a field the load refuses`,
      });
    }
  });

  for (const kind of stepKinds()) {
    if (declaredKinds.has(kind)) continue;
    findings.push({
      check: 'kind-without-row',
      site: INVENTORY,
      detail: `the step kind '${kind}' has no row declaring 'kind: ${kind}' — an author writing the prose it serves is routed nowhere`,
    });
  }

  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = requireRootOrExit('inventory-schema-agreement', DEFAULT_ROOT);
  report('inventory-schema-agreement', collect(root), {
    okMessage: 'every construct-inventory field resolves in the schema its section names, and every step kind has a row',
    root,
    remedy: 'correct the field path, or delete the row when the construct it maps onto is retired; add a row for a step kind the inventory does not carry',
  });
}

export { collect };
