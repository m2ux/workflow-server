# Path Keys

The design question the work turns on, the options weighed, and the decision.

## The question

A namespace answers to two references: its directory name, and the slash-joined path from the corpus root that reaches it. The name is what a reference ordinarily carries. The path is what carries a reference when the name does not: two directories claiming one name lose it between them, and `check-namespace-collision` states the fact while leaving each reachable by its path, so the collision costs the short name and no coverage.

Several roots break that. `CorpusIndex.namespaces` is keyed on the path, and a path is relative to its own root, so a private corpus mirroring the public layout produces `specimens`, `support/git` and the rest from both roots. Those are equal strings, and a `Map` keyed on them keeps the last writer. The reference that is supposed never to collide collides, and it does so silently.

`citePath` carries the same fault into the ledgers: a site key is the namespace reference plus the path inside it, so two files in two roots can write one key. The collision guard's own reasoning says what that costs — a triage record accepting a finding in one file silences the same finding in the other.

## Options

- **A. Root-qualified paths.**
  Each configured root carries a label, and a namespace's path is that label joined to its path within the root. Every path is distinct across roots by construction. The qualifier is omitted where one root is configured, so a single-root deployment keeps every spelling it has and no existing ledger key moves.
- **B. Refuse overlapping roots.**
  The server declines to start when two roots would produce one namespace path. Loud, and no spelling changes anywhere. It also forbids the arrangement the work exists to serve: a private corpus that mirrors the public layout holds a `specimens/` of its own, and under this option the two cannot be served together at all.
- **C. Extend ambiguity to paths.**
  Treat a path two roots claim as a name two directories claim: neither resolves under it, and both are reported. Consistent with what the index already does for names, and it introduces no new spelling. It also removes the escape hatch — a directory whose name and path are both contested is reachable by no reference, and the guard loses the property that a collision costs no coverage.

## Decision

**A**, taken 2026-10-13. It is the only option under which every directory stays reachable by some reference, which is the invariant the index is built around and the one the collision guard measures. B solves the collision by forbidding the layout; C solves it by making directories unreachable.

### What a reference reaches

Two roots, labelled `public` and `midnight`, each walking from its own `corpus/` grouping:

| Reference | Reaches |
| --- | --- |
| `gitnexus` | the public namespace — an uncontested name, unchanged |
| `support/gitnexus` | the public namespace — a path suffix, unchanged |
| `specimens` | nothing; the name is claimed in both roots and reported |
| `public/specimens` | the public namespace |
| `midnight/specimens` | the Midnight namespace |

A path is matched against the end of each namespace's path, which is what already keeps a reference stable when a whole tree is grouped under a further folder. The qualifier therefore adds a spelling that reaches one directory and removes none.

### What it costs

- **A label is part of a reference's spelling**, so it joins the deployment contract. It binds only where a name is contested, every uncontested namespace still resolving by bare name.
- **A finding inside a contested namespace is keyed by the qualified path**, `citePath` writing the reference that reaches the file. Findings in single-root corpora and in uncontested namespaces keep the keys they hold.
- **A single root carries no qualifier**, so a deployment serving one corpus sees no change at all.
