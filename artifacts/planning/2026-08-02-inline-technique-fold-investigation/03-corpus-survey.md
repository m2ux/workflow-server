# Corpus survey — how techniques reference other techniques inline today

> Investigation record · 2026-08-02 · Repo state: main checkout (pre-merge of PR #385). 554 technique `.md` files across 16 workflows (`meta` 136, `work-package` 113, `cicd-pipeline-security-audit` 50, `workflow-design` 39, `prism` 36, …). 313 files contain at least one relative `.md` link; most links point at **resources** (540 occurrences) rather than **techniques** (280).

## Form inventory

| # | Form | Files | Occurrences | Notes |
|---|---|---|---|---|
| A | Canonical qualified pair `[group](…/TECHNIQUE.md)::[op](…/op.md)` | **56** | **113** | The sanctioned AP-51 form. Server resolves it to `group::op` — but only at activity bind sites. |
| B | Bare link, no group prefix — `Apply [op](./op.md)` | **37** | **54** | Used almost exclusively for *sibling ops inside the same group* (`meta/gitnexus-operations`, `meta/workflow-engine`, `meta/version-control`, `meta/atlassian-operations`). |
| C | Non-`Apply` verb + technique link (`Load`/`Use`/`Follow`/`See`/`Honor`/`Dispatch`) | 6 | 9 | Overall verb distribution before any `.md` link: `Apply` 51, `Load` 17, `Use` 15, `Honor` 6, `Dispatch` 6, `Follow` 4. |
| D | Cross-workflow technique links (link resolves into a different workflow dir) | **76** | **279** | 69 files link into `meta/techniques/**` specifically. |
| E | Plain-prose "the X technique" | 22 | 25 | Mostly generic ("the full technique", "the bound technique"); only ~4 name a real callee. |
| F | Bare `group::op` in text, **not** a hyperlink | 42 files / 87 `::` tokens | 58 bare + 29 inside link labels | Mostly README tables, Input descriptions, and the workflow-design idiom (H). |
| G | Technique link **inside an `## Inputs`/`## Outputs` section** | 7 | 10 | Direct `technique-ref-in-io-contract` violations (see drift #4). |
| H | Deferred "via the calling activity's bound `group::op` step" | **18** (all `workflow-design`) | 19 | The canon-conformant alternative — names the callee but routes execution to the activity layer. |

**`Apply <family>::<op>` as a bare, unlinked invocation is essentially not in use.** Exactly one line in the tree mixes the label-with-`::` style into an `Apply`: `workflows/work-package/techniques/finalize-documentation/revise-session-metrics.md:32`.

Forms A/B are *form-correct* (AP-51 mandates the hyperlink shape) but *layer-incorrect* whenever they invoke for work (AP-114). Form H is the compliant pattern, and only `workflow-design` uses it.

## Representative examples

### 1. Façade pointer, cross-workflow, own protocol step

- **Caller:** `workflows/work-package/techniques/finalize-documentation/revise-session-metrics.md`
- **Callee:** `workflows/meta/techniques/workflow-engine/revise-session-metrics.md`
- **Quote (line 32, the entire Protocol's first bullet):** `- Apply [workflow-engine::revise-session-metrics](../../../meta/techniques/workflow-engine/revise-session-metrics.md) with {planning_folder_path} and optional {trace_tokens}.`
- **Contract:** *Re-stated and lossy.* The caller redeclares `planning_folder_path`, `trace_tokens`, `token_usage_document`, `session_trace_document` — but **drops the callee's `client_session_index` input** entirely, and its `after-client-exit` Rule is a reworded duplicate of the callee's Rule of the same name.
- **Position:** It *is* the whole protocol. Textbook AP-114 façade: Capability line 8 openly calls itself "Client-side pointer".

### 2. Cross-workflow qualified pair, mid-step inside a larger produce path

- **Caller:** `workflows/work-package/techniques/implement-task.md`
- **Callees:** `meta/techniques/gitnexus-operations/{impact,context,detect-changes}.md`
- **Quote (lines 42-43):** `- Apply [gitnexus-operations](../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[impact](../../meta/techniques/gitnexus-operations/impact.md)(target: {target_symbol}, direction: upstream) before any edit` / `- Read the resulting impact_report; if HIGH or CRITICAL risk, surface it to the user before proceeding`
- **Contract:** *Respected but partly duplicated.* Argument names `target` / `direction` match `impact.md`'s Inputs exactly. But line 43 restates the callee's own Protocol §3 in intent (`impact.md:49`). Minor form drift: the callee output is written bare as `impact_report`, not `{impact_report}`.
- **Position:** Mid-protocol — Phase 2 "Pre Edit Impact Check" and Phase 5 "Post Edit Verification". Line 56 also uses a fourth hybrid form: `Apply the [task-completion-review](../techniques/task-completion-review.md) technique`.

### 3. Sibling bare link, own numbered step, full contract fidelity

- **Caller:** `workflows/meta/techniques/version-control/commit-regular-files.md`
- **Callee:** `workflows/meta/techniques/version-control/push-branch.md`
- **Quote (line 29, protocol step 4):** `4. Apply [push-branch](./push-branch.md) with repo_path = the parent-repo working tree (.), {branch}, and remote_name origin. …`
- **Contract:** *Inputs fully respected* — all three of `repo_path`, `branch`, `remote_name` named by their exact declared ids. *Output ignored* — `push-branch` emits `{pushed_branch}`, which the caller never captures, and `commit-regular-files` declares no `## Outputs` section at all.
- **Position:** Its own terminal protocol step. Reverse coupling at line 27: the callee-side file names *its* caller (`commit-and-persist`) to gate behavior.

### 4. Triple-segment cross-workflow, buried mid-bullet

- **Caller:** `workflows/codebase-wiki/techniques/query.md`
- **Callees:** `work-package/techniques/manage-artifacts/write-artifact.md` and `codebase-wiki/techniques/maintain-index-log.md`
- **Quote (line 58, the whole of Protocol §4):** writes the answer "via [`work-package::manage-artifacts::write-artifact`](../../work-package/techniques/manage-artifacts/write-artifact.md) into {wiki_path}, then apply [maintain-index-log](./maintain-index-log.md) …"
- **Contract:** *Ignored on both ends.* `write-artifact` requires `bare_filename` and `artifact_content` — neither is mentioned; only `target_dir` is implied. `maintain-index-log` requires `mutated_pages` and `operation_summary` — neither appears. Uses a `::`-in-label form that differs from the canonical pair used elsewhere.
- **Position:** Mid-sentence, two callees chained inside one bullet.

### 5. Explicitly non-invoking cross-workflow documentation reference (the good case)

- **Caller:** `workflows/prism-evaluate/techniques/plan-evaluation/survey-target.md`
- **Callee:** `workflows/prism/techniques/plan-analysis.md`
- **Quote (line 28):** "apply the structure survey defined in prism's [plan-analysis](../../../prism/techniques/plan-analysis.md) technique — build-system detection, module/package enumeration, per-module LOC, test-directory location, and the GitNexus functional-area/community-cluster survey … That method lives in plan-analysis and is not restated here, so both workflows survey code identically."
- **Contract:** *Ignored — deliberately.* `plan-analysis` requires `{target}`; the caller substitutes its own `{target_path}` and self-declares that it borrows only a *sub-procedure*, not the op. A partial-technique reference with no I/O handshake at all. (See drift #2 — the "not restated" claim is falsified by the sentence itself.)

### 6. Rule (not op) referenced via the op syntax — three spellings in one group

- `meta/techniques/version-control/detect-repo-type.md:29` — `apply [version-control](./TECHNIQUE.md)::infrastructure-submodule-paths.`
- `meta/techniques/version-control/list-submodules.md:25` — same `::` form.
- `meta/techniques/version-control/resolve-host-repo.md:41` — `apply version-control.infrastructure-submodule-paths` (dotted, unlinked).

The target is a **Rule** at `meta/techniques/version-control/TECHNIQUE.md:36`, not an operation. Two files address it with the `::` op syntax (violating `dotted-rule-address`); one uses the dotted rule address with no link. Neither `Apply` is an invocation.

## Activity-layer visibility

Every `Apply`+link edge in the tree was resolved to a canonical `group::op` id and checked against all `technique:` / `name:` binds in that workflow's `activities/*.yaml` and `workflow.yaml`.

**118 unique caller→callee Apply edges. 19 are also bound at the activity layer. 99 (84%) are invisible — the agent discovers them only by reading the caller's prose.**

Detailed checks:

- **`work-package::implement-task`** — bound at `workflows/work-package/activities/08-implement.yaml:23-24`. That activity's `techniques: [scatter-gather]` and its loop steps bind `cargo-operations::test`, `manage-git::artifact-commits`, `dco-provenance::append-task-row`, `task-completion-review`, `review-assumptions::collect`. **`gitnexus-operations::impact` and `::context` appear nowhere** — not in `techniques[]`, not as steps. (`detect-changes` is bound, but in a *different* activity: `10-post-impl-review.yaml:14`.) The pre-edit safety check that `implement-task` mandates is invisible to the orchestration layer.
- **`work-package::finalize-documentation::revise-session-metrics`** — grep of every `*.yaml` in the repo returns exactly one hit: `meta/activities/04-end-workflow.yaml:12`, binding the **meta** op. The work-package façade file is bound by **no activity anywhere**. It is a dead pointer whose only function is to be read.
- **`codebase-wiki::query`** — `02-build-wiki.yaml` correctly binds `ingest` and `maintain-index-log` as *separate consecutive steps* (the canon-conformant pattern), and `04-publish.yaml:27` binds `work-package::manage-artifacts::write-artifact` directly. But `query` itself is bound by **no activity in any workflow** (`codebase-wiki/workflow.yaml:5` claims "other workflows bind [it] via `codebase-wiki/<op>`" — none do), and `cross-link` — Applied from `codebase-wiki/techniques/ingest.md:73` — is likewise bound nowhere. Both callees are reachable only through prose.
- **`prism-evaluate::plan-evaluation::survey-target`** — bound at `prism-evaluate/activities/01-dimension-planning.yaml:8`. `prism::plan-analysis` is in a different workflow and is bound by no prism-evaluate activity.

## Drift instances

**No dangling technique links.** All relative `.md` link targets in all 554 technique files resolve: 3 apparent misses are false positives (artifact-template text in `prism-audit/techniques/audit-finalize/split-report.md:32`, illustrative placeholders in `prism/techniques/present-result.md:41`). The rot is in the **contract**, not the paths.

1. **Callee input dropped by a façade caller** — `work-package/techniques/finalize-documentation/revise-session-metrics.md`. Callee declares three inputs (`planning_folder_path`, `client_session_index`, `trace_tokens`); the caller's Inputs section has only two and the Apply line passes only two. `client_session_index` — "Client session index when the durable history lives on a child session" — is exactly the value a *client-side* caller would need to supply, and it is silently absent.
2. **Restated procedure that no longer matches the source** — `prism-evaluate/techniques/plan-evaluation/survey-target.md:28` enumerates the borrowed method as including "test-directory location". `prism/techniques/plan-analysis.md` §"Record per-module" (lines 108-119) records *path, file count, estimated lines, primary language, role, risk* — there is **no test-directory detection anywhere in the file**. The sentence's own claim, "That method lives in plan-analysis and is not restated here," is falsified by the clause preceding it.
3. **Duplicated callee obligations at the call site** — `implement-task.md:43` restates `impact.md:49`; `finalize-documentation/revise-session-metrics.md:37-39` (Rule `after-client-exit`) restates the meta callee's rules of the same names; the "mid-`complete` draft is not authoritative" paragraph is written in four separate homes (`render-token-usage.md:8`, `:54`; `conduct-retrospective/retrospective.md:56`; `resources/session-trace.md:41`).
4. **Technique links inside `## Inputs` / `## Outputs`** — 7 files, 10 occurrences (`technique-ref-in-io-contract`): `cicd-pipeline-security-audit/techniques/dispatch-scanners/collect-results.md:14`, `verify-dispatch-completeness.md:14`, `substrate-node-security-audit/techniques/dispatch-sub-agents/collect-results.md:14`, `substrate-node-security-audit/techniques/map-vulnerability-domains.md:16`, `work-package/techniques/repo-root-resolution.md:14`, `meta/techniques/workflow-engine/finalize-activity.md:44` (Outputs), `work-package/techniques/manage-artifacts/write-artifact.md:14`.
5. **Systematic contract-silence at Apply sites** — 56 Apply call sites name *some* arguments but omit at least one **required** (non-optional) callee input. Heaviest cluster: `meta/techniques/workflow-engine/` — `commit-and-persist.md` (5 sites), `dispatch-activity.md` (5), `workflow-orchestrator.md` (3), `finalize-activity.md` (3). E.g. `dispatch-activity.md:44` says "Apply [compose-prompt](./compose-prompt.md) with `{agent_technique}` and `{state}` as substitutions" while the callee declares its second input as `substitutions`, not `state`; and every `sync-progress-status` call site omits `seed_profile`.
6. **Form inconsistency for the same referent** — `infrastructure-submodule-paths` addressed three ways across one group (example 6); `gitnexus-operations::verify-index` written bare in `prism-evaluate/.../survey-target.md:28` and fully hyperlinked in `prism/techniques/plan-analysis.md:109`; `write-artifact` written as a link-label `::` chain, as a canonical pair, and as the deferred bound-step idiom in different files.
