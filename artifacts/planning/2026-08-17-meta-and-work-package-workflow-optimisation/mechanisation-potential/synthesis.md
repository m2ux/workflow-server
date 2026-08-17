# Synthesis — Mechanisation Potential of Agent-Executed Technique Prose

**Lens:** l12-synthesis · **Pass:** 3 of 3 (final)
**Inputs:** `structural-analysis.md` (ANALYSIS 1) and `adversarial-analysis.md` (ANALYSIS 2), both received verbatim
**Target:** `/home/mike1/projects/dev/workflow-server` — `workflows/meta` (150 technique files, ~34,900 words) and `workflows/work-package` (112 files, ~66,300 words)

---

## REFINED CONSERVATION LAW

### What ANALYSIS 1 proposed

*Determinism and degradability are conserved. Every step made machine-executable loses its stated fallback path; every step that keeps a fallback path must state the procedure twice.*

### Why it was incomplete

ANALYSIS 2 produced the counter-example from inside the corpus. `workflows/workflow-design/techniques/audit-schema-validation.md` step 3 holds all three properties ANALYSIS 1 declared mutually exclusive, in one sentence: it is machine-executable (`npx tsx scripts/check-binding-fidelity.ts`), readable as its own contract ("every `step.technique.inputs` key is a declared input, and every interpolation/condition read resolves to a producer"), and degradable ("if a flagged change is intentional, re-snapshot with `--update-baseline`").

The error in ANALYSIS 1 was a conflation it made at §8 and never revisited: it treated "the prose states the procedure" and "the prose states the contract" as the same act. They are not. The prose above restates the *signature and the escape hatch* — roughly 40 words — and restates none of the 300-plus lines of the guard. There is no second copy of the algorithm, so there is nothing to drift.

ANALYSIS 1's §9 "new impossibility" fails on the same evidence and for a reason ANALYSIS 2 identified precisely: the two rationale passages it cited as ungenerateable (`resolve-host-repo`'s `prose-sources-are-fallback-only`, `verify-feature-branch`'s `resume-preexisted-worktree`) both live under `## Rules`, not `## Protocol`. The corpus's own section split already separates the part a signature could generate from the part that carries the why.

### The corrected law

**Contract Restatement Conservation.** *Moving a procedure's implementation from prose into code costs nothing semantically — the algorithm has exactly one home either way. What is conserved is the number of places the procedure's **contract** is stated: once per call site, plus once at the definition. Mechanisation does not reduce that count. What it buys is that the relationship between those statements becomes **checkable** — and only where a guard exists to check it.*

### Why the correction holds

The repository has already paid this price and recorded the receipt. `scripts/check-binding-fidelity.ts` exists because declared signatures drift from call sites, and `scripts/binding-fidelity-triage.json` is the standing list of drift the toolchain has conceded rather than fixed. That file is the empirical content of the corrected law: contract statements multiply with call sites, they drift, and a guard converts silent drift into a reported finding without reducing the number of statements.

This also prices ANALYSIS 1's §7 objection correctly rather than dismissing it. ANALYSIS 1 worried that a computation registry becomes a third surface to keep in sync. Under the corrected law that worry is real but ordinary: it is the same cost every one of `write-artifact`'s 87 call sites already carries, and the corpus's answer to it is a guard, not abstention.

---

## REFINED META-LAW

### What ANALYSIS 1 proposed

*The binding constraint is whether an output is read by a `when:`, a checkpoint `condition:`, or a `transition:`. An output only prose reads can stay prose, because its instability has nowhere to propagate.*

### Why it was incomplete

Two independent refutations, both from ANALYSIS 2, both confirmed against the corpus:

1. **Prose gates are gates.** `workflow-orchestrator.md` requires `{readme_conformance}.conforms` "before treating Progress as durable". `conforms` appears in no YAML expression. The corpus's control flow lives substantially in orchestrator protocol prose — `dispatch-activity.md`, `commit-and-persist.md`, `workflow-orchestrator.md` — none of which is YAML. Grepping YAML for consumers measured one of two consumer populations.

