---
metadata:
  version: 1.0.0
---

## Capability

Run a single-shot integrity pass over the whole wiki, applying each check in the [lint-checklist](../resources/lint-checklist.md) — citation coverage, confidence presence, contradictions, orphan pages, missing referenced concepts, stale claims, and index/log integrity — and emit a count of findings plus a per-finding report. Lint surfaces problems; it does not fix them. The count drives the workflow's re-ingest decision.

## Inputs

This technique consumes the workflow-root contract inputs (`wiki_path`, `raw_baseline_commit`) and reads the wiki tree at `{wiki_path}`; it takes no additional inputs.

## Outputs

### lint_findings_count

The number of findings from the pass — `0` means the wiki passed every check. Drives the `lint-findings-confirmed` checkpoint and the re-ingest decision.

### lint_findings

The per-finding report grouped by check, each entry naming the page(s) and the specific failure.

## Protocol

### 1. Load The Wiki

- Read `index.md` to enumerate every page, then read the pages and `log.md` — lint operates over the whole wiki, not a single area.

### 2. Run Each Check

- Apply every check in the [lint-checklist](../resources/lint-checklist.md) in turn, recording each violation as a finding with the page (or pages) it concerns and the check it failed:
  - Citation coverage — every claim cites a raw source path.
  - Confidence presence — every claim carries a `high`/`medium`/`low` score.
  - Contradictions — no two pages or claims assert conflicting facts without both being recorded as a conflict.
  - Orphan pages — every page is reachable from `index.md` via `[[wikilinks]]`.
  - Missing referenced concepts — every `[[wikilink]]` resolves to an existing page.
  - Stale claims — every cited source path still exists at `{raw_baseline_commit}` and the claim still matches it.
  - Index/log integrity — `index.md` lists every page and `log.md` records every mutation.

### 3. Report Findings

- Compile the findings into a report grouped by check, each finding naming the offending page(s) and the specific failure, and count them.
- Contradictions are reported as findings for the user to resolve at re-ingest; lint never reconciles them itself.

## Rules

### single-shot-pass

Lint runs every check in one pass over the whole wiki; it is not a per-check loop. Adding a check means adding an entry to the checklist, not a new iteration construct.

### report-do-not-fix

Lint records findings and counts them; it never edits pages. Fixing is a re-ingest decision the user makes at the `lint-findings-confirmed` checkpoint.

### contradictions-are-findings

A contradiction between pages or claims is a finding, never a silent reconciliation — this is where the workflow's contradiction-surfacing invariant is enforced.
