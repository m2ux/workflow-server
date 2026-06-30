# Codebase Wiki Workflow

> v1.0.0 — Build and maintain a durable, citation-backed, navigable LLM knowledge base over a codebase, in the Karpathy LLM-wiki format adapted for code. Its operations are reusable techniques other workflows bind to create, augment, query, and update the wiki.

---

## Overview

A codebase wiki is a tree of typed Markdown pages — concepts, entities, source-summaries, and comparisons — navigated hierarchically from an index, where every claim cites a raw source path and carries a confidence score. It adapts the [Karpathy LLM-wiki knowledge-base format](https://blog.starmorph.com/blog/karpathy-llm-wiki-knowledge-base-guide) for code: knowledge that compounds across operations instead of being rebuilt each time, and that an agent reads by following `[[wikilinks]]` from the index rather than loading the whole codebase into context.

**Why build a wiki instead of re-reading the code each time?**

- **Knowledge compounds.** Each ingest augments the existing wiki rather than starting over, so understanding accumulates across sessions and across workflows.
- **Every claim is traceable.** A claim cites the raw source path it rests on, pinned to an immutable baseline commit, and carries a confidence score — so a reader knows both where a fact came from and how sure the wiki is of it.
- **Navigation over brute force.** Reading `index.md` and following `[[wikilinks]]` to the relevant pages costs a fraction of the context of loading the codebase, and scales as the codebase grows.
- **Reusable by other workflows.** The wiki operations are techniques other workflows bind directly — a comprehension or review workflow can ingest into, or query, the shared wiki without re-implementing any of it.

**Use this workflow when you want to:**
- Build a persistent, cited knowledge base over a codebase or subsystem.
- Augment an existing wiki with a new area, or with task-derived findings from another workflow.
- Answer questions about the codebase from cited, confidence-scored pages instead of ad-hoc re-reading.
- Check a wiki's integrity — citation coverage, contradictions, orphan pages, stale claims.

## Concepts

- **Typed page** — every page is one of four types: `concept` (an architectural idea), `entity` (a concrete code unit), `source-summary` (a per-file/area digest), or `comparison` (a cross-cutting comparison). See [wiki-format](./resources/wiki-format.md).
- **Raw baseline** — the source tree at the pinned `raw_baseline_commit`, referenced in place; there is no physical copy. Citations are repo-relative paths at that commit.
- **Citation + confidence** — every claim cites a raw source and carries a `high`/`medium`/`low` confidence. See [citation-conventions](./resources/citation-conventions.md).
- **Index and log** — `index.md` is the navigable catalog; `log.md` is the append-only operation ledger. Both are maintained on every mutation.

---

## Activities

The spine is linear with a single rework back-edge. Definitions live in [`activities/`](./activities/README.md) and are served by `get_activity`.

| # | Activity | Purpose |
|---|----------|---------|
| 01 | [Confirm Scope](./activities/01-confirm-scope.yaml) | Resolve `wiki_path`, pin `raw_baseline_commit`, and confirm the ordered `ingest_plan`. |
| 02 | [Build Wiki](./activities/02-build-wiki.yaml) | For each area in the plan: ingest source and/or task knowledge into typed, cited pages; maintain index and log. |
| 03 | [Lint Wiki](./activities/03-lint-wiki.yaml) | Run the integrity checks; on findings, decide whether to re-ingest (back to Build Wiki) or accept and publish. |
| 04 | [Publish](./activities/04-publish.yaml) | Finalize index, log, and overview; record the wiki as published. Local-only — no branch, commit, or PR. |

## Techniques

Five standalone operations plus the shared workflow-root base contract. Definitions live in [`techniques/`](./techniques/README.md).

| Technique | Capability |
|-----------|------------|
| [`ingest`](./techniques/ingest.md) | Source area at the pinned commit and/or task knowledge → typed, cited, confidence-scored pages; cascade related-page links. |
| [`query`](./techniques/query.md) | Search the index, follow `[[wikilinks]]`, synthesize a cited answer; optionally persist it. |
| [`lint`](./techniques/lint.md) | Single-shot integrity checks over the whole wiki → findings count and report. |
| [`maintain-index-log`](./techniques/maintain-index-log.md) | Update `index.md` and append `log.md` on every mutation. |
| [`cross-link`](./techniques/cross-link.md) | Maintain bidirectional `[[wikilink]]` relationships and `related[]` frontmatter. |

The shared contract — the common inputs `wiki_path` and `raw_baseline_commit`, the citation and confidence rules, and the workflow's invariants — lives in [`techniques/TECHNIQUE.md`](./techniques/TECHNIQUE.md) and is inherited by every technique.

## Reuse by other workflows

The five operations are standalone, so another workflow binds them at a step with the slash form `codebase-wiki/<op>` — exactly as any standalone technique in another workflow is referenced:

```yaml
- kind: technique
  id: ingest-area
  technique:
    name: codebase-wiki/ingest
    inputs:
      target_area: "{current_subsystem}"
      task_knowledge: "{review_findings}"
```

`codebase-wiki/ingest` builds or augments the wiki, `codebase-wiki/query` reads it, and `codebase-wiki/lint` checks it. Internally these techniques delegate file IO to [`work-package::manage-artifacts::write-artifact`](../work-package/techniques/manage-artifacts/write-artifact.md) with `target_dir` bound to `{wiki_path}`, so the wiki tree is the single place pages, index, log, and overview land.

## The wiki standard

What "well-formed" means for a wiki page is defined in [`resources/`](./resources/README.md): the [page format](./resources/wiki-format.md) and [templates](./resources/page-templates.md), the [citation conventions](./resources/citation-conventions.md), and the [lint checklist](./resources/lint-checklist.md) that verifies conformance. The techniques compose content; these resources define what content has to be.
