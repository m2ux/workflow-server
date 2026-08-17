# Structural Analysis — Mechanisation Potential of Agent-Executed Technique Prose

**Lens:** l12 (Structure First — Meta-Conservation Law) · **Pass:** 1 of 3 (structural)
**Target:** `/home/mike1/projects/dev/workflow-server` — `workflows/meta` and `workflows/work-package`
**GitNexus:** not indexed for this target. Module boundaries, call sites and fan-in below come from directory layout, group membership and corpus grep, not graph queries.

---

## 1. The falsifiable claim

**Claim (original):** Every deterministic procedure in this corpus exists in exactly one of two states — implemented in `scripts/` or `src/` where no workflow step can reach it, or written as protocol prose that is the only copy and is re-derived by an agent on every execution. There is no third state. No workflow step anywhere in the corpus invokes a domain computation.

Falsifier: exhibit one activity step that calls a server tool computing a domain fact.

**The falsifier does not exist.** `src/tools/workflow-tools.ts` registers `discover`, `list_workflows`, `get_workflow`, `next_activity`, `get_activity`, `yield_checkpoint`, `record_usage`, `resume_checkpoint`, `present_checkpoint`, `respond_checkpoint`, `get_trace`, `health_check`, `get_workflow_status`, `inspect_session`; `src/tools/resource-tools.ts` registers two more. Every one is session control-plane: it moves the pointer, delivers a definition, or reads session state. None resolves a repository, parses a `.gitmodules`, slugifies a heading, or writes a table cell. Against that, `scripts/` holds 26 `check-*.ts` guards, 15,257 LOC across 44 scripts, reachable only as repo CI.

## 2. Three experts

**Defender.** The asymmetry is concrete and measurable at a named pair. `scripts/check-resource-anchors.ts` (151 LOC) implements GitHub heading-slug resolution over the workflow corpus, with its edge cases documented in the file header: headings inside fenced code blocks produce no anchor and are skipped; duplicate headings take `-1`, `-2` suffixes per github-slugger; the slugger lowercases, strips non-word/space/hyphen characters, then replaces each space with a hyphen *without collapsing runs*, so "Plan & Prepare" renders `plan--prepare`; and unclosed fences invert direction — collection suppresses to end of file while the link scan reads all. Meanwhile `workflows/work-package/techniques/manage-artifacts/verify-artifact-links.md` step 3 instructs an agent to "Apply Anchor Integrity across the folder; record each `#anchor` it leaves unresolved". Same computation, none of those five edge cases stated, re-derived per run. An agent and the script will disagree on the first heading containing an ampersand.

**Attacker.** That pair overstates the case by roughly three quarters. The script's root is `workflows/`; the technique's scope is `{planning_folder_path}`. Different corpora. The technique emits four classes — `missing-target`, `unresolved-anchor`, `worktree-citation`, `resource-id-as-link` — and the script implements only the second. Worse for the defender, the technique's step 2 resolves relative targets "against the folder as the published tree holds it: the artifacts committed on `{artifact_publish_ref}`, not the working tree alone", which the script cannot do at all — it reads the working tree. So the script is not a stranded implementation of the technique. It is a different check that happens to share a slug function. Generalising from one 25%-overlapping pair to "every deterministic procedure" is unearned.

**Prober (what both take for granted).** Both parties assume the cost of a deterministic procedure executed non-deterministically is a defect. That is only true if some consumer reads the output and behaves differently. Neither expert asked which outputs are actually consumed. If two runs disagree about `broken_artifact_links` and nothing downstream branches on the difference, the disagreement is free. The shared assumption — that determinism is valuable per se — is the thing to test.

## 3. The transformed claim, and the gap

