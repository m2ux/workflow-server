# Canon Audit — corpus PRs #970 and #971

**Base ref:** `ba2ee7b6` (`workflows`) · #970 head `0d56c951` · #971 head `8a7dc934` (base `bbc11901`) · engine `main` `c9edbebe` · **Coverage:** 221 of 221 units × 54 of 54 paths · **Change surface:** 54 files (touched: 48 · closure: 6 · consumers: 0) · **Guards:** clean (56 pass on base and both heads)

**Verdict:** Live 2 · Contract 13 · Hygiene 63. Of these, from the diff: Live 0 · Contract 7 · Hygiene 24. Residual: **0 files `unread`** of 54, **0 units `blocked`** of 221. No prior pass.

| Band | Open | From the diff | Pre-existing |
|------|-----:|--------------:|-------------:|
| Live | 2 | 0 | 2 |
| Contract | 13 | 7 | 6 |
| Hygiene | 63 | 24 | 39 |

## Change surface

| Path | How it joined |
|------|---------------|
| 42 files under `corpus/`, `docs/README.md` (#970) | touched |
| 6 files under `corpus/specimens/schema-hygiene-conformance/`, `walks/roster.json` (#971) | touched |
| `meta/routines/activity-loop.yaml`, `meta/techniques/workflow-engine/resume-worker.md`, `compose-prompt.md`, `present-checkpoint-to-user.md`, `README.md`, `meta/techniques/agent-conduct.md` | closure — read `respond-checkpoint`'s `effects` output, whose stated shape changed |

The full list is `surface.txt` beside this report. `finalize-activity.md` was read as a restatement site of a changed rule, outside the enumerated surface.

## Findings

Live and Contract, most urgent first. No finding is High, so none was withdrawn or downgraded. Mediums were spot-confirmed.

| ID | Band | Severity | Entry | Location | Evidence | Origin | Fix |
|----|------|----------|-------|----------|----------|--------|-----|
| L1 | Live | Medium | AP-11 decision-not-prose | `workflow-design/activities/05-impact-analysis.yaml:63` | option `revise-impact` sets nothing, and the activity's only exit is `done`: "Revise" routes as `confirmed` | pre-existing | Give the option an exit the graph binds back to impact-analysis, or remove it |
| L2 | Live | Medium | AP-128 unproduced-value-read | `05-impact-analysis.yaml:37` | `artifact_content: impact_analysis`; the technique outputs only `removal_count` and `impact_analysis_path` | pre-existing | Bind a produced value, or drop the step (the technique's step 7 persists the report) |
| K1 | Contract | Medium | AP-129 stale-restatement-after-change (also P13, P34, AP-55, AP-71) | `activity-worker.md:26`, `resume-from-checkpoint.md:18`, `resume-worker.md:26`, `compose-prompt.md:22` | `effects` input "Variable updates…"; `respond-checkpoint.md:24` now defines it as the whole reply, `exit`/`ends_activity` included | diff | Restate each input from the producer's output, or hoist the one declaration |
| K2 | Contract | Medium | P34 Edit the Owner | `finalize-activity.md:48` | "one of the two sanctioned state-mutation sources"; `variable-mutation-source` now names three | diff | Drop the count, as in `variable-binding.md` |
| K3 | Contract | Medium | AP-135 tool-contract-restated-in-protocol (P21, P26) | `yield-checkpoint.md:26-27` | "at least two `options`, each with an `id` and a `label`", "sending either is refused" | diff | Leave the argument shape to the tool schema |
| K4 | Contract | Medium | P18 Prefer Shared Capability | `meta/activities/patterns/README.md:5` vs `:39` | "Borrowable mid-phase" beside "A pattern file declaring none ends the run… copy its step list" | diff | Say the patterns are copied, not borrowed mid-phase, or give them exits |
| K5 | Contract | Medium | Creation Rules audit boundary (AP-102) | `workflow-design/techniques/audit-rule-enforcement.md`, `enforcement_findings` | restates AP-79's list of structural mechanisms | diff | Cite AP-79 |
| K6 | Contract | Medium | AP-109 technique-outputs-declared | `resume-from-checkpoint.md:30`, `yield-checkpoint.md:33` | `selected_exit` is derived and read by `finalize-activity`, and declared by neither | diff | Declare `selected_exit` as an output |
| K7 | Contract | Medium | AP-122 prompt-restates-owned-mechanics | `activity-worker.md:48` | the step-3 note restates resume-from-checkpoint's continue-or-finalize branch | diff | Point at resume-from-checkpoint |
| K8 | Contract | Medium | P6 One Authoritative Home, AP-103 | `canon/resources/schema-construct-inventory.md` | 31 citations of `schemas/README.md`, moved to `docs/schemas.md` in engine `94fc4712` | pre-existing | Re-point at `docs/schemas.md` |
| K9 | Contract | Medium | AP-16 technique-inputs-declared | `workflow-design/techniques/scope-definition.md` | `{target_path}`, `{workflow_branch}`, `{workflow_id}`, `{id}` undeclared | pre-existing | Declare them |
| K10 | Contract | Medium | AP-16 technique-inputs-declared | `workflow-design/techniques/impact-analysis.md` | reads a change brief and structural inventory it does not declare | pre-existing | Declare them |
| K11 | Contract | Medium | AP-22 single-rule-authority | `variable-binding.md:67` | `outputs-mutate-state-only-via-sanctioned-path` restates `variable-mutation-source` | pre-existing | Cite the engine rule |
| K12 | Contract | Medium | AP-107 bind-site-is-orchestration-truth | `workflow-design/activities/README.md:55,71`, `workflow-design/README.md:28`, `work-package/activities/README.md:17-54` | ordered step and pass lists outside the YAML | pre-existing | Orient; leave steps to the YAML |
| K13 | Contract | Low | AP-102 no-technique-resource-dual-home | `workflow-design/techniques/impact-analysis.md:56,62,69` vs `workflow-design/resources/impact-analysis.md:82,84` | both state the removed-versus-preserved row obligation and the own-facts-only rule | pre-existing | Keep the fill rules in the resource; the technique cites it |

Hygiene, from the diff (24), grouped:
- **Stale "transition" wording** (AP-03, AP-129) in files the sweep touched: `meta/README.md:70,72,127`, `codebase-wiki/activities/README.md:43`, `substrate-node-security-audit/activities/README.md:5`, `workflow-design/README.md:93`, `scope-definition.md:49`, `work-package/activities/README.md:60`, `prism-audit/README.md:112`, and the specimen README. `workflow-authoring/resources/impact-analysis.md:58` still has a "Transitions" row, although its technique and twin changed.
- **Checkpoint techniques:**
  - yield-checkpoint: its step-1 bullets carry a trailing rationale and an in-sentence clause, not a `>` note (P31, AP-26, AP-59), and the replay rule restates the `replayed` bullet (AP-19).
  - respond-checkpoint: its step 2 restates its own output (AP-111), and its output name is negative (P19).
  - resume-from-checkpoint: its step 2 carries sub-phases (AP-108) and an unsourced reference (AP-144).
  - Actor narration and engine internals: AP-146 and AP-150.
  - activity-worker: step 5 omits the exit that ends the activity (AP-129).
- **Canon:** principle 43's body answers wording it no longer carries ("No construct binds or includes…", AP-41), repeats principle 42's routine invariant, and restates schema semantics (AP-149).
- **Rules:** `variables-changed` beside `variables_changed` in `variable-mutation-source` (AP-73, AP-58). `outputs-by-name-and-path` is an authoring standard in a runtime `## Rules` block (AP-100).
- **Specimen #971:**
  - Checkpoints: `confirm` has one option (AP-89), and both messages are questions (AP-99).
  - `local-marker` states no constraint (P45, AP-26).
  - Layout: a technique step without an `id`, `activities:` before `graph`, and a README with no copy-from section (Convention Conformance).
- `scope-definition.md:41` uses `{id}/` where `{workflow_id}` is bound (AP-62).

The pre-existing Hygiene (39) is itemised in `walk-A.md` to `walk-F.md` beside this report.

## Coverage

| Home | Unit | Status |
|------|------|--------|
| Anti-Patterns | AP-77, AP-78, AP-83 | not-applicable — "Authoring-session smells"; the surface holds no session record |
| Anti-Patterns | AP-145 | not-applicable — no surface file is delivered before a session exists |
| Mechanical | Option coverage | not-applicable — the walk covers the roster's walked set; the specimen is `notWalked`, and #970 changes no step list, exit, gate or graph |

Binding-fidelity: stamp `7062aa0a`, before the base. The three entries at files #970 touched (`variable-binding.md:43`, `yield-checkpoint.md` `yielded_checkpoint`, `workflow-design/techniques/TECHNIQUE.md` `workflow_files`) re-affirmed at head.

## File coverage

read 54 · unread 0.

## Notes

- The #970 body, read as the scope manifest (AP-03), claims an exits-for-transitions sweep; the surviving "transition" wording above is the unfinished part. The body predates commits `3261c0d8` and `0d56c951`: it gives `yield-checkpoint` as 1.5.0 (the branch has 1.4.0) and omits activity-worker 1.10.0, the undeclared-yield and per-visit replay text, the variable-binding, pattern-analysis and 05-impact-analysis edits, the README sweep and the two resource bumps.

- `workflow-design` is deprecated and "not being repaired". #970 edits its prose and bumps activity and technique versions there. The frozen workflow version is untouched, so no version-mismatch warning follows.
- The skill's § Homes names `schemas/README.md` for schema fields; that file is now `docs/schemas.md` (the same move as K8).