2. **Zero branch sites does not mean zero consequence.** `write-artifact` returns `{written_artifact}`, has 87 call sites, and appears in no branch expression. It is also the value the Progress table's item links depend on. A wrong path there produces a Progress row pointing at the wrong artifact — shipped to a reader, checkable by nobody in the run.

The instrument was measuring the wrong thing. It measured *who evaluates the output* when the question is *what happens when the output is wrong*.

### The corrected law

**Blast-Radius Conservation.** *Mechanisation pays in proportion to how far a wrong value travels before a human sees it. Three tiers, in descending order of payoff:*

| Tier | Consumer | Detection | Examples |
|---|---|---|---|
| **1 — silent divergence** | a `when:`, checkpoint `condition:`, or an orchestrator prose gate | none in-run; the run simply takes another path | `is_review_mode` (52 `when:` + 29 conditions), `is_monorepo` (4 gates), `readme_conformance.conforms` (prose gate) |
| **2 — shipped defect** | an artifact a reader outside the run consumes | only by a reader following the link | `written_artifact` → Progress item links, `broken_artifact_links` → published planning folder, `rows_updated` → Progress cells |
| **3 — immediate** | the next step of the same activity | at once, by the agent that asked | `kind` from `identify-path-type`, `changed_files` from `three-dot-name-status` |

### Why the correction holds, and what it changes

It preserves what ANALYSIS 1 got right — branch-consumed outputs genuinely are the worst case — and repairs what it got wrong: the outputs it zeroed out are tier 2, not tier 0. That single reclassification inverts ANALYSIS 1's own priority ordering. Its findings F7 (`sync-progress-status`) and F10 (`write-artifact`) were graded on hand-execution volume and race pedantry respectively; under the corrected law they are tier 2 — wrong values ship to readers and no mechanism in the run can notice — which makes them the two highest-value mechanisation targets in the corpus, ahead of every git one-liner it catalogued.

---

## STRUCTURAL vs FIXABLE — DEFINITIVE

Ordered by value: what the fix buys, then what it costs.

### D1 — Adopt the script-invocation pattern in `meta` and `work-package`

**Location:** corpus-wide. Pattern exemplar: `workflows/workflow-design/techniques/audit-schema-validation.md` steps 1–3; `workflows/workflow-design/techniques/yaml-authoring.md` step 6.
**What breaks today:** the two largest workflows — 262 technique files, ~101,200 words — invoke zero repo scripts, while a sibling workflow invokes three from protocol prose and lands the results in declared outputs (`{pass_count}`, `{fail_count}`).
**Disagreement resolved:** ANALYSIS 1 (F15) diagnosed this as a schema gap requiring a new `## Determinism` section, a new `compute` MCP tool and a new `kind: compute` step. ANALYSIS 2 disproved the premise by exhibiting the pattern in use. **ANALYSIS 2 is correct on the evidence** — the invocation is a protocol-prose line and the result lands through the ordinary `variables_changed` channel. No schema change, no new tool.
**FIXABLE.** *Fix: write the script invocation into the protocol step, as `audit-schema-validation.md` already does, and declare its result as a technique output.*
**Buys:** it is the enabling change — every fix below drops from "build new machinery" to "write one prose line plus, where needed, one script". **Costs:** zero infrastructure; per-technique editing only.

### D2 — `delivered_artifact` has no producer; the link-repointing branch is dead

**Location:** `meta/techniques/workflow-engine/sync-progress-status.md` — input `delivered_artifact`, Protocol step 7.
**What breaks:** corpus-wide grep returns two hits, both inside the declaring file. No call site binds it; `commit-and-persist.md` passes `activity_id`, `planning_folder_path` and `target_status` only. So the `planning-readme.md#status-transition-policy` row "complete, deliverable landed elsewhere → repointed at the artifact that actually holds it" can never execute, and `#status-vocabulary`'s stated intent — "a step that was skipped whose content landed somewhere else is **complete**, with the Item cell linked where the content actually landed" — is unreachable. Under `signature-is-the-contract` this is an unsatisfied binding gap.
**Found by:** ANALYSIS 2 only (UC-1). ANALYSIS 1 graded the technique on execution volume and missed that one of its ten steps is unreachable.
**Severity: high.** Tier 2 — the wrong link ships.
**FIXABLE.** *Fix: bind `write-artifact`'s `{written_artifact}` into the Apply as `delivered_artifact` via a one-line `step.technique.inputs` rename.*