**Claim (transformed):** The corpus has no way to declare that a step's output is a *fact* rather than a *judgement*. A git SHA and a review verdict travel the same channel (`variables_changed` on the worker's `activity_complete`), land in the same bag, and are read by the same `when:` evaluator with the same evidentiary weight. Mechanisation candidates are invisible not because nobody looked but because the technique schema — `## Capability`, `## Inputs`, `## Outputs`, `## Protocol`, `## Rules` — carries no determinism marker for a guard to key on.

**The gap is the diagnostic.** I opened at "the same algorithm is written twice" — an implementation observation, answerable by deduplication. I landed at "the schema cannot type an output" — a schema observation, answerable only by changing the schema. Redundancy was the symptom. The corpus runs 26 guards over these files and not one of them can ask "is this step computable?", because nothing in the file answers.

## 4. The concealment mechanism

**The Protocol section's uniform imperative voice.** Every step in every technique in 101,200 words is a numbered imperative addressed to an agent, and the register does not vary with the nature of the step.

Set these two side by side, both from `workflows/meta/techniques/version-control/`:

- `identify-path-type.md` step 1: "Run `git ls-tree HEAD {path}` and read the mode prefix, returning `{kind}` as `submodule` when the mode is 160000 or `regular` when it is 040000."
- `select-target-component.md` step 3: "Emit `{recommended_component_path}` from the context available, in descending order of authority: `{component_hint}` when it matches a component's `path` basename, then `{mentioned_repo}` when its repository segment does, then `{identifying_context}` when it clearly names one."

The first is a total function from one shell command's output to a two-valued result. The second is a three-tier ranking whose first two tiers are string equality on a basename and whose third — "when it clearly names one" — is irreducible judgement. The typography, the numbering, the imperative mood and the `{brace}` variable convention are identical. A reader classifies by file title, and the file titles here are `identify-path-type` and `select-target-component` — both read as "resolution steps".

**Applying the mechanism to itself:** read at speed, `select-target-component` looks like a human-decision technique end to end. It is not. Steps 1 and 2 are pure cardinality tests on `{submodules}` — exactly one entry auto-resolves, two or more sets `component_selection_needed` and defers — and step 3's first two tiers are basename equality. The technique is roughly two-thirds mechanical, hidden inside a file the reader has already filed under "human picks the component".

## 5. First improvement (engineered to deepen the concealment; would pass review)

Add a `## Determinism` section to the technique template, declaring each output `derived` or `judged`, and ship `scripts/check-determinism-declared.ts` failing any output carrying neither.

This passes review on the first reading, and it should: it names the exact type the transformed claim says is missing, it enforces the declaration, and it follows house convention precisely — the repo's answer to every other classification gap is a declaration plus a guard, which is what `check-artifact-guides.ts`, `check-audience.ts`, `check-inherited-inputs.ts` and 23 siblings are.

**It deepens the concealment because the declaration is keyed on outputs and the fusion is keyed on steps.** `select-target-component` would declare `component_path: derived`, `component_selection_needed: derived`, `recommended_component_path: judged`, pass the new guard, and be certified correctly typed — while step 3 still fuses two string-equality tests and one judgement into a single imperative that no guard can decompose. The file now *looks* audited, and the fusion has moved below the granularity of the audit. A future reader trusts the header and stops reading the Protocol.

### Three properties visible only because I tried to strengthen it

1. **Fusion is at step granularity, not output granularity.** One output can be produced by a step that is two-thirds mechanical. Any typing scheme keyed on outputs is blind to it by construction. `naming-conventions.md` is the sharpest instance: steps 3 through 6 are slugify-plus-path-composition, wholly computable, while step 2 ("feature → `feat`, bug → `fix`, task/enhancement → `chore`/`refactor` as appropriate") is a lookup table with a judgement tail bolted on — and all four steps produce the single output `branch_name`.

2. **Determinism is a property of the procedure *plus its lookup tables' provenance*.** `detect-repo-type.md` is total given `.gitmodules` and the infrastructure-submodule list. But that list is `version-control.infrastructure-submodule-paths`, a prose rule in `version-control/TECHNIQUE.md`. The algorithm is deterministic; its table is prose that can be extended by argument. Mechanising the algorithm without promoting the table to data moves the non-determinism rather than removing it.

