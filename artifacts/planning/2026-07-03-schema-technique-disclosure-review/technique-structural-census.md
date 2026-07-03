# Technique Markdown Structural Census (Phase 2a)

Date: 2026-07-03. Corpus: 206 `.md` files — meta 102, work-package 96, ponytail 8 (3 workflow-root `TECHNIQUE.md`, 23 group `TECHNIQUE.md`, 179 members, 1 stray README).

## 1. Section-heading inventory

| H2 heading | Count/206 | Notes |
|---|---|---|
| Capability | 205 | all but ponytail's README |
| Inputs | 182 | |
| Protocol | 178 | **never on a TECHNIQUE.md — all 26 base contracts are protocol-less** |
| Outputs | 149 | always plural "Outputs"; singular "Output" occurs zero times despite the server model field being `output` |
| Rules | 56 | 22 on TECHNIQUE.md contracts, 34 on members |

Absences among 179 members: 41 lack Outputs (side-effect ops, e.g. `meta/techniques/version-control/commit-regular-files.md`), 13 lack Inputs, 1 lacks Protocol (`meta/techniques/agent-conduct.md` — Capability+Rules charter). None lack Capability.

## 2. I/O contract shape

- **Zero id-only entries.** 422 input entries: 410 `### id` + prose, 12 with `#### component` subsections. 207 output entries: 166 id+desc, 41 with components.
- Component names: `artifact` ×25 (binds output to filename), `default` ×12 (input defaults), rest structured-envelope fields (`check_status`, `failed_checks`, `first_failure`… — `meta/techniques/cargo-operations/run-suite.md` has 7).
- Undeclared protocol references: raw scan flagged 33 files → after resolving ancestor-inherited inputs, 16 → most survivors are legitimate conventions: (a) `{$var}` **define-local sigil** (variable derived mid-protocol; 13 work-package files, never meta/ponytail); (b) illustrative tokens (`{n}`, `{placeholder}`); (c) cross-file sibling-output refs (`run-suite.md` referencing `test.md`'s `{failures}`). Genuine drift: `meta/techniques/workflow-engine/create-session.md` protocol says `{client_planning_slug}` but declares `planning_slug`; `work-package/techniques/review-existing-feedback.md` uses `{owner}`/`{repo}` locals without the `$` sigil.

## 3. Protocol formatting

Two styles only, both numbered: plain top-level numbered list (120 files) vs titled `### N. Title` blocks (58 files; all 168 block titles numbered). Steps per protocol: 1×69, 2×33, 3×43, 4×12, 5×10, 6×8, 7×3 (median 2). Failure handling: 39 conditional-guard sub-bullets (`- If X fails, <remedy>`) across ~30 files; no dedicated Errors sections anywhere.

## 4. Length distribution

| Workflow | n | Lines min/med/p90/max | Chars min/med/p90/max |
|---|---|---|---|
| meta | 102 | 9 / 27 / 41 / 110 | 164 / 698 / 1,621 / 7,408 |
| work-package | 96 | 15 / 47 / 86 / 135 | 278 / 1,697 / 4,513 / 9,517 |
| ponytail | 8 | 34 / 40.5 / 60 / 71 | 1,857 / 2,402 / 3,068 / 3,498 |

Largest: `work-package/techniques/review-assumptions/reconcile.md` (135 ln / 9.5 KB), `respond-to-pr-review.md` (127), `create-issue.md` (114), `review-diff.md` (112), `meta/techniques/agent-conduct.md` (110). Smallest: `meta/techniques/TECHNIQUE.md` (9 ln), `atlassian-operations/list-confluence-spaces.md` / `list-jira-projects.md` (13), two 15-line group contracts.

## 5. Composition usage

**The Initial/Final protocol-wrapping feature is entirely unused** — in these three workflows and corpus-wide (verified: zero `### Initial` / `### Final` under any `workflows/*/techniques/`). The server implements it (`wrapProtocolWithAncestors`, technique-loader); no `TECHNIQUE.md` anywhere has a Protocol section at all.

What composition IS used for: **contract inheritance** — all 23 groups + 3 roots contribute Capability/Inputs/Outputs/Rules merged into descendants (child overrides by key). Depth uniformly root → group → member (2 ancestors max). Load-bearing examples: `cargo-operations/TECHNIQUE.md`, `harness-compat/TECHNIQUE.md` declare member-consumed inputs; work-package root declares 6 inputs inherited by all 95 files; meta root is a 9-line no-op stub; ponytail root is the heaviest contract (71 ln: 4 defaulted inputs + 7 rules inherited by all 6 techniques).

## 6. De-facto template and deviations

**Modal shape** (95/179 members exactly; +19 with Rules appended):

```
--- metadata: version: X.Y.Z ---        (no H1)
## Capability   — one paragraph
## Inputs       — ### snake_case_id + prose  [+ #### default]
## Outputs      — ### snake_case_id + prose  [+ #### artifact | envelope fields]
## Protocol     — numbered steps; guard sub-bullets for failure paths
[## Rules       — ### kebab-case-rule-id + paragraph]
```

| # | Deviation class | Count | Example |
|---|---|---|---|
| 1 | Outputs *after* Protocol | 16 | `work-package/techniques/create-adr.md`; worst `review-diff.md` (Protocol > Rules > Outputs) |
| 2 | No Outputs (side-effect op) | 41 | `version-control/commit-regular-files.md` |
| 3 | No Inputs | 13 | `version-control/detect-repo-type.md` |
| 4 | Rules-only, no Protocol | 1 | `meta/techniques/agent-conduct.md` |
| 5 | H1 title present (all 23 group TECHNIQUE.md + ponytail roots, NOT meta/wp roots); H1 not slug-derived | 26 | `design-philosophy/TECHNIQUE.md` → H1 "Classify Problem" |
| 6 | Legacy-rich front matter (`ontology`/`kind`/`order`/`legacy_id`) | 40 | `version-control/TECHNIQUE.md` |
| 7 | Non-technique doc inside techniques/ | 1 | `ponytail/techniques/README.md` |
| 8 | `{$var}` define-local sigil (work-package-only convention) | 13 | `manage-git/create-worktree.md` |
| 9 | Placeholder/id drift Protocol↔Inputs | ~3 | `workflow-engine/create-session.md` |
| 10 | Editorial blockquote after Protocol | 1 | `cargo-operations/run-suite.md` |
| 11 | Version variance: 1.0.0 ×154; 51 files 1.1.0–6.1.0 | — | |

Notably absent: no id-only I/O entries, no prose-paragraph Rules, no unnumbered protocols, no missing Capability. **Zero "skill" terminology remnants.**

## 7. Probe candidates selected (used in Phase 2b)

1. Short simple: `meta/techniques/atlassian-operations/list-confluence-spaces.md` (+group contract)
2. Long standalone: `work-package/techniques/create-issue.md` (live composed payload)
3. Composed A: `meta/techniques/cargo-operations/check.md` (+group+root)
4. Composed B: `work-package/techniques/manage-git/create-worktree.md` (live composed payload, 2-level)
5. Components-rich: `meta/techniques/cargo-operations/run-suite.md` (+group+root)
6. Rules-heavy: `work-package/techniques/review-assumptions/reconcile.md` (live composed payload, largest file)
