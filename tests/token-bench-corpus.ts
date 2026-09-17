import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import {
  CORE_ORCHESTRATOR_TECHNIQUES,
  CORE_WORKER_TECHNIQUES,
  FAN_DISPATCH_TECHNIQUES,
  ORCHESTRATOR_CHECKPOINT_TECHNIQUES,
  WORKER_CHECKPOINT_TECHNIQUES,
} from '../src/loaders/core-ops.js';

/**
 * The corpus the delivery-cost gate walks.
 *
 * `delivery-fixture` is authored and checked in: it is the subject, a client workflow with one
 * activity at each end of the size scale. The `meta` namespace beside it is not authored, because
 * what it owes is a technique at every ref `core-ops.ts` names — and a checked-in namespace owing
 * that is a mirror of an engine constant, kept true by hand and by a test whose whole job is to
 * police the copy. Deriving it from the lists removes both: a ref added to `core-ops.ts` arrives
 * here with no edit, and the two cannot disagree.
 *
 * What the stand-ins say is deliberately not the corpus's own prose. A reading taken against this
 * fixture prices how the engine DELIVERS a role contract — how much of a response is the contract
 * every activity carries, what collapses on a second delivery, what a shared block costs when
 * several operations inherit it. Uniform bodies measure that at least as honestly as varied ones,
 * and they are reproducible, which the baseline requires.
 *
 * The shape each stand-in carries is chosen for what it exercises rather than for realism:
 *   - a root `TECHNIQUE.md` whose inputs every operation inherits, so the shared-block pass has
 *     something to collapse across the bundle;
 *   - a `TECHNIQUE.md` per group, whose rules the loader merges into every operation beneath it,
 *     so the response's own rules list carries what a step entry would otherwise restate;
 *   - two rules per operation, so a rules list is a substantial share of a delivery as it is in
 *     the corpus.
 */

/** Every operation ref a delivery of this fixture can name, including the reachable-only sets. */
function contractRefs(): string[] {
  return [...new Set([
    ...CORE_ORCHESTRATOR_TECHNIQUES,
    ...CORE_WORKER_TECHNIQUES,
    ...ORCHESTRATOR_CHECKPOINT_TECHNIQUES,
    ...WORKER_CHECKPOINT_TECHNIQUES,
    ...FAN_DISPATCH_TECHNIQUES,
  ])].sort();
}

/** `group::op` → [group, op]; a bare ref → [null, ref]. */
function splitRef(ref: string): [string | null, string] {
  const at = ref.indexOf('::');
  return at < 0 ? [null, ref] : [ref.slice(0, at), ref.slice(at + 2)];
}

/** `dispatch-activity` → `Dispatch Activity`. */
function titleCase(id: string): string {
  return id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const FRONT = '---\nmetadata:\n  version: 1.0.0\n---\n';

function technique(capability: string, sections: string): string {
  return `${FRONT}\n## Capability\n\n${capability}\n${sections}`;
}

function rules(entries: Array<[string, string]>): string {
  return `\n## Rules\n${entries.map(([name, text]) => `\n### ${name}\n\n${text}\n`).join('')}`;
}

/** Write `meta` and a copy of the authored client workflow into `dest`. */
export function buildTokenBenchCorpus(dest: string): string {
  const authored = resolve(import.meta.dirname, 'fixtures/token-bench/delivery-fixture');
  mkdirSync(dest, { recursive: true });
  cpSync(authored, join(dest, 'delivery-fixture'), { recursive: true });

  const write = (rel: string, body: string): void => {
    const path = join(dest, rel);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body.endsWith('\n') ? body : `${body}\n`, 'utf8');
  };

  write('meta/workflow.yaml', `id: meta
version: 1.0.0
title: Fixture Meta
description: Host for the role-contract operations every delivery carries, derived from the lists src/loaders/core-ops.ts names.
initialActivity: bootstrap
graph:
  bootstrap:
    done: __terminal__
`);

  write('meta/activities/00-bootstrap.yaml', `id: bootstrap
version: 1.0.0
name: Bootstrap
description: Opens a meta session. The fixture walks its client workflow, not this.
steps:
  - kind: action
    id: announce
    actions:
      - action: log
        message: Fixture meta session open.
exits:
  - id: done
    isDefault: true
`);

  // The root contract every operation inherits. Three inputs, because three is what the corpus's
  // own root carries and what makes an inherited block worth collapsing.
  write('meta/techniques/TECHNIQUE.md', `${FRONT}
## Capability

Contract shared by every operation in the meta namespace — the coordinates a run works against.

## Inputs

### host_repo_path

Absolute path of the outermost git host for the workspace checkout — the outermost superproject when the component is a submodule, the checkout itself otherwise.

### component_path

Path of the component being worked on, relative to \`{host_repo_path}\` — \`.\` for a regular repository. The two together locate the component directory.

### planning_folder_path

Path to the session's planning folder, as the server returned it. Operations that read or write session artifacts take it from here; not every operation needs one.
${rules([
    ['session-index-passes-on-each-call', 'Every authenticated tool call carries the `session_index` the session opened with. The index is stable for the life of the session.'],
    ['validation-warnings', 'Read `_meta.validation` on each response. A warning is advisory and is addressed rather than ignored.'],
  ])}`);

  const groups = new Set<string>();
  for (const ref of contractRefs()) {
    const [group, op] = splitRef(ref);
    if (group && !groups.has(group)) {
      groups.add(group);
      write(`meta/techniques/${group}/TECHNIQUE.md`, technique(
        `What every ${titleCase(group).toLowerCase()} operation of this fixture shares.`,
        rules([[`${group}-operations-name-their-effect`,
          `An operation of ${titleCase(group)} states what it leaves behind, so a caller reading the group knows which of its operations changed anything.`]]),
      ));
    }
    const path = group ? `meta/techniques/${group}/${op}.md` : `meta/techniques/${op}.md`;
    write(path, technique(
      `${titleCase(op)} — the role-contract operation this fixture stands in for at \`${ref}\`.`,
      `${rules([
        [`${op}-states-its-outcome`,
          `${titleCase(op)} reports what it reached, so the caller reads an outcome rather than inferring one from the absence of an error.`],
        [`${op}-carries-its-own-coordinates`,
          `${titleCase(op)} takes the coordinates it works against from the contract above rather than deriving them, so two operations of one run never disagree about where they are working.`],
      ])}
## Protocol

### 1. ${titleCase(op)}

- Carry out ${titleCase(op).toLowerCase()} against \`{component_path}\`, and report what it reached.
`,
    ));
  }
  return dest;
}

/** Build the fixture corpus into a fresh temp root. The caller owns removing it. */
export function buildTokenBenchCorpusInTemp(): string {
  return buildTokenBenchCorpus(mkdtempSync(join(tmpdir(), 'token-bench-corpus-')));
}
