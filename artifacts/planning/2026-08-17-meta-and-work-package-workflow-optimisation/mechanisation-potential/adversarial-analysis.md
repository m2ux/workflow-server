# Adversarial Analysis — Breaking the Structural Pass

**Lens:** l12-complement-adversarial · **Pass:** 2 of 3
**Opponent:** `structural-analysis.md` (pass 1), received verbatim
**Target:** `/home/mike1/projects/dev/workflow-server` — `workflows/meta`, `workflows/work-package`

The structural pass built a conservation law and a meta-law on top of one architectural premise. That premise is false, and I can produce the falsifier the pass declared non-existent. Three of its fifteen findings are misgraded, one is factually wrong, and it missed a binding gap that makes an entire protocol step dead.

---

## WRONG PREDICTIONS

### WP-1 — The falsifier exists. The central claim of §1 is false.

**The claim** (§1): "No workflow step anywhere in the corpus invokes a domain computation. Falsifier: exhibit one activity step that calls a server tool computing a domain fact. **The falsifier does not exist.**"

**What disproves it:** `workflows/workflow-design/techniques/audit-schema-validation.md`, Protocol steps 1–3:

- Step 1: "Run `npx tsx scripts/validate-workflow-yaml.ts <workflow-path>` on every YAML file… Record pass/fail per file with the validator's error message… Set `{pass_count}` and `{fail_count}`"
- Step 2: "Run `npx tsx scripts/check-all-refs.ts` to verify every `step.technique` reference resolves through the loader"
- Step 3: "Run `npx tsx scripts/check-binding-fidelity.ts`… It fails only on violations beyond the committed baseline; if a flagged change is intentional, re-snapshot with `--update-baseline`"

And `workflows/workflow-design/techniques/yaml-authoring.md` step 6: "Run `npx tsx scripts/validate-workflow-yaml.ts` for full workflow directory validation".

**What actually happens:** a protocol step shells out to a repo guard, and the guard's result lands in declared outputs (`{pass_count}`, `{fail_count}`) through the ordinary `variables_changed` channel. The computation is performed by TypeScript. The agent is the caller, not the executor.

The structural pass looked for the falsifier in the wrong place — it searched for an *MCP tool* that computes, concluded none exists, and generalised to "no workflow step anywhere in the corpus". The corpus has three such files. The pass's own scope note ("`workflows/meta` and `workflows/work-package`") does not rescue the claim, because the claim as written says *anywhere in the corpus* and the architecture built on it (§6, §7) is a corpus-level architecture.

**Consequence:** §7's "second improvement" — add a `compute` MCP tool and a `kind: compute` step — is solving a problem that has a shipped solution three directories away. The mechanism for reaching the 26 guards from a run is Bash in a protocol step, and `workflow-design` has used it since those techniques were written.

### WP-2 — "26 check-*.ts guards reachable only as CI" is false for at least three of them.

**The claim** (§1, restating the brief): guards are "reachable only as repo CI".

**What disproves it:** `check-all-refs.ts` and `check-binding-fidelity.ts` are reached from `audit-schema-validation.md` steps 2–3; `validate-workflow-yaml.ts` is reached from two techniques. These are workflow-reachable today. The correct statement is narrower and more useful: *the guards are reachable, and `meta` and `work-package` do not reach them* — a corpus-consistency defect, not an architectural impossibility.

### WP-3 — The overlap arithmetic in §2 (Attacker) is wrong, and §13/F5 contradicts it.

**The claim** (§2 Attacker): of `verify-artifact-links`'s four classes, `check-resource-anchors.ts` "implements only the second", overstating the defender "by roughly three quarters".

**What actually happens:** the script's own type is `reason: 'missing-file' | 'missing-anchor' | 'unbalanced-fence'`. It reports missing *files* as well as missing anchors, so it touches two of the technique's four classes, not one — and it also reports a fourth condition (`unbalanced-fence`) the technique does not have at all.

But the script's *scope* qualifier is the thing both the attacker and F5 missed: the header says it walks "Every relative markdown link **with a heading anchor**", and "pure file links (no `#`)… are ignored". So its `missing-file` coverage applies only to anchored links. A plain `[guide](./missing.md)` is invisible to it.

**Why this matters more than the arithmetic:** this exact gap is the repository's own canonical worked example. The project's workspace instructions cite issue #395 as the reference plain-language issue and quote its evidence sentence: "the link checker only validates links that carry a `#anchor` — and the house-style reference never has one". The structural pass rediscovered a known, filed defect and graded it `medium / fixable` without recognising it, while its own attacker expert mis-stated the coverage in the opposite direction. Both halves of §2 are unreliable on this pair.