3. **A "judged" output is usually judged only in its tail case, and several techniques already split fact from judgement by *refusing*.** `issue-type-detection.md` is total on any issue carrying a platform type field, and becomes judgement exactly where signals are absent or conflict — which is the case it explicitly declines: "Do not pick a category unaided… an unsettled category is a decision for the binding activity's gate, not a guess here." The technique has already performed the split the schema has no name for. Same shape in `select-target-component` step 2 and `review-mode-detection` step 2.

## 6. Diagnostic applied to the first improvement

**What does it conceal?** That knowing which outputs are computable buys nothing when there is nowhere to compute them. A fully typed corpus addressing 16 control-plane tools can compute exactly zero domain facts. The declaration produces a manifest of work that cannot be executed, and a manifest of undoable work reads as progress.

**Property of the original problem visible only because the improvement recreates it:** *the reachability gap is upstream of the classification gap.* Twenty-six guards already compute corpus facts correctly and none is reachable from a run. The corpus's binding constraint was never "we do not know what is mechanisable" — it is that the activity schema has no verb for calling a computation. Its step kinds are `technique`, `action`, `checkpoint`, `loop`; `action` verbs are, per the server's own enforcement note, "AGENT-executed: you carry them out. The server records the step but applies no action verb and sets no session variable from one."

## 7. Second improvement, and the diagnostic again

Add one MCP tool, `compute`, dispatching on a registered procedure id (`resolve-host-repo`, `write-artifact`, `verify-links`, `sync-progress`), plus a `kind: compute` step in the activity schema whose declared `inputs[]`/`outputs[]` bind through the existing `variable-binding` technique unchanged.

**Diagnostic.** This conceals that the registry becomes a third definition surface with its own drift problem. A `compute` procedure and its technique file must agree on signature and semantics, and nothing would check that. The repo has already met this failure mode and named it: `scripts/check-binding-fidelity.ts` exists because declared signatures drift from call sites, and `scripts/binding-fidelity-triage.json` is the standing list of drift the toolchain has conceded. Adding a computation registry adds a third surface to hold in sync with prose and schema — and the triage file is evidence that two is already more than the toolchain holds.

## 8. The structural invariant

**A procedure's authoritative definition can live in exactly one of three places — the prose an agent executes, the code a machine executes, or the schema a guard checks — and every mechanisation moves it between places rather than reducing their number. No procedure can be simultaneously machine-executable, readable as its own definition, and checkable as a contract, without one of the three being a derived copy that can drift.**

## 9. Inverting the invariant

Make "one definition, three consumers" trivially satisfiable by **generation**: author each procedure once as TypeScript with a declared signature, and generate the technique markdown's `## Inputs`, `## Outputs` and `## Protocol` from it. The machinery exists — `scripts/generate-schemas.ts` and `scripts/generate-site-data.ts` already generate artifacts from source of truth in this repo.

**The new impossibility:** a generated Protocol cannot carry the rationale that makes it followable when the computation is unavailable. This corpus's protocol prose does triple duty — it is the procedure, the fallback when the tool is absent, and the explanation of why the procedure is shaped the way it is. Two rules make this concrete and neither is derivable from any implementation:

- `resolve-host-repo.md` / `prose-sources-are-fallback-only`: "The workspace `AGENTS.md` / `CLAUDE.md` and the user are fallback sources for `{target_repo}`, never primary ones… A repository taken from prose while git could have answered is the defect this technique exists to remove."
- `verify-feature-branch.md` / `resume-preexisted-worktree`: "On a fresh create-worktree path this check is always true. It exists for resume cases where `{target_path}` already existed and an established worktree was reused."

Generate the Protocol and the degradation path and the why are lost. Hand-write the rationale beside a generated Protocol and there are two definitions again.

