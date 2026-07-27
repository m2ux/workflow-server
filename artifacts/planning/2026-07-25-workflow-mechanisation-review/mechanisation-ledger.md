# Mechanisation Ledger — work-package

> Review · Created 2026-07-25 · **Status:** Planning

Candidate inventory for moving deterministic steps out of technique prose and into scripts the
agent runs. Companion documents: [invocation-contract.md](invocation-contract.md),
[roadmap.md](roadmap.md), [poc-naming-conventions.md](poc-naming-conventions.md).

Baseline: `work-package` v3.35.0, `meta` v5.7.0, verified against tip on 2026-07-25.

## 1. The determinism test applied

> A step is **fully mechanisable** iff, for every state the workflow can legally reach, its declared
> outputs are a total function of (a) inputs already bound in the session bag, (b) mechanically
> observable state — filesystem, git refs, file contents, and the server's own `session.json` — and
> (c) the invocation clock. No judgement, no natural-language interpretation of free prose, no
> user-facing decision.

Three tightenings over the proposed form, each earned during the sweep:

1. **`session.json` is mechanically observable state.** It is a schema-validated JSON file at a path
   the agent already holds. Admitting it moves `render-token-usage` (pure arithmetic over
   `usage`) from "needs agent memory" to "reads a file".
2. **The clock is an input, not ambient state.** `version-control::initialize-folder` composes
   `YYYY-MM-DD-{initiative_name}`. The date is deterministic *given* the invocation instant, which is
   exactly the property a `--now=` flag makes testable. Without this the op fails the test on a
   technicality and no script could ever be fixture-tested.
3. **Regex parsing of a *bounded* string is mechanical; classification of *intent* is not.** Both
   `issue-reference-detection` and `review-mode-detection` read free text. The first looks for a
   syntactic token (`#N`, `PROJ-N`, a URL) — a total function of the string. The second asks whether
   the user *means* review — not a function of the string. Same input type, opposite verdicts; the
   test has to discriminate them, and "is the answer recoverable by a regex whose false-positive set
   is empty" does.

**Judgement markers** located, not disqualified: *as appropriate*, *assess*, *judge*, *decide*,
*surface to the user*, *ask whether*, *when clear*, *confidently*, *significant*, *as needed*,
*prefer*, *interactively*, *invent*. Where one of these sits inside an otherwise-arithmetic protocol,
the ledger records the seam rather than the verdict.

**Two hard exclusions applied throughout, no deviations:**

- **Checkpoint-gated human decisions are never mechanised.** `dco-provenance::record-attestation`
  is the clean case: its protocol *already* forbids synthesising the attestation ahead of the human's
  selection. The row exists in the do-not list to make the exclusion explicit, not because the
  arithmetic is hard.
- **Authenticated network operations are a separate class.** Every `atlassian-operations::*`,
  `github-cli-protocol::*`, `manage-git::detect-merge-strategy` (a `gh api` call), and
  `gitnexus-operations::*` op is already a thin protocol wrapper around a CLI or MCP tool. Wrapping a
  wrapper adds a layer and no determinism. Excluded as a class, listed once.

## 2. Corpus measurement

Instrumented by walking all 15 activity YAML files, resolving every `kind: technique` step's `::`
reference to its file, and adding the composed contract (group `TECHNIQUE.md` + workflow-root
`TECHNIQUE.md`) that §5 of the [technique protocol
spec](../../../../docs/technique-protocol-specification.md) says rides along on every delivery.

| Metric | Value |
|---|---|
| Activities | 15 |
| `kind: technique` step bindings | 163 |
| Distinct techniques bound | 105 |
| Estimated composed technique delivery, full walk | **741,531 chars ≈ 185k tokens** |

That estimate is corroborated by the 2026-07-03 [payload
measurements](../2026-07-03-schema-technique-disclosure-review/payload-measurements.md), which drove
the real server over an in-memory transport and recorded **742,822 chars over 161 `get_technique`
calls**. Two independent methods within 0.2 % — the cost model below rests on measured ground, not a
guess.

Cost concentration: the top 10 techniques by delivered volume account for 300k of the 741k chars, and
**none of them is mechanisable** — they are the assumption-review loop, the analyse–challenge loop,
and the review passes. This is the ledger's first structural finding: *mechanisation does not touch
where the tokens are*. The deterministic set is 15 % of delivery volume.