### WP-4 — The meta-law's test instrument is too narrow, and the pass says so without noticing.

**The claim** (§12): "An output only prose reads can stay prose, because its instability has nowhere to propagate." Evidence: a grep of activity YAML for `when:` / `condition:` / `transition:`.

**What disproves it:** the pass's own §11 quotes `workflow-orchestrator.md`: "When a planning README drift check ran, require `{readme_conformance}.conforms` before treating Progress as durable." That is a hard gate on `conforms` — the pass's table lists `conforms` under "0 branch sites" and F12 notes it "appears in no `when:`". Both are true and both are irrelevant: the consumer is orchestrator protocol prose, and prose gates are still gates.

The meta-law measured only the *machine-evaluated* consumers and concluded the rest were consequence-free. The corpus's orchestration layer is prose by construction — `dispatch-activity.md`, `commit-and-persist.md` and `workflow-orchestrator.md` are where the run's control flow actually lives, and none of it is YAML. Grepping YAML for consumers of an orchestrator-owned output is looking for the keys under the lamp.

---

## OVERCLAIMS

### OC-1 — F3 is factually wrong. Severity high → low, and the "prose not data" framing collapses.

**F3 claims:** "The exclusion list `infrastructure-submodule-paths` is prose in `TECHNIQUE.md`, not data. A submodule near the boundary can be classified either way between runs, flipping `is_monorepo`."

**The actual rule** (`version-control/TECHNIQUE.md`, `infrastructure-submodule-paths`): "A submodule is infrastructure when its `path` equals `workflows`, equals `.engineering`, or starts with `.engineering/`."

That is a total predicate over three literal string tests. There is no boundary case, nothing to argue about, and no run-to-run variance available. F3's failure scenario — "a submodule near the boundary can be classified either way" — cannot occur. The finding survives only as the trivially weaker point that a three-clause predicate written in English could be written in TypeScript, which buys nothing and is not a `high`.

**Reclassified: low, and it is a cost finding, not a correctness one.**

### OC-2 — F1 is graded on a failure mode the design already gates. Severity high → medium, and the fix is not mechanisation.

**F1 claims:** `is_review_mode`'s derivation is open-ended, so "Two runs on the same request can partition the whole workflow differently, and nothing downstream can detect the divergence."

**What the design actually does:** `review-mode-detection.md` step 2 sets `review_mode_ambiguous` when intent is not clear and explicitly withholds `is_review_mode`. `work-package/activities/01-start-work-package.yaml` then carries a checkpoint conditioned on `review_mode_ambiguous` (line 44) whose options set the variable by effect — `is_review_mode: true` at line 54, `is_review_mode: false` at line 61, and a `cancel-review` option at line 110. Checkpoint `setVariable` is one of the two sanctioned mutation sources, so the *user* is the authority whenever the agent is unsure.

So "nothing downstream can detect the divergence" is wrong: the technique detects its own uncertainty and hands the decision to a gate.

**What survives, and it is worth keeping:** the gate fires on *declared* ambiguity. An agent that misclassifies **confidently** never reaches line 44, and then 52 `when:` gates and 29 checkpoint conditions run on a wrong boolean with no further checkpoint. The real finding is not "the derivation is non-deterministic" — it is that **the ambiguity flag is self-assessed, and a self-assessed confidence gate cannot catch confident error.** The fix is not to compute intent (irreducible, as the pass says); it is to make the confirm unconditional, or to add a cheap objective disconfirmer — if `review_mode_ambiguous` is false and `is_review_mode` is true, a PR reference must be resolvable, and `review_pr_missing == true` alongside `is_review_mode == true` is a contradiction the schema could assert.

**Reclassified: medium, structural in its core, with a concrete non-mechanising fix.**

### OC-3 — F11 is more fixable than "structural" admits.

**F11 claims** `verify-artifact-conforms`'s in-place correction is structural because "prose condensation is irreducibly generative".

Correct about condensation, wrong about the finding. The pass's own §3 of that technique lists four correction actions, and three are mechanical: "Replace a restated fact with a link to its canonical home" (given the canonical-home map, this is a lookup and a substitution), "delete a section whose content is an absence" (a section whose body is empty or a stated non-finding), and "collapse a table whose every row passes" (a per-row predicate over a rendered table). Only "condense prose over its guide's budget" and "rewrite a passage that breaks the register" are generative.

**Reclassified: mixed. Three of four correction actions are fixable; the technique should be split at that seam rather than graded structural whole.**

### OC-4 — The conservation law is an implementation choice, and the corpus already violates it.

