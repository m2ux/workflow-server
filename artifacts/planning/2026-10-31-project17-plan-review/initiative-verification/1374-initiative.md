## Overview

The server resolves definitions over several corpus roots at once, so a private corpus is served beside the public one with neither tree holding the other. The roots are configured as a list, walked separately and reduced to one index, and every namespace stays reachable by a reference no other namespace answers to. The checks measure every root the instance serves, and a readiness probe names each root and the commit behind it. The reviews test against that end state: two corpora are one served namespace, and nothing on disk records the join.

## Problem

Serving a second corpus means joining it to the first on disk.

- **The root is one path.**
  [`resolveWorkflowDir`](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/config.ts#L575-L581) returns a single directory, so a deployment serving two corpora nests one inside the other and pins it by commit.
- **A join serves the whole joined tree.**
  [`indexCorpus`](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/loaders/corpus-index.ts#L293) walks everything beneath the product root, so every definition in the nested tree is served whether or not the outer corpus references it.
- **A joined tree re-keys the records it inherits.**
  [`citePath`](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/guards/workflows-root.ts#L163-L169) keys a site on the reference that reaches it, so a site keyed by a path from the inner tree's own root names nothing once that tree is nested.
- **The instance reports one tree and one commit.**
  [`corpusPin`](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/src/config.ts#L81-L85) is the commit the bound tree stood at, and the readiness report carries one of them.
- **A path can name two directories.**
  `CorpusIndex.namespaces` is keyed on the path from the corpus root, which [`check-namespace-collision`](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/guards/check-namespace-collision.ts) relies on reaching one directory when a name reaches two.

## Proposal

- **One index reduced from several walks.**
  Each root is walked for its claims, and the claims are reduced together, so name ambiguity and library shadowing are measured over the union.
- **A path that names one directory.**
  A configured root carries a label, and a namespace's path is qualified by it, so the reference that resolves a contested name stays unambiguous across roots.
- **The configuration states a list.**
  The server takes several roots, and the readiness report names each one with the commit behind it.
- **The checks measure what is served.**
  A corpus guard resolves the configured roots rather than one tree, so a finding that spans two roots is visible to the check that reports it.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/1375) | Root Union | AC1, AC2, AC5 | | |
| [E01](https://github.com/m2ux/workflow-server/issues/1376) | Configured Roots | AC1, AC4 |  | |
| [E02](https://github.com/m2ux/workflow-server/issues/1377) | Guard Reach | AC3 |  | |

## Acceptance Criteria

- [ ] **AC1.** Every reference a definition carries resolves against the namespaces of every configured corpus root, shown by an end-to-end walk of a workflow in one root binding a technique, a resource and a routine held in another.
- [ ] **AC2.** Every namespace a configured root holds is reachable by a reference that reaches it alone, shown by a fixture suite resolving each namespace of roots that claim one name.
- [ ] **AC3.** No definition the server serves sits outside what the corpus guards measure, as the guard suite's run against a multi-root corpus shows.
- [ ] **AC4.** Every corpus root a reference resolves against is named in the instance's readiness report, shown by an end-to-end check comparing the roots a resolution used with the roots the probe names.
- [ ] **AC5.** A workflow walks to the same artifacts whether its corpora are configured as separate roots or arranged as one nested tree, shown by an end-to-end walk run over both arrangements of one set of corpora.

## Non-Goals

- Serving a corpus from a location that is not a filesystem path.
- Removing a corpus join from a repository that holds one.
- Changing how a reference is spelled within a single corpus root.
- Changing the format of a ledger or a walk record.

## References

- **R1.** [Planning record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-13-multi-root-corpus-serving) — The measured evidence, and the path-key options weighed.
- **R2.** [check-namespace-collision](https://github.com/m2ux/workflow-server/blob/62ee9612c0649c0a99653cdf2ab2ff5469b43be6/guards/check-namespace-collision.ts) — The rule a contested name follows, which the union keeps.