### D3 — `epic` has no branch-name prefix

**Location:** `work-package/techniques/naming-conventions.md` step 2, against the enum in `work-package/techniques/issue-type-detection.md`.
**What breaks:** the declared `issue_type` enum is `feature`, `bug`, `task`, `enhancement`, `epic`. Step 2 maps four of five — "feature → `feat`, bug → `fix`, task/enhancement → `chore`/`refactor` as appropriate". `epic` has no mapping at all, so `{type}` in `{type}/{issue_number}-{slugified-title}` is undefined and the agent invents it. `issue-type-detection` itself calls this value "expensive to change once a PR is open".
**Disagreement resolved:** ANALYSIS 1 (F2) flagged the task/enhancement ambiguity and missed the absent row. ANALYSIS 2 (UC-2) found it. **ANALYSIS 2's grading is correct**: a missing row is worse than an ambiguous one, because an ambiguous row still yields a plausible prefix.
**Severity: high.** Tier 1 — the value propagates into branch and PR identity.
**FIXABLE.** *Fix: complete the table to a total function over the closed five-member enum.*

### D4 — The Progress status decision table, hand-applied ~30 times per run

**Location:** `meta/techniques/workflow-engine/sync-progress-status.md` + `meta/resources/planning-readme.md#status-transition-policy`.
**What breaks:** a 5×5 legal-write matrix, a 3-row item-link reconciliation table, and an `allow_overwrite_na` default that differs per target status — all applied by hand at every dispatch and every `activity_complete`. For a 15-activity work-package run that is roughly 30 applications of the same closed table. The output `rows_updated` is a count, not a diff, so a misapplication produces a cell indistinguishable from a correct one.
**Agreement:** both analyses graded this fixable; ANALYSIS 2 called it "the strongest pure-mechanisation case that survives my attack".
**Severity: medium**, but **tier 2** — Progress cells are the artifact a reader consults first, and nothing in the run re-reads them.
**FIXABLE.** *Fix: a script taking `{artifact_prefix}`, `{target_status}`, `{item_match}`, `{delivered_artifact}` and applying the policy table to the README, returning `rows_updated` — the highest-volume closed table in the corpus.*

### D5 — `write-artifact`'s mint race cannot be won by an agent

**Location:** `work-package/techniques/manage-artifacts/write-artifact.md` step 4, 87 call sites.
**What breaks:** step 4 asks the agent to re-scan for `<NN>-{bare_filename}` before creating, and fall through to update "if one appeared (race or stale listing)". Scan-then-create is not atomic for an agent issuing two tool calls. A lost race mints a second numbered instance; step 1 detects it only on the *next* write, and then logs it to the assumptions-log rather than resolving it.
**Compounded by D2:** once `delivered_artifact` is wired, a lost race puts the wrong path into a Progress item link.
**Agreement:** both analyses fixable. ANALYSIS 2 sharpened it to "fixable, and only in code".
**Severity: medium**, tier 2.
**FIXABLE.** *Fix: implement find-or-update as one server-side or script-side operation so the scan and the create are a single atomic step.*

### D6 — Review-mode ambiguity is self-assessed, so the gate cannot catch confident error