**The law** (§10): "Every step made machine-executable loses its stated fallback path; every step that keeps a fallback path must state the procedure twice."

**The alternative design that violates it, already in the repo:** `audit-schema-validation.md` step 3 keeps *both*, in one sentence, without stating the procedure twice. It names the invocation (`npx tsx scripts/check-binding-fidelity.ts`), states the semantics the caller needs ("every `step.technique.inputs` key is a declared input, and every interpolation/condition read resolves to a producer"), and states the degradation/escape path ("if a flagged change is intentional, re-snapshot with `--update-baseline`"). The procedure lives in TypeScript; the prose carries the *contract and the escape hatch*, which is not a second copy of the algorithm.

That is the design the structural pass says is impossible: machine-executable, readable as its own contract, and degradable — because what the prose duplicates is the *signature*, not the *implementation*. The pass's §8 invariant conflated the two. The conservation law is therefore not a law; it is what you get if you insist the prose restate the algorithm.

**The pass's §9 "new impossibility" also fails on this evidence.** It argued a generated Protocol cannot carry rationale, citing `prose-sources-are-fallback-only` and `resume-preexisted-worktree`. Both of those live under `## Rules`, not `## Protocol`. Generating the Protocol from a signature leaves `## Rules` hand-written and untouched — the corpus's own section split already separates the generated-able part from the rationale.

---

## UNDERCLAIMS — what the structural pass was blind to

### UC-1 — `delivered_artifact` has no producer anywhere in the corpus. Step 7 of `sync-progress-status` is dead.

`sync-progress-status.md` declares input `delivered_artifact` ("Bare filename the selected rows' deliverable actually landed in, when it landed somewhere other than the row's seeded target") and Protocol step 7 branches on it: "a complete write with `{delivered_artifact}` bound repoints the item link at that artifact."

A corpus-wide grep for `delivered_artifact` returns **two hits, both inside `sync-progress-status.md` itself** — the input declaration and the step that reads it. No call site binds it. `commit-and-persist.md`'s Apply passes `activity_id`, `planning_folder_path` and `target_status`, and nothing else.

Under the `signature-is-the-contract` and `binding-carries-only-deviations` rules the corpus enforces, an input with no default and no binder is an unsatisfied binding gap. So the "complete, deliverable landed elsewhere → repointed at the artifact that actually holds it" row of the `planning-readme` Status transition policy **can never execute**. The policy documents behaviour the wiring cannot reach.

This is exactly the case `planning-readme.md#status-vocabulary` says matters: "a step that was skipped whose content landed somewhere else is **complete**, with the Item cell linked where the content actually landed". That link will always point at the seeded target instead.

**The structural pass graded `sync-progress-status` (F7) purely on hand-execution volume and missed that one of its ten steps is unreachable.**

### UC-2 — `naming-conventions` has no branch prefix for `epic` at all. F2 understated its own finding.

F2 flags "task/enhancement → `chore`/`refactor` as appropriate" as a partial map. It missed the harder gap: `issue-type-detection.md` declares the category enum as `feature`, `bug`, `task`, `enhancement`, `epic`, and `naming-conventions.md` step 2 maps *four* of those five. **`epic` has no prefix.** An epic-typed issue reaching step 4 has no defined value for `{type}` in `{type}/{issue_number}-{slugified-title}`.

This compounds with the project's own memory that "epics subsume member tickets" — epic-typed work packages are a live path, not a theoretical one.

**Severity: high.** Unlike the task/enhancement ambiguity (which yields one of two plausible prefixes), this yields *no* prefix and the agent must invent one, on a value the corpus itself calls "expensive to change once a PR is open".

### UC-3 — `write-artifact`'s output is uncited by the very technique that needs it (compounds UC-1).

`write-artifact` returns `{written_artifact}` — "Full path to the file just written" — and is referenced 87 times, the most-cited technique surveyed. `sync-progress-status` needs exactly that value to repoint an item link, under the name `delivered_artifact`. Neither the corpus's rename mechanism (`step.technique.inputs: { delivered_artifact: written_artifact }`) nor a same-name alignment is used anywhere.

The meta-law said an output with zero branch sites has "nowhere to propagate". `written_artifact` has zero branch sites *and* is the value the Progress table's link correctness depends on. **The meta-law's own criterion misclassifies it.** Instability in `write-artifact` (a lost mint race, per F10) produces a Progress row linking to the wrong instance, and no expression anywhere can notice.

### UC-4 — The guards cannot see planning folders, by construction.

