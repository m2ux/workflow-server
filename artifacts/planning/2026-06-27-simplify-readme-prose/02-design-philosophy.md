# Design Philosophy

**Work Package:** Simplify workflow-server README prose  
**Issue:** _Skipped — no tracking issue for this work package_  
**Created:** 2026-06-29

---

## Problem Statement

The workflow-server `README.md` is the first document most people read when they arrive at the repository, but its prose sections pack a lot of detail into dense paragraphs. A newcomer — especially someone not already steeped in the project's terminology — has to absorb too much at once to get oriented. The information is accurate; the way it is written is the barrier.

This work package reworks the wording inside the README's prose sections so a general reader can follow each section quickly, without changing what the README covers.

### System Context

| Element | Detail |
|---------|--------|
| Artifact under change | `README.md` at the repository root |
| Nature of change | Prose wording only — sections, headings, and their order are held fixed |
| Out of scope | Server source (`src/`, `schemas/`), workflow YAML, other docs under `docs/` |
| Readers served | First-time visitors, prospective contributors, evaluators skimming the repo |

The README is documentation, not code; it has no compile-time or runtime dependents. The only consumers are human readers and any docs tooling that renders or link-checks the markdown.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Low — accuracy is intact today; this is an accessibility/clarity improvement, not a defect fix |
| Scope | The README's prose sections only; structure, links, and code/command blocks are preserved |
| Business Impact | If not addressed, the README continues to onboard newcomers more slowly than it could, raising the barrier to understanding and contributing |

---

## Problem Classification

**Type:** Inventive Goal (improvement)

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:** There is no malfunction to diagnose — the README is correct. The goal is to improve an existing artifact (an inventive-improvement goal). It is classified Moderate rather than Simple because "lower density for a lay reader while keeping every section's meaning and the structure unchanged" is a judgement-bearing rewrite: it requires understanding what each prose section is actually saying before it can be restated more simply, and it benefits from researching readability/plain-language conventions to apply them consistently. It is not Complex: scope is a single file, the change is prose-only, and there is no architectural or behavioural risk.

---

## Workflow Path Decision

**Selected Path:** Research only (skip elicitation)

**Activities Included:**
- [ ] Requirements Elicitation
- [x] Research
- [x] Implementation Analysis
- [x] Plan & Prepare

**Rationale:** The requirement is already clear and was confirmed at the classification checkpoint — simplify the prose, keep the structure, change nothing about coverage — so requirements elicitation adds no value (`needs_elicitation=false`). Research is retained (`needs_research=true`) so the rewrite can draw on established plain-language / readability conventions and apply them consistently rather than ad hoc. Optional activities are not skipped (`skip_optional_activities=false`); the standard moderate-complexity path runs through comprehension, research, analysis, and planning. This matches the `research-only` option resolved at the `workflow-path-selected` checkpoint.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Agentic effort small (single file, prose-only); human review of tone/voice is the longer pole |
| Technical | Must preserve all section headings and their order; preserve every link, anchor, and code/command block; markdown must still render and link-check cleanly |
| Dependencies | None — no code or schema depends on README prose; no external systems involved |
| Resources | None beyond the repository itself |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Lower reading density | Sentence/paragraph length and jargon load in reworked prose vs. current | Noticeably shorter, plainer sentences; terminology introduced before it is used |
| Structure preserved | Diff of headings and their order, current vs. reworked | Zero changes to sections, headings, or ordering |
| Coverage preserved | Each current prose section still conveys the same facts after rewrite | No information dropped or added |
| Renders cleanly | Markdown render + link check | No broken links, anchors, or render regressions |

---

## Design Decisions (if applicable at this stage)

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Scope of edit | Prose only / prose + restructure / full rewrite | Prose only | Work package explicitly fixes structure; restructuring would change the deliverable and add risk |
| Whether to elicit requirements | Elicit / skip | Skip | Requirement is unambiguous and confirmed at the classification checkpoint |
| Whether to research | Research / go straight to editing | Research | Applying recognised plain-language conventions yields consistent, defensible simplifications rather than ad-hoc rewording |

---

## Notes

- The planning-folder `README.md` progress tracker lists the design-philosophy doc under item `01`; the server-resolved `artifactPrefix` for this activity is `02`, so this artifact is `02-design-philosophy.md` and the assumptions log is `02-assumptions-log.md`. The tracker numbering is cosmetic and does not change the on-disk prefix.
- No tracking issue exists for this work package (`issue_skipped=true`); the feature branch is `chore/simplify-readme-prose`.
- Because this is a docs-only prose simplification, very few decisions are code-resolvable; the assumptions surfaced here are about interpretation, complexity, and path, and most resolve by stakeholder judgement rather than code analysis.
