# Codebase Wiki Activities

> Part of the [Codebase Wiki Workflow](../README.md)

Four activities that take a codebase from a confirmed ingest scope to a finalized, citation-backed wiki. The spine is linear — `confirm-scope` → `build-wiki` → `lint-wiki` → `publish` — with a single rework back-edge from `lint-wiki` to `build-wiki` when the user opts to fix lint findings by re-ingesting. There is no mode split and no review-only path; every run follows the same four steps.

This file is an orientation map. The authoritative definition of each activity — its steps, checkpoints, decisions, loops, and transitions — lives in the per-activity YAML linked from each section below and is served by `get_activity`.

---

### 01. Confirm Scope

Resolve the wiki tree root, pin the citation baseline, and capture and confirm what this build pass will ingest. Nothing is written until the target and scope are agreed, so the build pass operates on a known target and an explicit scope.

Definition: [`01-confirm-scope.yaml`](./01-confirm-scope.yaml). Leads to [Build Wiki](#02-build-wiki).

---

### 02. Build Wiki

Ingest each area in the confirmed plan — the raw source at the pinned commit and any task-derived knowledge — into typed wiki pages whose claims cite a source path and carry a confidence score, maintaining the index and log on every mutation. Knowledge compounds: each area augments the existing wiki rather than rebuilding it.

Definition: [`02-build-wiki.yaml`](./02-build-wiki.yaml). Leads to [Lint Wiki](#03-lint-wiki).

---

### 03. Lint Wiki

Run the wiki integrity checks over the built pages and decide whether the findings warrant another build pass. Contradictions and gaps are surfaced for a decision, never silently reconciled.

Definition: [`03-lint-wiki.yaml`](./03-lint-wiki.yaml). Leads to [Publish](#04-publish), or back to [Build Wiki](#02-build-wiki) when re-ingest is chosen.

---

### 04. Publish

Finalize the index, log, and overview, leaving an `overview.md` completion summary as a durable entry point, and record the wiki as published. Publish is local-only by design — no branch, commit, or pull-request operations — so the wiki is delivered in place under the wiki tree root.

Definition: [`04-publish.yaml`](./04-publish.yaml). Terminal.

---

## Transition map

```
confirm-scope → build-wiki → lint-wiki → publish
                    ^             |
                    └─────────────┘
                    needs_reingest == true
```

A linear spine with exactly one rework edge: `lint-wiki` returns to `build-wiki` only when the user chooses to re-ingest in response to lint findings; otherwise every activity advances to the next.
