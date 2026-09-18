# Colliding library names — investigation detail

Supporting evidence for the issue about libraries whose directory names collide. Found while
reviewing the namespace guard-coverage change (#821) against a corpus that holds a library, which
is the shape the GitNexus move (#822) introduces.

## Reproduction

A corpus with one workflow and two libraries whose directories share the name `twin`:

```
product/workflow.yaml            id: product
left/twin/techniques/op.md
right/twin/techniques/op.md
```

Driven through `indexCorpus`, the guard enumeration and the ledger site key:

```
reachable by path left/twin  : true
reachable by path right/twin : true
reachable by name twin       : false
corpusNamespaces lists       : product
citePath(left/twin op.md)    : twin/techniques/op.md
citePath(right/twin op.md)   : twin/techniques/op.md
```

The probe that produced this:

```ts
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { indexCorpus, namespaceLocation } from './src/loaders/corpus-index.js';
import { citePath, corpusNamespaces } from './guards/workflows-root.js';

const root = mkdtempSync(join(tmpdir(), 'twin-'));
mkdirSync(join(root, 'product'), { recursive: true });
writeFileSync(join(root, 'product', 'workflow.yaml'), 'id: product\nversion: 1.0.0\ntitle: t\n');
for (const side of ['left', 'right']) {
  mkdirSync(join(root, side, 'twin', 'techniques'), { recursive: true });
  writeFileSync(join(root, side, 'twin', 'techniques', 'op.md'), '# Op\n');
}

const index = indexCorpus(root);
console.log('reachable by path left/twin  : ' + !!namespaceLocation(index, 'left/twin'));
console.log('reachable by path right/twin : ' + !!namespaceLocation(index, 'right/twin'));
console.log('reachable by name twin       : ' + !!namespaceLocation(index, 'twin'));
console.log('corpusNamespaces lists       : ' + corpusNamespaces(root, index).map((n) => n.path).join(', '));
console.log('citePath(left/twin op.md)    : ' + citePath(root, join(root, 'left', 'twin', 'techniques', 'op.md'), index));
console.log('citePath(right/twin op.md)   : ' + citePath(root, join(root, 'right', 'twin', 'techniques', 'op.md'), index));
rmSync(root, { recursive: true, force: true });
```

## Where each half sits

**The enumeration.** `corpusNamespaces` in `guards/workflows-root.ts` filters each candidate through
`namespaceLocation(index, location.id)` — the directory name. `indexCorpus` builds `namespacesByName`
and `workflows` from one single-claimant loop, so a name two directories claim is absent from both
and lands on `ambiguous` instead. The path-keyed `namespaces` map keeps both entries, and
`namespaceLocation` answers a path reference from it, which is why the artifacts stay reachable while
the enumeration drops them.

**The citation.** `citePath` resolves the owning namespace and joins its `id` to the path inside it.
For a namespace whose name is ambiguous that `id` is a string no reference resolves, and both
directories produce it.

## Why the same exclusion is right for workflows

`corpusWorkflows` carries the identical filter and should keep it. A workflow is started by name;
`start_session` has no path spelling, so a workflow whose name is claimed twice cannot be run at all,
and measuring it would hold an author to rules about a product nobody can start. A library has no
such gate — every reference into one is a technique, resource or routine reference, and all three
accept the path form.

## The part that makes the fix non-trivial

Filtering on `location.path` instead of `location.id` is one line and admits both twins while keeping
the identity-mismatch refusal, since a path reference is still put through `locationIfMatching`.

The citation half is a grammar change. A ledger site key is `<name>/<path-inside>`, and
`workflowIdFromCorpusPath` recovers the owner by reading the segment before the first reserved
directory name. Given `left/twin/techniques/op.md` it returns `twin`, not `left/twin`. So emitting
the path form for an ambiguous name breaks the agreement between the key a ledger carries and the
owner a guard reads back off a file — the invariant whose breach produced the `fan-conformance`
regression during the guard-coverage work, where a workflow below the corpus root had its outputs
read as consumed by nothing.

Both sides have to move together, and `workflowIdFromCorpusPath` is consumed by the binding registry,
the cross-file consumption match and the reach rule.

## Alternatives considered and rejected

**Leave it, and let the ambiguity guard catch the collision.** Nothing reports `ambiguous` for
libraries today. The workflow loader reports ambiguous *workflow* ids, and the corpus-root helper
treats a non-empty `ambiguous` list as evidence the corpus is not empty rather than as a fault. So
the collision is currently silent on both paths.

**Refuse loudly instead of resolving it.** Making a colliding library name a hard guard failure
converts a silent skip into a measurement failure, which is the doctrine the corpus-root helper
already applies to an empty checkout. Cheap, and it removes the dangerous half. It also forbids a
layout the reference grammar deliberately supports — two components each carrying a library of the
same name under different parents — which is the case the dual naming was designed for.

**Key every site on the path.** Uniform and collision-free, but it rewrites every existing ledger
entry and reintroduces grouping folders into findings, which the name-keyed form exists to keep out.

## What the implementation found

**A fourth consumer, wanting the opposite contract.** `scripts/coverage-scope.ts` reads
`workflowIdFromCorpusPath` over paths that `git diff --name-status` reported, and matches the answer
against the ids a walk roster names. It wants the directory name and nothing above it —
`corpus/specimens/fan-conformance/workflow.yaml` has to answer `fan-conformance`, or the change
scopes to no walked workflow. It also runs over paths for files a change deleted, so resolving
through the index is not open to it.

So the two questions are separate rather than one function renamed. Which product authored a file on
disk is a question about the tree, and keeps `workflowIdFromCorpusPath`. Which namespace a site key
names is a question about a reference, and is `namespaceRefFromCitePath` — the inverse of the
guards' `citePath`, returning everything the key carries ahead of the construct directory. Both split
the path the same way and differ only in how much of the head they return.

**The choice of reference belongs to the index.** `NamespaceLocation` carries `ref` — the directory
name, and the path where two directories claim that name. `citePath` writes it, `corpusNamespaces`
publishes it in place of the raw directory name, and every guard keying on a namespace keys on the
same string. Leaving each caller to decide is what would let the citation and the registry drift
apart again.

**The collision report does not gate serving.** `check-namespace-collision` reads the `ambiguous`
list and names every directory claiming each name, for workflows as well as libraries — the workflow
case had no reader either. It is registered with `gatesServing: false`, because a library with a
colliding name serves every path reference made to it, and the sidecar preflight holds an experiment
corpus to the serving set. Gating there would refuse the layout the non-goal protects.