## 10. The conservation law

**Determinism and degradability are conserved across this corpus. Every step made machine-executable loses its stated fallback path; every step that keeps a fallback path must state the procedure twice. The sum of (procedures an agent can execute unaided) and (procedures a machine executes) is fixed at the number of procedures — mechanisation moves the partition, it does not shrink the corpus.**

## 11. Diagnostic applied to the conservation law

**What does the law conceal about *this* problem?** It prices degradability uniformly, and the corpus contradicts that for a specific, identifiable subset. `identify-path-type.md` (67 words) has no fallback: if `git ls-tree` cannot run there is no answer, and the technique states none. `three-dot-name-status.md` (158 words) is four git invocations with no alternative path. `derive-workflows-target-path.md` (238 words) is pure string manipulation on `{planning_folder_path}` with nothing to degrade to. For these, mechanisation costs exactly zero degradability. The conserved quantity is not spread evenly — it is concentrated in the techniques whose fallback is *the user*.

**Invariant of the law, and its inversion.** The law assumes every procedure carries a degradability budget. Invert it: suppose degradability is free because the tool is always available. Then the law says nothing and the partition collapses to "mechanise everything". But that is already the state of `scripts/` — 26 guards, always runnable under `npx tsx`, none reachable from a run. **Availability was never the binding constraint.**

## 12. The meta-law

**The binding constraint is not whether a procedure is deterministic, nor whether a machine can run it, but whether its output is read by a `when:`, a checkpoint `condition:`, or a `transition:`. An output the schema branches on must be a stable value, because an unstable one silently takes a wrong branch. An output only prose reads can stay prose, because its instability has nowhere to propagate.**

**Concrete testable consequence:** the outputs of candidate techniques divide cleanly into those appearing in branch expressions in the activity YAMLs and those appearing in none — and the division does not follow how deterministic the procedure is.

**The test, run against the corpus:**

| Output | Producing technique | Branch sites | Procedure |
|---|---|---|---|
| `is_review_mode` | `review-mode-detection` | **85** — 52 `when:` gates, 29 checkpoint `condition.variable`, 4 `setVariable`, across 11 of 15 work-package activities | open-ended signal inspection with an "and similar" tail |
| `is_monorepo` | `detect-repo-type` | 4 `when:` gates in `meta/02-resolve-target.yaml` | `.gitmodules` parse minus a fixed exclusion list |
| `component_selection_needed` | `select-target-component` | 1 `when:` gate + 1 checkpoint condition | cardinality test on the submodule list |
| `host_binding_mismatch` | `resolve-host-repo` | 1 checkpoint condition in `meta/00-discover-session.yaml` | basename string compare |
| `issue_type_ambiguous` | `issue-type-detection` | 1 checkpoint condition | signal agreement test |
| `review_pr_missing` | `review-mode-detection` | 3 checkpoint conditions | reference-present test |
| `issue_present` | `issue-reference-detection` | 1 checkpoint condition | regex match |
| `broken_artifact_links` | `verify-artifact-links` | **0** | link + anchor resolution over a folder |
| `rows_updated` | `sync-progress-status` | **0** | 5×5 status transition table |
| `changed_file_entries`, `head_sha`, `base_sha` | `three-dot-name-status` | **0** | four git invocations |
| `written_artifact` | `write-artifact` | **0** | find-or-update filesystem algorithm |
| `component_git_dir` | `repo-root-resolution` | **0** | `.gitmodules` lookup + path join |

**The prediction holds, and it inverts the obvious priority.** The single most branch-load-bearing variable in the entire work-package workflow — `is_review_mode`, 85 references gating 11 of 15 activities — is produced by the *least* deterministic step in the surveyed set: `review-mode-detection.md` step 1, "Inspect `{user_request}` for signals that it is a review of an existing PR rather than new work (an explicit 'review', a PR number or URL, 'is this safe to merge', and similar)". An open enumeration terminated by "and similar" decides 52 `when:` gates. Meanwhile the four most mechanically perfect procedures in the corpus — `three-dot-name-status`, `write-artifact`, `verify-artifact-links`, `sync-progress-status` — produce outputs that no expression in any activity YAML reads.

