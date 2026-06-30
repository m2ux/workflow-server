# Codebase Wiki Techniques

> Part of the [Codebase Wiki Workflow](../README.md)

The technique library for the codebase-wiki workflow. Each technique is one capability an activity step binds via `step.technique`; the authoritative protocol, inputs, outputs, and rules live in the per-technique `.md` file and are served by `get_technique`. This file orients — it does not restate protocols.

[`TECHNIQUE.md`](./TECHNIQUE.md) is the workflow-root base contract inherited by every technique here. Its shared inputs (`wiki_path`, `raw_baseline_commit`), its citation and confidence requirements, and the workflow's invariants merge into each technique, and its `Initial`/`Final` protocol blocks wrap each technique's protocol. Because the wiki has a single operation cluster, the shared contract lives in this workflow-root base rather than a group `TECHNIQUE.md` — the techniques are standalone, not a group. The set is 5 reuse operations (`ingest`, `query`, `lint`, `maintain-index-log`, `cross-link`) plus 2 internal techniques (`collect-scope`, `compose-overview`) bound within `confirm-scope` and `publish`.

The cross-cutting meta strategy technique [`variable-binding`](../../meta/techniques/variable-binding.md) is declared at the workflow/activity level and inherited, not bound per step.

---

## Workflow-local techniques

| Technique | Capability |
|-----------|------------|
| [`ingest`](./ingest.md) | Read a scoped source area at the pinned commit — and optional task knowledge — into typed, cited, confidence-scored pages; cascade related-page links. The augment/update path is folded in here. |
| [`query`](./query.md) | Search the index, follow `[[wikilinks]]` to the relevant pages, and synthesize a cited answer; optionally persist it as a page. |
| [`lint`](./lint.md) | Run the single-shot integrity checks over the whole wiki and emit a findings count and report. |
| [`maintain-index-log`](./maintain-index-log.md) | Update `index.md` and append `log.md` on every mutation. |
| [`cross-link`](./cross-link.md) | Maintain bidirectional `[[wikilink]]` relationships and `related[]` frontmatter between pages. |
| [`collect-scope`](./collect-scope.md) | Resolve the wiki tree root, pin the citation baseline, capture the ingest scope, and derive the ordered ingest plan. Internal to `confirm-scope`. |
| [`compose-overview`](./compose-overview.md) | Compose the `overview.md` completion summary from the index and log. Internal to `publish`. |

## Cross-workflow consumption and delegation

These operations are standalone, so other workflows bind them with the slash form:

| Reference | Used for |
|-----------|----------|
| `codebase-wiki/ingest` | Build or augment the wiki from source and/or task knowledge. |
| `codebase-wiki/query` | Read the wiki to answer a question with cited claims. |
| `codebase-wiki/lint` | Check wiki integrity. |

Internally, the techniques delegate raw file IO to work-package's `manage-artifacts` group with the triple-`::` form:

| Reference | Used for |
|-----------|----------|
| [`work-package::manage-artifacts`](../../work-package/techniques/manage-artifacts/TECHNIQUE.md) | `write-artifact` — page, index, log, and overview writes, with `target_dir` bound to `{wiki_path}`. |