`check-resource-anchors.ts` resolves its root as `../workflows` (overridable by `--root` or `WORKFLOWS_DIR`), and `check-site-links.ts` scopes to `site/**/*.html` with a hardcoded `GITHUB_PREFIX = 'https://github.com/m2ux/workflow-server/blob/main/'`. Neither can be pointed at `{planning_folder_path}` to do what `verify-artifact-links` asks — the anchor guard could be with a `--root`, but it would still ignore every non-anchored link and still read the working tree rather than `{artifact_publish_ref}`.

So F5's "the 151 LOC exist; only reachability… is missing" is optimistic in a specific way worth recording: reachability is the *cheap* part (WP-1 shows how), and the missing capability — non-anchored link resolution against a git ref — is the part nobody has written.

### UC-5 — `three-dot-name-status` pairs two git commands whose outputs are not guaranteed to align.

Step 2 instructs: "`git diff --name-status {base_ref}...HEAD` **paired with** `git diff --numstat`" and "Build `{changed_file_entries}` (one row per path; renames keep git's rename status form)".

The two commands do not agree on row shape for renames. `--name-status` emits `R100\told\tnew` (a status letter with a similarity score, and two paths); `--numstat` emits `additions\tdeletions\told => new` or, with the default quoting, a three-field form. Joining them "one row per path" requires a rename-aware key, which the protocol does not specify. Binary files add a second mismatch: `--numstat` emits `-\t-` rather than integers, and the declared output type for `additions`/`deletions` has no representation for that.

The structural pass graded this `low / fixable` as a pure transcription of four git invocations. It is that, plus an unspecified join with two known-divergent row shapes — which is precisely the kind of edge case the pass's own F5 argument says prose omits and code encodes.

### UC-6 — The pass never asked what mechanisation costs in *delivery*.

Every technique file surveyed is delivered to a worker as composed content — `fetch-costs-what-it-delivers` states "A fetch hands over the whole composed body — thousands of characters, whatever fraction of it a step reads". The surveyed candidate set is 10,005 words. Replacing a 67-word technique (`identify-path-type`) with a script invocation does not remove a fetch; it changes what the fetch delivers. The saving from F8/F9/F13-class findings is therefore not "the whole technique body" but the *difference* between a procedure statement and a signature-plus-invocation statement — and `audit-schema-validation.md` shows the latter runs 30–60 words per step. **The realistic per-technique saving on the small deterministic files is a fraction, not the whole**, and the pass's implicit sizing (word counts quoted as if they were the saving) overstates it.

---

## REVISED BUG TABLE

Consolidated. **Orig** = structural pass grade. **Rev** = my grade after evidence.