**Location:** `work-package/techniques/review-mode-detection.md` steps 1–2; `work-package/activities/01-start-work-package.yaml` line 44 (checkpoint condition) with effects at lines 54, 61, 110.
**What breaks:** step 1 inspects `{user_request}` for review signals via an open enumeration terminated by "and similar". The design does gate this — step 2 sets `review_mode_ambiguous`, and the activity carries a confirm checkpoint conditioned on it whose options set `is_review_mode` by effect. But the gate fires on *declared* ambiguity. An agent that misclassifies confidently never reaches line 44, and 52 `when:` gates and 29 checkpoint conditions across 11 of 15 activities then run on a wrong boolean.
**Disagreement resolved:** ANALYSIS 1 (F1) graded this high and claimed "nothing downstream can detect the divergence", missing the checkpoint entirely. ANALYSIS 2 found the gate and downgraded to medium. **ANALYSIS 2 is correct on the mechanism**, and its narrowing is the useful form: the defect is not non-determinism, it is that a self-assessed confidence flag cannot detect confident error.
**Severity: medium.** Tier 1 — the largest blast radius in the corpus, but gated in the common case.
**STRUCTURAL at its core, with a fixable guard.** Intent classification from free text is irreducible — the corrected conservation law offers no route to computing it. *Guard: assert the contradiction `is_review_mode == true && review_pr_missing == true`, which the schema can express and which no correct review-mode classification can satisfy; or make the confirm unconditional.*

### D7 — Planning-folder link checking: partly wired, partly unwritten