## 3. Fully mechanisable

Side-effect classes: **PC** pure computation · **RO** read-only probe · **FS** filesystem mutation ·
**GIT** git mutation · **NET** network (unauthenticated / user's own credentials).

| # | Technique / step | Binds | Inputs bound at that point? | Side-effect | Current cost (protocol steps · expected tool calls · composed chars) | Checkpoint gate | Effort | Confidence |
|---|---|---:|---|---|---|---|---|---|
| M-1 | `manage-artifacts::write-artifact` | 3 | yes | FS | 6 steps · ~4 calls each (scan, read, re-scan, write) · 8,483 | no | M | high |
| M-2 | `manage-artifacts::verify-artifact-conforms` (detect half) | 1 | yes | RO | 4 steps · ~31 calls (one read per planning artifact; 30 exist) · 8,006 | no | M | med |
| M-3 | `naming-conventions` | 2 | `issue_title` after issue verify; `planning_folder_path` after bind step | PC | 6 steps · 0 calls, pure reasoning · 4,016 | no | S | high |
| M-4 | `workflow-engine::verify-readme-conforms` | 1 | yes | RO | 4 steps · ~3 calls · 5,918 | no | S | high |
| M-5 | `workflow-engine::sync-progress-status` | orchestrator hook, ≥8/run | yes | FS | 8 steps · ~3 calls · 4,286 | no | M | med |
| M-6 | `finalize-documentation::render-token-usage` | 1 | yes | PC+FS | 3 steps · ~3 calls · 3,950 | no | S | high |
| M-7 | `dco-provenance::append-task-row` | 1 (per task, loops) | yes | FS | 2 steps · ~2 calls · 2,131 | no | S | high |
| M-8 | `repo-root-resolution` | 1 | yes (`discovered_path`) | RO | 4 steps · ~2 calls · 2,286 | no | S | high |
| M-9 | `project-type-detection` | 1 | yes | RO | 3 steps · ~2–3 calls (glob + read) · 1,786 | no | S | high |
| M-10 | `issue-reference-detection` | 1 | yes | PC | 4 steps · 0 calls · 1,942 | no | S | high |
| M-11 | `manage-git::update-repo-submodules` | 1 | yes | GIT+NET | 6 steps · ~4 calls (flock, stat, update, touch) · 4,805 | no | M | med |
| M-12 | `manage-git::artifact-commits` | 1 | yes | GIT+NET | 5 steps · ~5 calls incl. retry-once cycle · 4,444 | no | M | med |
| M-13 | `version-control::detect-repo-type` (meta) | 1 (meta 02) | yes | RO | 3 steps · ~2 calls · — | no | S | high |
| M-14 | `version-control::list-submodules` (meta) | 1 (meta 02) | yes | RO | 2 steps · ~1 call · — | no | S | high |
| M-15 | `version-control::initialize-folder` (meta) | 1 | yes | PC | 2 steps · 0 calls · — | no | S | high |

Notes that change the reading of the table:

- **M-3 is the only row with a negative token/turn delta.** It currently costs *zero* tool calls
  (the agent derives both values in reasoning) and its thin rewrite costs *one*. Measured payload
  delta from the PoC: **−19 chars, −0.6 %**. Its case is entirely fidelity and drift — see
  [poc-naming-conventions.md](poc-naming-conventions.md), which found 8 disagreements between the
  prose and any deterministic reading of it.
- **M-2's 31 calls are the largest single loop in the deterministic set.** The planning folder holds
  30 `.md` artifacts today; the protocol says "enumerate the planning artifacts … check each". Four of
  the six violation classes (`omit-null-sections`, `state-once-per-artifact` recap tables,
  `exception-only-reporting` all-pass tables, `line-budget`) are structural and detectable by parser.
  Two (`single-source-and-link` restatement, and every *fix*) are semantic. Hence "detect half".
- **M-5 has no step binding to count.** It is an orchestrator hook applied at each activity
  boundary — at least 15 apply sites per run against a 17-row Progress table, and its policy
  (`Status transition policy`, `Matching`, `Status column`, `Icon key`) lives in a 12k-char resource
  the agent must hold to apply it correctly. Highest-leverage FS candidate after M-1.
- **M-11 / M-12 are `NET` but not *authenticated-API*.** They are `git submodule update` and
  `git push` over the user's own credentials on the user's own host — which is precisely why the
  agent-runs-the-script locus is the only viable one for them (the container holds no credentials).
  Their determinism is in the *control flow*: flock, mtime skip-if-recent, rebase-then-push,
  retry-once. Prose expresses concurrency control badly; a script expresses it exactly.

## 4. Separable — seam stated

| # | Technique | Binds | Deterministic core → script | Judgement clause that stays | What crosses the seam | Side-effect | Effort | Confidence |
|---|---|---:|---|---|---|---|---|---|
| S-1 | `manage-git::create-worktree` | 2 | resolve component git dir; `fetch`; resolve default branch via `symbolic-ref` with main/master fallback; idempotency probe against `worktree list --porcelain`; `worktree add` (±`-b`) | "surface the conflict … do NOT delete the path — offer to choose a different wp-slug"; "if `{branch_name}` already exists, ask the user whether to use the existing branch" | script returns `{worktree_created, conflict_kind, existing_target, registered_branch}`; agent owns the two conflict dialogs | GIT | M | high |
| S-2 | `review-mode-detection` | 2 | PR-reference extraction from `{pr_reference}`/`{user_request}`; `pr_number` parse; branch capture from the checked-out PR; ticket-ref extraction from PR body/commits | "inspect for signals that it is a review … prefer an immediate derive"; the ambiguity verdict | script returns `{pr_number, review_pr_url, branch_name, review_ticket_ref, review_pr_missing}`; agent owns `is_review_mode` / `review_mode_ambiguous` | RO+NET | M | high |
| S-3 | `manage-artifacts::verify-artifact-conforms` | 1 | the four structural violation classes (see M-2) | `single-source-and-link` restatement detection (needs the canonical-home *meaning*); every in-place fix; the "requested detail is exempt" carve-out | script returns `violations[]` with `fixed: false`; agent fixes and re-runs | RO | M | med |
| S-4 | `workflow-engine::create-readme` | 1 | load Template; load seed profile; populate header/Links/Progress inventory; apply mode-exclusion map; write the file | nothing in the protocol itself — but `{entity_context}` arrives from upstream judgement, and `overview-placeholders-at-seed` must be honoured | script consumes `entity_context` as JSON; returns `created_readme` | FS | M | high |
| S-5 | `strategic-review::verify-fragment` | 1 | the CI regex check (`github\.com/.+/issues/[0-9]+`, `(Fixes\|Closes\|Resolves):?\s+#[0-9]+`); the `changes/`-absent skip → `null` | "locate the fragment that ties to this issue/PR/work package" — matching by convention is fuzzy when siblings do not follow one | script takes an explicit `--fragment=` path or globs and returns candidates; agent picks when >1 | RO | S | high |
| S-6 | `strategic-review::changes-folder` | 1 | detect `changes/`; infer filename convention from siblings; format the issue reference by `{issue_platform}`; validate against the CI regex | "read sibling fragments as the format template" (section structure is prose imitation); the Jira→GitHub tracker search and its warning | script returns `{convention, reference_line, validates}`; agent writes the body | FS | M | med |
| S-7 | `manage-git::commit-paths` | applied, not bound | branch guard; `add -- paths`; empty-staged-diff short-circuit; commit; `rev-parse HEAD` | `code-commit-coauthor-trailer` — "whether to add it manually depends on the harness" is a harness fact, not arithmetic | script takes `--coauthor=` (or omits) and returns `commit_sha`; harness-compat supplies the flag | GIT | S | high |
| S-8 | `manage-git::restore-paths-from-ref` | applied | `rev-parse --verify` of `{base_ref}`; whole-file `checkout {ref} -- path`; skip-missing-at-ref; stage | `{interactive}` true → `checkout -p` hunk selection is irreducibly interactive | script handles `interactive=false` only and refuses `true` with exit 3 | GIT | S | high |
| S-9 | `manage-git::verify-commit-signatures` | 1 | `git log --format='%h %G?'` over the range; the "any `N`/`B`" verdict | "rebase and sign it before proceeding" — a history rewrite is not a probe | script returns `{commits_signed, unsigned}`; rewrite stays with the agent (and with S-10) | RO | S | high |
| S-10 | `strategic-review::resign-commits` | 1 | merge-base resolution; `rebase --exec` re-sign; the `%G?` confirmation loop; `--force-with-lease` | recording a re-sign failure as a `{review_findings}` entry is authoring | script returns `{unsigned_commits_in_pr, failed}`; agent authors the finding | GIT+NET | M | low |
| S-11 | `version-control::select-target-component` (meta) | 1 | exactly-one → auto-resolve; two-or-more → set `component_selection_needed` | "when `{identifying_context}` clearly names one of the components, pre-select it as the recommended option" | script returns `{target_path, component_selection_needed, candidates[]}`; agent pre-selects | PC | S | high |
| S-12 | `review-baseline-state` | 1 | `base_sha`; `changed_files`; `base_pr_diff` | `expected_changes` against `{requirements}` is the whole point of the technique | script returns the three git facts; agent derives the expectation | RO+NET | S | high |
| S-13 | `manage-git::remove-worktree` | 1 | gate on `{worktree_created}`; resolve git dir; `worktree remove` | "the binding activity decides whether to retry with force or abort" | script returns `{worktree_created, blocked_by_uncommitted}`; never passes `--force` itself | GIT | S | high |
| S-14 | `finalize-documentation::finalize-test-plan` | 1 | locating candidate source sites for each named test | which site *is* the test case | script returns candidate sites; agent matches | RO | S | low |

## 5. Irreducibly agentic

Left alone. 76 of the 105 bound techniques, ~84 % of delivered technique volume. Grouped by why:

- **Elicitation and interview** — `requirements-elicitation::{elicit, discuss, ask-question,
  create-document}`, `review-assumptions::{collect, interview, record, reconcile}` (54k + 42k + 33k +
  35k chars/run — the four costliest rows in the corpus), `assess-ticket-completeness`.
- **Judgement and classification** — `design-philosophy::{classify, define, determine-path}`,
  `findings-classification`, `strategic-findings-analysis`, `review-outcome-analysis`,
  `research::{triage, synthesize}`, `task-completion-review`.
- **Review passes** — `review-code`, `review-diff`, `review-test-suite`, `review-summary`,
  `review-existing-feedback`, `strategic-review::{review-scope, document-findings,
  recommend-cleanup}`, `respond-to-pr-review`.
- **Authoring** — `plan-prepare::{plan, create-todos}`, `create-test-plan`, `create-adr`,
  `summarize-architecture`, `stakeholder-overview`, `implementation-analysis::{analyze, document}`,
  `codebase-comprehension::{survey, deep-dive, revise-questions}`, `update-pr::render`,
  `finalize-documentation::{create-complete-doc, ensure-docs, update-adr}`,
  `conduct-retrospective::{retrospective, select-next}`.
- **Implementation** — `implement-task`, `apply-review-fixes`, `validate-build::{analyze-failure,
  apply-fix}`, `analyse-challenge::{run-loop, challenge, combine}`.
- **Tool wrappers** (already one call each; see do-not list) — 15 `atlassian-operations::*`,
  7 `github-cli-protocol::*`, `gitnexus-operations::{analyze, detect-changes}`,
  `cargo-operations::{run-suite, test, preflight}`.

## 6. Cost and benefit

### 6.1 Token accounting, honestly

The mechanisable + separable set delivers ≈ **112,000 chars ≈ 28k tokens** per full walk, 15 % of the
185k-token technique budget. Savings can only come from three places, and here is what each is
actually worth:

| Channel | Measured / estimated | Verdict |
|---|---|---|
| **Shorter technique payload** | PoC M-3: 3,233 → 3,208 chars (**−0.6 %**). Section split: Protocol −185, Outputs −251, Inputs **+174**, Rules **+224** | **≈ zero.** The `## Inputs`/`## Outputs` signature dominates a technique file and *cannot* shrink — `signature-is-the-contract` requires every value the step consumes and produces to stay declared. Mechanisation replaces a derivation with an invocation; it does not replace the interface. |
| **Eliminated tool-call loops** | ~70 agent tool calls removed across the set (M-2: −30, M-1: −9, S-1: −8, M-12: −4, M-11: −3, M-5: −2, others 1–2 each). M-3: **+2** | **the real win.** Not visible in the 252-MCP-call figure at all — these are Bash/Read/Write calls the payload measurement never counted. At ~1–3 s per round trip plus turn overhead, this is the workflow-completion-speed axis. |
| **Eliminated reasoning** | Unmeasured; bounded by inspection. M-3 asks the agent to choose a prefix "as appropriate", count characters against a "~40" budget, and pattern-match a 6-segment path template — 4 derivations × ~150–400 reasoning tokens, twice per run | **material but unmeasurable without a live instrumented run.** Recorded as the weakest quantitative claim in this review; see [roadmap.md](roadmap.md) §5 for the experiment that would settle it. |

**Net-small or net-negative candidates**, reported as required and carried to the do-not list:

| Candidate | Why the net is poor |
|---|---|
| `naming-conventions` (M-3) | Net **negative** on tokens and turns: 0 → 1 tool call, −0.6 % payload. Recommended anyway, on drift alone. |
| `issue-reference-detection` (M-10) | Also 0 → 1 call. A regex the agent already runs correctly in reasoning. Worth doing only because it rides the same script bundle as M-3 at ~30 lines' marginal cost. |
| `version-control::identify-path-type` | Already one `git ls-tree` and a mode comparison. 414 chars total. Nothing to eliminate. |
| `manage-git::{verify-feature-branch, push-commits, sync-branch}` | One command each, 117–358 protocol chars. Individually pointless — but see the aggregation note below. |
| `manage-git::instruct-merge-strategy` | Its entire output *is* prose guidance for a human, branched on one boolean. Scripting the branch saves a coin-flip. |
| `version-control::initialize-folder` (M-15) | Two lines of date arithmetic. Included in the ledger only because it is free once `wp.py` exists. |

**Aggregation is where the small candidates become one good one.** `verify-feature-branch` +
`verify-commit-signatures` + `push-commits`' verification + `sync-branch`'s fetch state are four
separate probes of the same working tree, each with its own composed-contract overhead (2,817–3,334
chars) — 12.5k chars to learn four facts. A single `wp git-state` subcommand returns all four in one
call at one technique's cost. Four net-negative candidates compose into one net-positive one.

### 6.2 Fidelity and drift, with evidence

Per candidate: an observed drift/error, a diverged duplicate rule, or an explicit "none found".

| Candidate | Evidence | Class |
|---|---|---|
| `naming-conventions` (M-3) | **Three-way divergence, verified on this host's filesystem.** [`naming-conventions.md:59`](../../../../workflows/work-package/techniques/naming-conventions.md) mandates `<install-root>/worktrees/<owner>/<repo>/<slug>/`; [`docs/install-projects-worktrees.md:10`](../../../../docs/install-projects-worktrees.md) marks exactly that shape **deprecated** and mandates `<checkout>/.worktrees/<slug>/`; `docker-compose.yml:3` records `$INSTALL/worktrees` as deprecated too. On disk: the docs shape exists (1 worktree under `workflow-server/.worktrees/`), the prose *fallback* shape exists (12+ under `~/projects/work/<component>/<slug>/`), and the prose *primary* shape — `$INSTALL/worktrees/` — **does not exist at all**. The primary branch of the live rule has produced zero correct paths and would produce a forbidden one. | diverged duplicate + dead rule |
| `naming-conventions` (M-3) | **Self-contradiction.** Step 6 states "Never place `{target_path}` under `{planning_folder_path}` or under `{repo_root}`". The docs-mandated layout places it at `<checkout>/.worktrees/<slug>/`, and `repo-root-resolution` sets `repo_root` = the checkout for a standalone repo. The mandated path violates the rule that guards it. No agent reading both documents can satisfy both. | contradiction |
| `naming-conventions` (M-3) | **Under-anchored pattern, found by the PoC.** The step-6 install-layout test — "`{planning_folder_path}` matches `…/projects/<owner>/<repo>/.engineering/artifacts/planning/{$wp_slug}`" — fires on the docs-*preferred* nested layout too, reading `~/projects/dev/workflow-server/...` as owner=`dev`, repo=`workflow-server`, install-root=`~`, and emitting `~/worktrees/dev/workflow-server/<slug>/`. A path in no layout, under no root, on no host. See [poc-naming-conventions.md](poc-naming-conventions.md) D-8. | new defect |
| all path candidates | **Observed run failure.** [#272 close-out](../2026-07-22-work-package-run-retrospective-friction-points/COMPLETE.md), Observations: *"incomplete bag mirroring (`variables` mostly empty in inspect) forced path reconstruction from planning folder"* — and Recommendation 2 (High): *"Require session bag path vars (`target_path`, `workflow_branch`, planning artifact paths) to land via `variables_changed` so resume does not rely on tribal path memory."* Path arithmetic was re-derived from prose mid-run, which is exactly the failure a script's structured `outputs` prevents. | observed drift |
| `meta::detect-repo-type` / `select-target-component` (M-13, S-11) | **Variable-name collision across workflows.** `meta` uses `target_path` for the *repo or submodule* path (`.` for a regular repo); `work-package`'s root `TECHNIQUE.md` declares `target_path` as "the work package's target submodule **worktree**". Same bag name, two meanings, resolved by exact string match per §7.4. A script that emits `target_path` must know which workflow it is serving. | diverged duplicate |
| `write-artifact` (M-1) | **Enforcement finding on a sibling rule.** [08-enforcement-findings.md](../2026-07-22-work-package-run-retrospective-friction-points/08-enforcement-findings.md) E-1: *"Text-only: `target_path` MUST be a working git tree"* — fixed by adding a `validate` action. The same "text-only rule, no mechanism" pattern governs `write-artifact`'s mint-attempt guard, which is a race-sensitive re-scan expressed as prose. | text-only invariant |
| `verify-artifact-conforms` (M-2) | Six named violation classes, each restated in the technique and in the group `TECHNIQUE.md` canonical-home map. No *diverged* copy found yet — but two copies of a six-class taxonomy is a drift generator. | duplicated, not yet diverged |
| `sync-progress-status` (M-5) | Policy split across four anchors of an 11,958-char resource (`Status transition policy`, `Matching`, `Status column`, `Icon key`) plus `preserve-seed-na` on the technique and `preserve-unrelated-rows` beside it. The #272 close-out records a *duplicate* README-progress activity rule that had to be removed (F-1, "Workflow rules (activity partition) 1 → 0"). | observed drift, one copy already removed |
| `update-repo-submodules` (M-11) | None found. The flock/skip-if-recent design is sound prose; the risk is silent non-compliance, not divergence. | none found |
| `artifact-commits` (M-12) | None found. | none found |
| `create-worktree` (S-1) | None found — its idempotency probe is the corpus's best-specified deterministic block and the model the contract's re-entry section is built on. | none found |
| `repo-root-resolution` / `project-type-detection` (M-8, M-9) | None found. | none found |
| `render-token-usage` (M-6) | None found. Its `no-fabrication` rule is a text-only invariant that a script satisfies structurally (absent `usage` → exit 3, no artifact). | none found |

### 6.3 Permission and invocation posture

Scored against the shape the contract specifies — `python3 {script_root}/wp.py <sub> --flag=value`.

| Property | Score | Note |
|---|---|---|
| Stable static prefix | **pass** | `python3 <abs>/wp.py` is invariant across every subcommand and every session on a host. |
| Allowlistable as one rule | **pass** | A single `Bash(python3 /path/to/wp.py:*)` covers all 15+ mechanised steps. Compare: the prose these replace issue `git`, `gh`, `flock`, `stat`, `touch`, `find`, and `Read`/`Write` calls, each needing its own rule. Mechanisation **reduces** the allowlist surface. |
| No command substitution / expansion | **pass** | All values arrive as literal `--flag=value` arguments. No `$(...)`, no `${VAR}`, no backslash continuations — the exact constructs this repo's own agent guidance calls out as non-bypassable prompt triggers. |
| Interpreter-eval hooks | **pass** | A script *file* invocation, not `python3 -c`. Inline-eval is what harness hooks intercept; a file path is not. |
| Argument-length risk | **watch** | `--issue-title` and `--artifact-content` can be long. Content-bearing arguments must go via `--content-file=` (agent writes with its own Write tool), never as an argv blob. Specified in the contract. |
| Net posture | **better than the prose** | One allowlist rule replacing six-plus command families, with no dynamic-shell constructs anywhere. |

## 7. Do not mechanise

| Entry | Reason |
|---|---|
| `dco-provenance::record-attestation` | **Checkpoint-gated human decision.** The protocol already forbids synthesising the attestation before the human selects `certify`/`flag-legal`. Mechanising the append would put a script between a human and a legal attestation. |
| All 15 `atlassian-operations::*` ops | **Authenticated network**, and already thin MCP-tool wrappers (164–732 chars). |
| All 7 `github-cli-protocol::*` ops | **Authenticated network**, already thin `gh` wrappers (201–1,398 chars). |
| `manage-git::detect-merge-strategy` | **Authenticated network** — its substance is one `gh api repos/{owner_repo}` call. |
| `gitnexus-operations::*`, `cargo-operations::*` | Already single tool/CLI invocations owned by their own protocol groups; `validate-build`'s `no-cargo-here` rule exists to keep that boundary. |
| `version-control::identify-path-type` | **Net-negative on tokens** — 414 chars, one command, one comparison. |
| `manage-git::instruct-merge-strategy` | **Net-negative** — the output is human guidance text; only the branch is mechanical. |
| `manage-git::{push-commits, sync-branch}` standalone | **Net-negative individually.** Absorb the probe halves into `wp git-state` (§6.1) instead of scripting each. |
| `finalize-documentation::finalize-test-plan` (S-14) | **Insufficient evidence.** "Link each test case to its actual source location" — I could not establish that candidate-site matching is decidable without reading the tests. Left separable-but-deferred. |
| `strategic-review::resign-commits` (S-10) | **Insufficient evidence + high blast radius.** A scripted history rewrite with `--force-with-lease` is the one candidate where a wrong answer is expensive and hard to reverse. Confidence low; defer past every other batch. |
| A server-side execution locus for anything | **Server-side-only, and foreclosed.** Re-confirmed at tip: no `child_process`/`spawn` anywhere in `src/`, the image installs no `git`, `HOME` is forced to the state dir with four binds, and container paths ≠ host paths (the container→host translation layer that would soften the last point is itself uncommitted — see [contract §2](invocation-contract.md)). No candidate in this ledger is *only* viable server-side; every one runs where the credentials and the real paths are, which is the host. |
| Anything reachable only by holding `session.json` open | Not a candidate class in the end — `session.json` is a readable file at a known path (see §1 tightening 2), so `render-token-usage` moved *out* of this list during the sweep. Recorded because the exclusion was expected and did not survive. |

## 8. Goals served and sacrificed, per class

| Class | Serves | Sacrifices |
|---|---|---|
| Pure computation (M-3, M-10, M-15) | **Fidelity** (one answer, not four) · **drift** (one source, testable) | **Tokens and speed** — adds a tool call where there was none. **Auditability of reasoning** — the derivation stops appearing in the transcript, so a wrong answer is less visible to a reading human. |
| Read-only probes (M-2, M-4, M-8, M-9, M-13, M-14) | **Speed** (biggest call-loop wins) · **fidelity** (no skipped file in a 30-file sweep) | **Adaptability** — a probe that meets an unexpected repo shape must exit 3 rather than improvise, so some runs that previously muddled through now stop and ask. |
| Filesystem mutation (M-1, M-5, M-6, M-7, S-4) | **Fidelity** (mint-attempt guard and status-transition policy become enforced, not advised) · **drift** (policy leaves the resource prose) | **Transparency** — the agent no longer reads the policy it is applying, so the resource's anchors become documentation-for-humans only, and a policy change must ship as a script change. |
| Git mutation (M-11, M-12, S-1, S-7, S-8, S-13) | **Fidelity** (concurrency control actually happens) · **speed** | **Reversibility** — the highest-consequence class. Every one needs `--dry-run` before it needs anything else. |

## 9. Ledger summary

| Class | Count | Delivered chars/run | Share of technique volume |
|---|---:|---:|---:|
| Fully mechanisable | 15 | ~62,000 | 8 % |
| Separable | 14 | ~50,000 | 7 % |
| Irreducibly agentic | 76 | ~630,000 | 85 % |

The honest shape of the opportunity: **mechanisation is a fidelity and drift programme with a
speed dividend, not a token programme.** The token budget lives in the assumption-review and
analyse–challenge loops, which are judgement all the way down.
