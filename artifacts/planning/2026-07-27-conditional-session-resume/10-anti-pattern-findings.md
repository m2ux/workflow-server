# Anti-Pattern Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** anti-patterns
**Target:** `meta` v5.9.0 · second post-commit walk of `b3dc2506..8bdc8f0c` (9 files, +105 −18)

Full catalogue walk against the remediated state, including the branch-local `AP-127. bag-value-as-literal` entry.

## Findings

None. Every entry the first pass raised (`contract-not-procedure`, `readme-orients-not-transcribes`, `no-rationale-in-description`, `procedure-in-io-contract`) is cleared in the remediated source and no new entry fires.

**Finding count:** 0

The one finding this pass raised is a principle-only defect with no catalogue entry — see [P-11](10-principle-findings.md).

## Notes

**Re-verified clear — the four first-pass entries.** Each was re-read in the committed source at `8bdc8f0c`, not carried forward from the prior record:

| Entry | Evidence in the remediated source |
|-------|-----------------------------------|
| `contract-not-procedure` | `detect-resume-intent.md` Protocol is one phase ending "…and emit `{resume_intent_requested}`" — no trailing projection phase |
| `readme-orients-not-transcribes` | `meta/README.md` structure tree reads `# Meta workflow definition` with no variable or rule counts |
| `no-rationale-in-description` | `scan-saved-sessions.md` Protocol step 3 ends at the candidate disjunction; the "so both arms are needed…" clause is gone |
| `procedure-in-io-contract` | `saved_session_candidates` reads "…entries, one per planning folder recording a session for `{target_workflow_id}`" — shape and meaning only |

**Cleared — `bag-value-as-literal` (AP-127) applied to the whole change set.** The entry's own narrowing (remediated in `8bdc8f0c`) now confines it to literals with a declared slot carrying the same meaning. Nothing in the change set qualifies: the lexicon's phrase lists *are* the vocabulary declaration; the three new gates read the declared `{resume_intent_requested}` rather than a literal; `meta/README.md`'s `v5.9.0` mirrors a `workflow.yaml` metadata field, not a `variables[]` entry, and matches the header convention of every workflow README. The repeated `.engineering/artifacts/planning/` literal in `scan-saved-sessions` is ceded to `factor-repeated-paths` by AP-127's own Do-not-flag, and both occurrences pre-date this change untouched.

**Cleared — AP-127's conformance to the catalogue's own Creation Rules.** Entry identity (`### AP-127. name`, monotonic file-order designator, kebab smell name), two-line intro with no parenthetical gloss, the full Detect / Do not flag / Fix triad on separate blocks, a structural Detect that transfers to a foreign workflow, sibling cross-references by backticked name without re-teaching, and no provenance ballast. Its position after AP-126 at end of file follows both the monotonic-file-order rule and AP-126's own precedent.

**Cleared, with evidence — the `exists` / `notExists` gate pair.** Re-confirmed against `src/schema/condition.schema.ts:59-60`: `exists` is `value !== undefined && value !== null` and `notExists` its exact complement. All three runtime paths route correctly — search skipped (variable absent), searched-and-matched (object), searched-and-unmatched (`match-saved-session` returns null) — so `record-match` and `record-no-match` are mutually exclusive and exhaustive, and `resume-session` cannot fire spuriously.

**Cleared — gate-form conformance on the three new steps.** `when: resume_intent_requested == true` is the form `activity.schema.json` prefers for simple comparisons (it marks structured `condition` LEGACY except on checkpoint steps) and the live form in every other `meta` activity (`01`, `02`, `03`). The two derived gates necessarily use structured `condition` because the inline `when` grammar has no existence operator. Both forms are correct for their purpose; the mixed usage inside one file is not a divergence.

**Cleared — `no-activity-prose-rules`.** The `rules:` block and its single entry are absent from `00-discover-session.yaml`, reaching the entry's mandated end state rather than a reworded rule.

**Cleared — `no-set-of-technique-output` / `no-valueless-control-set`.** `record-match` and `record-no-match` are `kind: action` steps with no technique binding, and every `set` carries a `value:` — the value-bearing control-set carve-out.

**Cleared — `no-derived-state-shadow` / `mode-as-state`.** `resume_intent_requested` is derived from the request text, not projected from another declared variable; `resume-session` gates on `has_saved_state` alone.

**Cleared — `variable-description-one-line`, `boolean-id-shape`, `snake-case-symbols`.** `resume_intent_requested` is a one-line description with no producer/consumer/gate tail, and an affirmative `<noun>_<participle>` predicate id.

**Cleared — `resource-fills-not-does` / `no-resource-caller-backlink` on the new lexicon.** `## Matching` holds matching semantics for a consult vocabulary (an explicit carve-out), and the intro and frontmatter name what the file *is* with no caller link or gate narration. The two resource-*index* rows that name the consuming technique sit in READMEs, not in the resource, and match every sibling row in the same tables.

**Cleared — Tool-Technique-Doc consistency entries.** Re-checked against the actual harness surface (`src/schema/activity.schema.ts`, `src/schema/condition.schema.ts`, `src/tools/`) and the authoritative bootstrap resource: the change names no harness tool and makes no return-shape or bootstrap claim.

**Considered, not flagged — `readme-orients-not-transcribes` on `meta/activities/README.md`.** The `### 00. Discover Session` paragraph enumerates the activity's step order and both checkpoints with their conditions. The shape is the house pattern for all five entries in the file and for `activities/README.md` across the library; correcting it is a library-wide convention change. Deferred as [X-6](05-deferred-items.md). The separate *accuracy* defect at line 5 of the same file is [P-11](10-principle-findings.md) and was remediated.

**Considered, not flagged — `avoidance-voice-in-definitions` on `outcome[1]`.** "no search performed otherwise" states the else-branch outcome rather than framing against the prior design; Detect excludes "not every English negation".

**Considered, not flagged — `statement-not-question` on the `resume-session` checkpoint.** The message "Resume from where you left off, or start fresh?" is interrogative and would fire the entry, but the checkpoint is untouched by this change and pre-dates it on `origin/workflows`. Out of scope for a post-update walk.