**Location:** `work-package/techniques/manage-artifacts/verify-artifact-links.md` steps 2–3, against `scripts/check-resource-anchors.ts` (151 LOC) and `scripts/check-site-links.ts`.
**What breaks:** three separate gaps.
 - Non-anchored links are validated by nothing. The anchor guard's header states it walks "Every relative markdown link **with a heading anchor**" and that "pure file links (no `#`)… are ignored". This is the repository's own filed defect, cited in the workspace instructions as the reference plain-language issue (#395).
 - Ref-relative resolution is specified — "the artifacts committed on `{artifact_publish_ref}`, not the working tree alone" — and implemented nowhere. `check-site-links.ts` is scoped to `site/**/*.html` with a hardcoded blob prefix and cannot serve.
 - The five slug edge cases the guard documents (fenced-code skip; duplicate-heading `-1`/`-2` suffixes; non-collapsing space→hyphen, so "Plan & Prepare" → `plan--prepare`; unclosed-fence direction inversion; non-`.md` targets ignored) appear nowhere in the technique prose, so an agent and CI will disagree on the first ampersand heading.
**Disagreement resolved:** ANALYSIS 1's two experts contradicted each other on coverage (its Attacker said one class of four; F5 said the implementation essentially exists). ANALYSIS 2 established the true position: the guard's `reason` type is `'missing-file' | 'missing-anchor' | 'unbalanced-fence'`, so it touches two classes — but only for links carrying an anchor. **Neither of ANALYSIS 1's positions was right.**
**Severity: medium**, tier 2 — a clean report over a broken published folder.
**PARTLY FIXABLE, PARTLY UNWRITTEN.** *Fix in two parts: point the existing guard at the planning folder with `--root` (cheap, per D1); then write the missing capability — non-anchored link resolution against a git ref via `git cat-file -e {ref}:{path}`.*

### D8 — `three-dot-name-status` specifies an unspecified join

**Location:** `meta/techniques/version-control/three-dot-name-status.md` step 2.
**What breaks:** the step pairs `git diff --name-status` with `git diff --numstat` and says "Build `{changed_file_entries}` (one row per path; renames keep git's rename status form)". The two commands disagree on rename row shape — `--name-status` emits a similarity-scored status and two paths, `--numstat` emits its own rename form — and the join key is not specified. For binary files `--numstat` emits `-` rather than integers, which the declared `additions`/`deletions` fields cannot represent.
**Disagreement resolved:** ANALYSIS 1 (F9) graded this `low`, treating it as a transcription of four git invocations. ANALYSIS 2 (UC-5) showed it is a transcription *plus* an unspecified join over two divergent formats. **ANALYSIS 2 is correct**, and the irony is precise: this is exactly the "prose omits what code encodes" argument ANALYSIS 1 made about the anchor guard, applied to a finding ANALYSIS 1 itself under-graded.
**Severity: medium** (upgraded from low), tier 3.
**FIXABLE.** *Fix: script the join with an explicit rename-aware key and a null representation for binary files.*

### D9 — `verify-artifact-conforms` should be split at the detect/correct seam

**Location:** `meta/techniques/verify-artifact-conforms.md` step 3.
**What breaks:** the step both detects violations and corrects them in place, mutating artifacts the run already persisted.
**Disagreement resolved:** ANALYSIS 1 (F11) graded the whole technique structural because "prose condensation is irreducibly generative". ANALYSIS 2 (OC-3) showed three of its four correction actions are mechanical — canonical-home substitution, deleting a section whose content is an absence, collapsing a table whose every row passes — and only two (condense over budget, rewrite against the register) are generative. **ANALYSIS 2 is correct**; grading the technique structural whole conceals three computable actions.
**Severity: medium.**
**MIXED.** *Fix: split at the seam — detection and the three mechanical corrections computable, condensation and register rewriting left to the agent.*

### D10 — Deterministic front-halves fused to judgement back-halves

**Location:** `meta/techniques/version-control/select-target-component.md` step 3; `work-package/techniques/manage-git/create-worktree.md` step 2.
**What breaks:** `select-target-component` step 3 ranks three tiers, of which two are basename string equality and the third — "`{identifying_context}` when it clearly names one" — has no criterion. `create-worktree` step 2 fuses deterministic idempotency detection (`worktree list --porcelain`, verify the path is registered against `{branch_name}`) with two interactive escalations.
**Disagreement resolved:** ANALYSIS 1 graded `select-target-component` medium (F4); ANALYSIS 2 downgraded to low, on the ground that step 2 has already set `component_selection_needed`, so a poor tier-3 result is a *recommendation shown at a gate*, not a decision. **ANALYSIS 2 is correct.**
**Severity: low.**
**PARTLY FIXABLE.** *Fix: split the mechanical tiers out as computed inputs to the gate; leave the judgement tier as the agent's.*

### D11 — Small total functions carried as full technique files

**Location:** `meta/techniques/version-control/identify-path-type.md` (67 words); `work-package/techniques/project-type-detection.md` (133); `meta/techniques/workflow-engine/verify-readme-conforms.md` (219); `meta/techniques/version-control/derive-workflows-target-path.md` (238); `work-package/techniques/repo-root-resolution.md` (213); `manage-git/verify-feature-branch.md` (115).
**What breaks:** nothing. These are total functions with no fallback path, so mechanising them costs zero degradability — but it also buys little.
**Disagreement resolved:** ANALYSIS 1 quoted word counts as if they were the saving. ANALYSIS 2 (UC-6) corrected this: the technique is still fetched and delivered either way, so the saving is the *delta* between a procedure statement and a signature-plus-invocation statement — and `audit-schema-validation.md` shows the latter runs 30–60 words per step. **ANALYSIS 2 is correct**; the saving on this class is a fraction of the quoted counts.
**Severity: low**, tier 3.
**FIXABLE, but lowest value in the set.** *Fix: replace the procedure body with an invocation and a signature. Do these last, or not at all.*

### D12 — The `infrastructure-submodule-paths` predicate is already total

**Location:** `meta/techniques/version-control/detect-repo-type.md` step 2 → `version-control/TECHNIQUE.md#infrastructure-submodule-paths`.
**Disagreement resolved:** ANALYSIS 1 (F3) graded this **high**, claiming "a submodule near the boundary can be classified either way between runs, flipping `is_monorepo`". The rule reads: "A submodule is infrastructure when its `path` equals `workflows`, equals `.engineering`, or starts with `.engineering/`." That is three literal string tests over a total predicate. **The claimed failure scenario cannot occur.** ANALYSIS 2 (OC-1) is correct.
**Severity: low** (downgraded from high). Cost finding only, not correctness.
**FIXABLE**, negligible value.

### Withdrawn

ANALYSIS 1's **F15** (no technique declares derived-vs-judged, so no guard can find candidates) is withdrawn as a finding and retained only as an observation. Its remedy — a `## Determinism` section plus `check-determinism-declared.ts` — was reasoned from the false premise D1 corrects, and ANALYSIS 1 itself showed in §6 that the declaration alone produces "a manifest of work that cannot be done". With D1 in place the manifest is actionable, but the declaration is then a convenience rather than a prerequisite.

---

## DEEPEST FINDING

**The corpus cannot distinguish "we decided not to compute this" from "we cannot compute this", because both render as identical protocol prose — and that indistinguishability is load-bearing enough to have misled a full analytical pass into designing machinery the repository already ships.**

Neither analysis alone reaches this.

ANALYSIS 1 could not: it *was* the casualty. It read `identify-path-type`'s "Run `git ls-tree HEAD {path}` and read the mode prefix", found no MCP tool that computes anything, and inferred architectural impossibility. Its inference was not careless — it was the only inference the evidence in front of it supported, because nothing in a technique file distinguishes a procedure written in prose because no one has scripted it from one written in prose because scripting was considered and rejected. From that inference it built §6 and §7: a new `## Determinism` template section, a `check-determinism-declared.ts` guard, a `compute` MCP tool, and a `kind: compute` activity step. Four pieces of new machinery, to reach guards that `workflow-design` already reaches with a Bash line.

ANALYSIS 2 could not: it found the counter-example and correctly demolished the premise, but it read the result as ordinary corpus inconsistency — "the capability is shipped and unused by the two largest workflows" (R13). That is true and it is the actionable form, but it stops at the symptom. It never asked why two teams of authors, working in the same repository under the same conventions and the same 26 guards, arrived at opposite defaults for the same class of step.

**The answer is visible only from the pair.** ANALYSIS 1 demonstrates the failure mode by falling into it; ANALYSIS 2 supplies the evidence that it *was* a failure. Together they show that the concealment mechanism ANALYSIS 1 correctly named — the Protocol section's uniform imperative voice — operates on two axes, not one. ANALYSIS 1 found the first axis: prose cannot distinguish a *fact* from a *judgement*, so `git ls-tree HEAD {path}` and "when it clearly names one" read alike. The second axis, which ANALYSIS 1 could not see because it was standing on it, is that prose equally cannot distinguish a *computed* step from an *uncomputed* one. A protocol line reading "Run `npx tsx scripts/check-all-refs.ts`" and one reading "Apply Anchor Integrity across the folder" are the same shape, the same mood, the same numbering — and one of them delegates to 151 lines of tested TypeScript while the other asks an agent to re-derive that TypeScript from memory.

This yields the concrete, testable consequence the meta-law owes, and it is a stronger prediction than either analysis made:

> **Mechanisation adoption in this corpus tracks what a workflow is *about*, not what its steps *do*.** `workflow-design`'s subject matter is the repository's own tooling, so its authors reached for `npx tsx` as a matter of course. `meta` and `work-package` are about sessions and work packages, so their authors wrote prose — including for steps whose subject matter is *also* the repository: git state, submodule layout, markdown link integrity, file naming. The determinant is authorial framing, not step character.

Falsifiable now: examine the other workflows. Any workflow whose subject is repository tooling should show script invocations; any workflow whose subject is domain work should show none, regardless of how many mechanical steps it contains. `prism`, `work-packages`, `requirements-refinement` and `codebase-wiki` are the test set. If the prediction holds, the remedy is not a schema feature and not a new tool — it is a convention stated once in `TECHNIQUE.md`: *a protocol step whose procedure exists in `scripts/` invokes it rather than restating it.* One sentence, enforceable by the same kind of guard the repo already writes 26 of, and it closes D1, D4, D5, D7, D8 and D11 as a class.

**Why three passes were required.** Pass 1 produced a coherent, well-evidenced architecture proposal that would have cost four new pieces of machinery and delivered nothing that a one-line convention does not already deliver. Pass 2 killed it with a grep. Neither pass alone produces the finding: pass 1 alone ships the wrong build order, and pass 2 alone ships a correct but shallow "these two workflows are inconsistent with that one". The adversarial structure is what converted a wrong proposal into the diagnostic that explains why it was wrong — and the explanation is the deliverable, because it predicts where else the same gap will be found.