| # | Location | What breaks | Sev (orig → rev) | Class (orig → rev) | Why the change |
|---|---|---|---|---|---|
| R1 | `work-package/techniques/naming-conventions.md` step 2 | `epic` — a declared member of the `issue_type` enum — has **no** branch-prefix mapping. Agent invents one for a value the corpus calls expensive to change once a PR is open. Separately, task/enhancement map to two prefixes with no rule. | (F2 high) → **high** | fixable → **fixable** | Underclaimed (UC-2): the missing `epic` row is worse than the ambiguous one and was not named. |
| R2 | `meta/techniques/workflow-engine/sync-progress-status.md` step 7 + input `delivered_artifact` | Input has **no producer in the corpus** (2 grep hits, both self-references). The "deliverable landed elsewhere → repoint the link" branch of the Status transition policy is unreachable. Progress item links always point at the seeded target. | (not found) → **high** | — → **fixable** | New (UC-1). A documented policy row the wiring cannot execute. Fix is a one-line rename binding from `write-artifact`'s `written_artifact`. |
| R3 | `work-package/techniques/review-mode-detection.md` step 1–2 + `01-start-work-package.yaml:44` | Ambiguity is **self-assessed**; the confirm gate is conditioned on it. A confident misclassification bypasses the gate and drives 52 `when:` gates and 29 checkpoint conditions. | (F1 high) → **medium** | structural → **structural core, fixable guard** | OC-2. The pass missed the gate entirely. Fix: unconditional confirm, or assert the `is_review_mode && review_pr_missing` contradiction. |
| R4 | `work-package/techniques/manage-artifacts/write-artifact.md` step 4 | Mint-attempt guard asks an agent to win a scan-then-create race it cannot make atomic. 87 call sites. Compounds R2: a lost race puts the wrong path in a Progress link nothing can check. | (F10 medium) → **medium** | fixable → **fixable, and only in code** | Strengthened by UC-3: consequence is larger than "duplicate file" once the R2 link path is wired. |
| R5 | `work-package/techniques/manage-artifacts/verify-artifact-links.md` steps 2–3 | Non-anchored links are checked by nothing (guard ignores them; this is filed issue #395). Ref-relative resolution against `{artifact_publish_ref}` is implemented nowhere. Anchor slug edge cases are in the script and not in the prose. | (F5+F6 medium) → **medium** | fixable → **partly unwritten** | WP-3 + UC-4. Reachability is cheap; the missing capability is real work, not a wiring change. |
| R6 | `meta/techniques/version-control/three-dot-name-status.md` step 2 | The `--name-status` / `--numstat` join is unspecified and the two disagree on rename row shape; `--numstat` emits `-` for binary files, which the declared `additions`/`deletions` cannot hold. | (F9 low) → **medium** | fixable → **fixable** | UC-5. Not a transcription — an unspecified join over divergent formats. |
| R7 | `meta/techniques/verify-artifact-conforms.md` step 3 | Correction is generative *and* mutates already-persisted artifacts. But 3 of 4 correction actions (canonical-home substitution, absence-section deletion, all-pass table collapse) are mechanical. | (F11 medium/structural) → **medium** | structural → **mixed; split at the seam** | OC-3. Grading the whole technique structural hides three computable actions. |
| R8 | `meta/techniques/workflow-engine/sync-progress-status.md` (whole) + `planning-readme.md#status-transition-policy` | A 5×5 legal-write matrix, a 3-row link-reconciliation table and per-status `allow_overwrite_na` defaults, hand-applied ~30× per 15-activity run. `rows_updated` is a count, not a diff, so misapplication is silent. | (F7 medium) → **medium** | fixable → **fixable** | Unchanged. Highest-volume closed table in the corpus; the strongest pure-mechanisation case that survives my attack. |
| R9 | `work-package/techniques/manage-git/create-worktree.md` step 2 | Deterministic idempotency detection fused with two interactive escalations in one step. | (F14 low) → **low** | partly fixable → **partly fixable** | Unchanged. |
| R10 | `meta/techniques/version-control/select-target-component.md` step 3 | Tier 3's "clearly names one" has no criterion; tiers 1–2 are basename equality. Fused into one step. | (F4 medium) → **low** | partly fixable → **partly fixable** | Downgraded: step 2 already sets `component_selection_needed`, so a bad tier-3 recommendation is a *recommendation* shown at a gate, not a decision. The pass over-weighted it. |
| R11 | `meta/techniques/version-control/detect-repo-type.md` step 2 | Exclusion predicate is three literal string tests in prose. | (F3 high) → **low** | fixable → **fixable, cost only** | OC-1. The claimed failure scenario cannot occur. The rule is total. |
| R12 | `meta/techniques/version-control/identify-path-type.md`; `project-type-detection.md`; `verify-readme-conforms.md` | Small total functions carried as technique files. Real saving is the delta between procedure prose and signature-plus-invocation prose, not the whole file. | (F8/F12/F13 low) → **low** | fixable → **fixable, smaller than sized** | UC-6. Saving overstated by quoting word counts as if they were the delta. |
| R13 | Corpus-wide: `meta` and `work-package` vs `workflow-design` | Three `workflow-design` techniques invoke repo guards from protocol prose with declared outputs. `meta` and `work-package` invoke none. The capability is shipped and unused by the two largest workflows. | (F15 medium, misdiagnosed as a schema gap) → **high** | "needs new schema + new tool" → **fixable today, no new machinery** | WP-1/WP-2. This is the single largest correction to the structural pass, and it makes every other fixable finding cheaper than the pass estimated. |

---

## What survives of the structural pass

Two things, and they are the useful two.

1. **The mis-tuning observation holds.** The corpus does apply agent judgement where determinism is load-bearing (`is_review_mode`, `epic`-less branch naming) and withhold mechanisation where determinism is free (`sync-progress-status`'s table, `write-artifact`'s find-or-update). My corrections change the grades, not the direction.

2. **The fusion observation holds and I strengthened it.** Deterministic front-halves fused to judgement back-halves inside one Protocol step is real (R7, R9, R10) and is genuinely invisible to output-keyed typing.

## What does not survive

The conservation law and the meta-law, both. The law rests on prose having to restate the algorithm (OC-4 shows the corpus's own counter-example, where prose restates only the *signature* and the escape hatch). The meta-law rests on YAML `when:` expressions being the consumers that matter (WP-4 shows orchestrator prose gates, UC-3 shows a zero-branch-site output whose instability corrupts a published link). Neither should be carried into the report as a finding. The mis-tuning they were built to explain is better stated without them: **the corpus's two largest workflows have not adopted a mechanisation pattern their sibling workflow already uses, and the highest-value targets for it are the closed decision tables, not the git one-liners.**