The corpus is therefore mis-tuned in both directions at once: it applies agent judgement where determinism is load-bearing, and it withholds mechanisation where determinism is free but inconsequential.

---

## 13. Concrete findings

Severity: **high** = wrong value silently takes a wrong branch; **medium** = wrong value produces a wrong artifact a reader will trust; **low** = cost only, no correctness consequence.

| # | Location | What breaks | Severity | Law's verdict |
|---|---|---|---|---|
| F1 | `work-package/techniques/review-mode-detection.md` step 1 | "and similar" terminates an open enumeration whose result gates 52 `when:` expressions and 29 checkpoint conditions across 11 activities. Two runs on the same request can partition the whole workflow differently, and nothing downstream can detect the divergence. | high | **Structural.** Intent classification is irreducible. Fixable only by narrowing what the flag gates, not by computing the flag. |
| F2 | `work-package/techniques/naming-conventions.md` step 2 | The type-prefix map is partial and self-undermining: "task/enhancement → `chore`/`refactor` as appropriate" gives two categories, two prefixes and no mapping. `{issue_type}` fixes the branch name, which `issue-type-detection` itself calls "expensive to change once a PR is open". | high | **Fixable.** Complete the table to a total function; the enum is closed (feature, bug, task, enhancement, epic). |
| F3 | `meta/techniques/version-control/detect-repo-type.md` step 2 | The exclusion list `infrastructure-submodule-paths` is prose in `TECHNIQUE.md`, not data. A submodule near the boundary can be classified either way between runs, flipping `is_monorepo`, which gates 4 steps in `meta/02-resolve-target.yaml`. | high | **Fixable.** Promote the list to a data file; the algorithm around it is already total. |
| F4 | `meta/techniques/version-control/select-target-component.md` step 3 | Tier 3, "`{identifying_context}` when it clearly names one", has no criterion for "clearly". Tiers 1 and 2 are basename equality and would compute; the fused step makes the whole ranking unverifiable. | medium | **Partly fixable.** Split tiers 1–2 out as computed; tier 3 is genuine judgement and must stay. |
| F5 | `work-package/techniques/manage-artifacts/verify-artifact-links.md` step 3 vs `scripts/check-resource-anchors.ts` | The script encodes five slug edge cases (fenced-code skip, duplicate `-1`/`-2` suffixes, non-collapsing space→hyphen so "Plan & Prepare" → `plan--prepare`, unclosed-fence direction inversion, non-`.md` targets ignored). The technique states none. An agent will diverge from CI on the first ampersand heading. | medium | **Fixable.** The 151 LOC exist; only reachability and the `{artifact_publish_ref}` resolution are missing. |
| F6 | `work-package/techniques/manage-artifacts/verify-artifact-links.md` step 2 | Resolution is specified against the published ref, not the working tree — "A target present locally but absent from that ref resolves for the author and 404s for the reader." No tool in the corpus does ref-relative existence checking, so an agent almost certainly checks the working tree and the stated failure mode ships. | medium | **Fixable.** `git cat-file -e {ref}:{path}` per target. |
| F7 | `meta/techniques/workflow-engine/sync-progress-status.md` + `meta/resources/planning-readme.md#status-transition-policy` | A 5×5 legal-write matrix plus a 3-row item-link reconciliation table plus an `allow_overwrite_na` default that differs per target status, all executed by hand on every dispatch and every `activity_complete`. For a 15-activity work-package run that is ~30 hand-applications of the same table per run. Output `rows_updated` gates nothing, so a misapplication is silent. | medium | **Fixable.** The table is total and closed; this is the highest-volume pure-table step in the corpus. |
| F8 | `meta/techniques/version-control/identify-path-type.md` | One `git ls-tree` and a mode compare (160000 / 040000), carried as a 67-word technique file that must be fetched, delivered and read on every use. No fallback exists, so mechanising costs no degradability. | low | **Fixable.** Zero-judgement, zero-degradability. |
| F9 | `meta/techniques/version-control/three-dot-name-status.md` | Four git invocations (`rev-parse HEAD`, `merge-base`, `diff --name-status`, `diff --numstat`) and a join into one row set. 158 words of prose for a total function. | low | **Fixable.** Same class as F8. |
| F10 | `work-package/techniques/manage-artifacts/write-artifact.md` | Find-or-update with lowest-numbered-instance-wins, a mint-attempt re-scan against a race, and an assumptions-log side effect on duplicate detection. 333 words, **87 corpus references** — the most-cited technique surveyed. Step 4 explicitly guards a race ("If one appeared (race or stale listing), fall through to step 2") that an agent re-reading a directory listing cannot actually win. | medium | **Fixable, and the race is only closable in code.** An agent cannot make scan-then-create atomic; a server tool can. |
| F11 | `meta/techniques/verify-artifact-conforms.md` step 3 | "Correct in Place" instructs the agent to "condense prose over its guide's budget" and "rewrite a passage that breaks the register". This is generation, not validation, and it mutates artifacts the run already persisted. `conforms` is read by no branch expression. | medium | **Structural.** Prose condensation is irreducibly generative. The *detection* half (line budget, missing section, table-all-rows-pass) is computable; the correction half is not. |
| F12 | `meta/techniques/workflow-engine/verify-readme-conforms.md` steps 3–4 | H1/H2 set extraction and comparison against a template section list, plus a header-blockquote field compare. Pure parsing, producing three drift arrays and a conjunction. Referenced by `workflow-orchestrator.md` as a gate on Progress durability, but `conforms` appears in no `when:`. | low | **Fixable.** |
| F13 | `work-package/techniques/project-type-detection.md` | Detects exactly one project type (`rust-substrate` vs `other`) by globbing `Cargo.toml` for `sp-*`/`frame-*`/`pallet-*`. A 133-word technique whose output space has two members and whose detection is a dependency-name prefix match. | low | **Fixable**, though the finding worth reporting is that the abstraction is oversized for its range. |
| F14 | `work-package/techniques/manage-git/create-worktree.md` step 2 | Idempotency detection (`worktree list --porcelain`, verify path registered and pointing at `{branch_name}`) is deterministic, but the step fuses it with two interactive escalations ("surface the conflict to the user", "ask the user whether to use the existing branch"). The detection cannot be lifted without splitting the step. | low | **Partly fixable.** Same fusion shape as F4. |
| F15 | Corpus-wide | No technique file declares whether an output is derived or judged, so none of the 26 guards can find a mechanisation candidate or flag a fused step. The classification gap is why F1–F14 had to be found by reading 10,005 words of technique prose by hand. | medium | **Fixable**, but per §6 the declaration alone is a manifest of undoable work — it pays only alongside a computation verb. |

### Silent failures specifically

- **F1, F3** — a wrong boolean takes a wrong branch and the run proceeds normally. No artifact records the decision's basis.
- **F7** — a Progress cell written against policy looks exactly like a correct one; `rows_updated` is a count, not a diff.
- **F10** — a lost mint race produces two numbered instances of one logical artifact; step 1 detects this only on the *next* write, and then logs it rather than resolving it.
- **F5, F6** — a link check that passes on the working tree and fails for the reader produces a clean report and a broken published folder.

### What the conservation law predicts is not fixable

F1 and F11. Intent classification from free text and prose condensation against a register are the two places where the judgement is the point, not an artefact of how the prose was written. Every other finding is a table, a parse, a path join, or a git invocation whose fallback is nothing.
