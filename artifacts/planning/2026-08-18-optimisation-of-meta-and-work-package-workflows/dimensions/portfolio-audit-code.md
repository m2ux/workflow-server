---
Subject: Registration gaps between what the workflow-server computes and what its two largest workflows execute as prose
Target: /home/mike1/projects/dev/workflow-server
Evaluation Date: 2026-08-18
Lens: audit-code (34)
Dimension: Mechanisation Potential
Scope: 18 registered MCP tools in src/tools/ (2,929 LOC); 28 registry guards in scripts/ (5,374 LOC across check-*.ts and validate-*.ts); the 116,993 words of definition prose in workflows/meta (297,551 bytes) and workflows/work-package (634,102 bytes); the delivery-cost gate added to .github/workflows/verify.yml since the prior evaluation
---

# Registration Gaps in the Mechanisation Surface

## Core finding

The server never shells out. `grep -rn "child_process\|execFile\|spawn(\|execSync" src/ --include=*.ts` returns nothing across all 55 files and 12,628 lines. That single fact settles the shape of every mechanisation question in this repository: no registered tool can run git, run a guard, or read the target repository's working tree, because the process has no mechanism to do so. The 18 tools are session control-plane not by convention but by construction.

Against that, the 28 guards hold 5,374 lines of tested code that computes exactly the properties the definitions ask an agent to re-derive — and every one of them is reachable only as a repository CI step. Between the two sits a hand-maintained restatement layer: three technique files in two workflows name 15 guards in prose, 3 of those 15 restatements have already drifted from the registry line they copy, and one states an argument contract that both named scripts contradict.

The prior evaluation predicted that eleven of twelve mechanisation savings would sit below the instruments' resolution. A delivery-cost gate now exists and runs on every pull request. Measured against it: the gate's resolution floor is **13,023 characters**, and the largest surviving candidate's measurable delivery footprint is **4,097 characters** — 3.2 times below the floor. The prediction holds, and it now has a number rather than an estimate.

## Method

Every count below was taken by direct enumeration against the working tree at `workflows@2e8b6297`. Delivery figures come from a live run of `scripts/run-token-benchmark.ts --label=audit --context-mode=fresh`, which walked work-package end to end and recorded 1,302,321 delivery characters over 162 `get_resource` calls, 24 `get_technique` calls, 12 `get_activity` calls and 1 `get_workflow` call. Per-resource and per-technique character counts are read from that run's `Resource delivery cost` and `Technique delivery cost` events, not estimated from file sizes.

---

# Step 1 — Surface Enumeration

Eleven surfaces declare, dispatch, document or measure the mechanisation capability of this system. They are enumerated independently. Two of them look like the same surface and are not: the guard registry declares what a guard *is*, while each guard's own usage docstring declares what its command line *accepts*, and those two have drifted apart in four places.

## S1 — MCP tool registration (`src/tools/`)

Eighteen registrations across two files. Sixteen use `server.tool(name, description, schema, handler)`; two use `server.registerTool(name, {description, inputSchema}, handler)`.

| # | Tool | Site | Plane |
|---|------|------|-------|
| 1 | `discover` | `src/tools/workflow-tools.ts:387` | control — server info and bootstrap procedure |
| 2 | `list_workflows` | `src/tools/workflow-tools.ts:405` | control — corpus catalogue |
| 3 | `get_workflow` | `src/tools/workflow-tools.ts:413` | control — session workflow bundle |
| 4 | `next_activity` | `src/tools/workflow-tools.ts:517` | control — advance the session pointer |
| 5 | `get_activity` | `src/tools/workflow-tools.ts:792` | control — deliver the current activity |
| 6 | `yield_checkpoint` | `src/tools/workflow-tools.ts:1375` | control — mark a checkpoint active |
| 7 | `record_usage` | `src/tools/workflow-tools.ts:1475` | control — write a token-usage row |
| 8 | `resume_checkpoint` | `src/tools/workflow-tools.ts:1524` | control — continue after resolution |
| 9 | `present_checkpoint` | `src/tools/workflow-tools.ts:1553` | control — read `state.activeCheckpoint` |
| 10 | `respond_checkpoint` | `src/tools/workflow-tools.ts:1588` | control — apply a checkpoint option's effects |
| 11 | `get_trace` | `src/tools/workflow-tools.ts:1759` | control — session execution trace |
| 12 | `health_check` | `src/tools/workflow-tools.ts:1810` | control — server status |
| 13 | `get_workflow_status` | `src/tools/workflow-tools.ts:1826` | control — session progress projection |
| 14 | `inspect_session` | `src/tools/workflow-tools.ts:1907` | control — read-only session projection |
| 15 | `start_session` | `src/tools/resource-tools.ts:102` | control — open or resume a session |
| 16 | `dispatch_child` | `src/tools/resource-tools.ts:446` | control — open a child session |
| 17 | `get_technique` | `src/tools/resource-tools.ts:631` | control — deliver one composed technique |
| 18 | `get_resource` | `src/tools/resource-tools.ts:865` | control — deliver one resource or section |

All eighteen are session control-plane. The classification is not a judgement: every handler's inputs are `session_index`, an identifier into the corpus, or a delivery-mode flag, and every handler's effect is confined to reading the corpus, reading or writing `session.json`, or creating a directory under the planning root. The only filesystem writes in `src/` are `src/utils/session/store.ts` (session file, atomic `open` + `writeFile` + `rename` at lines 214–227; planning-folder `mkdir` at 333, 674, 699) and `src/utils/session/crypto.ts` (the session key). None of the eighteen reads a target repository, evaluates a domain rule, or returns a computed answer about the work being done.

One near-miss is worth recording because it changes the build economics for every candidate below. `src/tools/workflow-tools.ts:18` now imports `bothGates`, `gateAnswer` and `variablesWrittenIn` from `src/utils/gate-liveness.ts`, and the delivery path uses them: the audited walk recorded `lazy_gate_unanswered: 21, lazy_gate_false: 0, bundled_steps: 11` on the first activity. The prior evaluation's central complaint — that the server holds the variable bag, ships two working condition evaluators, and imports neither from `src/tools/` — is no longer true. A tool that computes a decision from bag state now has precedent in the file it would be added to.

## S2 — Hand-maintained tool documentation (`docs/api-reference.md`)

Seventeen tool rows. `record_usage` has no row. It appears nowhere in `docs/api-reference.md`; its only prose mention anywhere in `docs/` is a passing reference at `docs/dispatch_model.md:115`.

## S3 — Generated tool documentation (`site/api/tools.html`)

Eighteen `<section class="tool" id="...">` blocks, one per registered tool, `record_usage` at line 450. This surface is generated by `scripts/generate-site-data.ts:774` and carries its own drift assertion at line 641 ("Tool/group drift — update TOOL_GROUPS in scripts/generate-site-data.ts"). It is machine-synchronised with S1 and stays correct.

## S4 — Guard scripts on disk (`scripts/`)

Thirty script files bear on the guard suite: 28 matching `check-*.ts` (5,524 LOC) plus `validate-activities.ts` (149 LOC) and `validate-workflow-yaml.ts` (196 LOC). Two of the 28 are runners, not guards: `check-all.ts` (145 LOC) and `check-delta.ts` (350 LOC). So the guard population is 26 check scripts plus 2 validators — 28 guards, 5,374 LOC — sitting behind 495 LOC of runner and 113 LOC of `guard-protocol.ts`.

## S5 — The guard registry (`scripts/guards.ts`)

Twenty-eight `GuardSpec` entries, 257 LOC. Each carries `id`, `script`, `npmScript`, `scope`, an optional `json` flag and a one-line `proves` string. Twenty-five are `scope: 'corpus'`; three are `scope: 'repo'` (`site-links`, `svg-layout`, `source-encoding`).

| Guard id | Script | Scope | Registry `json` | Proves |
|---|---|---|---|---|
| binding-fidelity | check-binding-fidelity.ts | corpus | yes | bindings resolve, args conform, reads have producers, outputs have consumers |
| inherited-inputs | check-inherited-inputs.ts | corpus | no | no technique redeclares an input a container contract merges in |
| section-framing | check-section-framing.ts | corpus | no | no resource strands prose above its first section |
| identifier-qualification | check-identifier-qualification.ts | corpus | yes | every technique I/O id is a qualified noun phrase |
| review-mode-gating | check-review-mode-gating.ts | corpus | yes | no review-reachable checkpoint auto-advances into unapproved mutating work |
| audience | check-audience.ts | corpus | yes | every artifact declares who reads it; agent-audience artifacts are JSON |
| artifact-guides | check-artifact-guides.ts | corpus | yes | every persisted artifact filename maps to a creation guide |
| description-hygiene | check-description-hygiene.ts | corpus | yes | activity descriptions stay WHAT-only; bound steps carry no description/name |
| checkpoint-entry | check-checkpoint-entry.ts | corpus | yes | no activity opens with a checkpoint |
| decision-order | check-decision-order.ts | corpus | yes | no checkpoint decides a value an earlier step is already gated on |
| bootstrap-self-contained | check-bootstrap-self-contained.ts | corpus | yes | pre-session text sends the reader nowhere it cannot go |
| set-action-values | check-set-action-values.ts | corpus | yes | every set action names where it writes |
| harness-adapter-set | check-harness-adapter-set.ts | corpus | yes | every harness kind resolves to an adapter exposing the operations callers ask for |
| self-provisioned-input | check-self-provisioned-input.ts | corpus | no | no step interpolates its own set target into its technique inputs |
| activity-technique-overlap | check-activity-technique-overlap.ts | corpus | no | activity techniques[] and step bindings stay disjoint |
| prism-lens-reachability | check-prism-lens-reachability.ts | corpus | no | every prism lens is goal-routable or pipeline-internal |
| resource-anchors | check-resource-anchors.ts | corpus | no | every relative .md#anchor link resolves; every fence closes |
| technique-template | check-technique-template.ts | corpus | no | every technique follows the normative template, artifact bodies included |
| variable-model | check-variable-model.ts | corpus | no | defaults, gates and setVariable effects are coherent with the seeded model |
| fragments | check-fragments.ts | corpus | no | every checkpoint fragment ref resolves, is used, is not inlined twice |
| stealth-isolation | check-stealth-isolation.ts | corpus | no | no static leakage path out of a stealth-mode workflow |
| when-expression | check-when-expression.ts | corpus | no | every when: gate parses, and mixed and-or at one depth is parenthesized |
| refs | check-all-refs.ts | corpus | no | every techniques[] reference resolves through the loader |
| activities | validate-activities.ts | corpus | no | every activity file validates against the activity schema |
| workflow-yaml | validate-workflow-yaml.ts | corpus | no | every workflow.yaml validates against the workflow schema |
| site-links | check-site-links.ts | repo | no | every internal site href/src and anchor resolves |
| svg-layout | check-svg-layout.ts | repo | no | site SVG diagrams stay within their geometric bounds |
| source-encoding | check-source-encoding.ts | repo | yes | no text source carries a literal control character |

## S6 — npm script surface (`package.json`)

Thirty `check:*` entries. Twenty-eight map one-to-one onto registry ids; two are the runners (`check:all`, `check:delta`). Every registry entry's `npmScript` field resolves to a real script that invokes the declared path. No entry is `null`. This surface is clean.

## S7 — Continuous integration (`.github/workflows/verify.yml`)

Four verification steps: `npm run typecheck` (line 62), `npm run test:ci` (line 67), `npm run check:all` (line 72), `npm run --silent bench:token -- --label=ci --context-mode=fresh --gate` (line 83). The guard sweep walks the registry, so a new registry entry is enforced without editing this file. The delivery-cost gate at line 83 is new since the prior evaluation and closes RED-01.

## S8 — Guard usage docstrings (the `Run:` line in each script)

Each guard declares its own command line in a header comment. This is the surface an author reads when writing a protocol step that invokes the guard, and it is independent of S5: the registry says what a guard proves, the docstring says what it accepts.

Twenty-five corpus guards accept `--root`, either through `requireWorkflowsRoot` / `requireRootOrExit` (17 guards) or through `resolveWorkflowsRoot` (8 guards). Four omit `--root` from their own `Run:` line while implementing it: `check-self-provisioned-input.ts:20`, `check-activity-technique-overlap.ts:14`, `check-when-expression.ts:8`, `check-resource-anchors.ts:17`.

## S9 — Workflow protocol prose invoking repository scripts

Six invocation lines, three files, three workflows. Across the 262 technique files of meta and work-package: zero.

| Site | Invokes |
|---|---|
| `workflows/workflow-design/techniques/yaml-authoring.md:52` | validate-workflow-yaml.ts |
| `workflows/workflow-design/techniques/audit-schema-validation.md:24` | validate-workflow-yaml.ts (positional) |
| `workflows/workflow-design/techniques/audit-schema-validation.md:30` | check-all-refs.ts `--root` |
| `workflows/workflow-design/techniques/audit-schema-validation.md:35` | check-binding-fidelity.ts `--root` |
| `workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:22` | validate-workflow-yaml.ts (positional) |
| `workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:23` | validate-activities.ts (positional) |

The workflow-authoring file additionally names 13 further guards in a bulleted block (lines 25–37) under a blanket "The remaining guards each take `--root {target_path}`". Fifteen of the 28 registry guards are named there in total.

## S10 — Workflow protocol prose invoking MCP tools

Eleven of the 30 files in `workflows/meta/techniques/workflow-engine/` name a registered tool call in their protocol: `continue-batch.md`, `create-session.md`, `dispatch-activity.md`, `handle-sub-workflow.md`, `list-workflows.md`, `present-checkpoint-to-user.md`, `respond-checkpoint.md`, `resume-from-checkpoint.md`, `start-session.md`, `workflow-orchestrator.md`, `yield-checkpoint.md`. The thinnest is `list-workflows.md`, 273 bytes, whose entire Protocol is "Call `list_workflows` and return its result as the `{workflow_catalog}`."

This surface is the mirror of S9. The corpus wraps the control plane in prose seven times over while invoking the domain plane not once, because the control plane is the only thing there is a tool to call.

## S11 — Instrument coverage (the delivery-cost gate's walk)

The gate walks one workflow. `scripts/run-token-benchmark.ts` defaults `--workflow` to `work-package`, and the CI line at `verify.yml:83` does not override it. The recorded path is twelve activities of work-package. The `meta` tree — 150 technique files, 297,551 bytes, the entire orchestration spine — is delivered by no gated walk. Its resource sections reach the gated walk only where a work-package technique links them: the audited run fetched `meta/planning-readme#template`, `#rules`, `#status-vocabulary`, `#status-transition-policy` and `meta/writing-register`, and nothing else from meta's resource set.

---

# Step 2 — Cross-Reference Matrix

## Matrix A — the 18 tools across their declaration surfaces

| Tool | S1 registration | S2 `docs/api-reference.md` | S3 `site/api/tools.html` |
|---|---|---|---|
| discover | workflow-tools.ts:387 | present | present |
| list_workflows | workflow-tools.ts:405 | present | present |
| get_workflow | workflow-tools.ts:413 | present | present |
| next_activity | workflow-tools.ts:517 | present | present |
| get_activity | workflow-tools.ts:792 | present | present |
| yield_checkpoint | workflow-tools.ts:1375 | present | present |
| **record_usage** | **workflow-tools.ts:1475** | **MISSING** | **line 450** |
| resume_checkpoint | workflow-tools.ts:1524 | present | present |
| present_checkpoint | workflow-tools.ts:1553 | present | present |
| respond_checkpoint | workflow-tools.ts:1588 | present | present |
| get_trace | workflow-tools.ts:1759 | present | present |
| health_check | workflow-tools.ts:1810 | present | present |
| get_workflow_status | workflow-tools.ts:1826 | present | present |
| inspect_session | workflow-tools.ts:1907 | present | present |
| start_session | resource-tools.ts:102 | present | present |
| dispatch_child | resource-tools.ts:446 | present | present |
| get_technique | resource-tools.ts:631 | present | present |
| get_resource | resource-tools.ts:865 | present | present |

One gap: 17 of 18. The generated surface is complete; the hand-maintained one is not.

## Matrix B — the 28 guards across their declaration surfaces

Columns: registry entry (S5), npm script (S6), CI reach (S7 via `check:all`), `--json` in the registry versus the implementation (S5 against S4), `--root` in the implementation versus the guard's own usage line (S4 against S8), named in workflow prose (S9).

| Guard | S5 | S6 | S7 | Registry `json` | Implements protocol | `--root` impl | `--root` documented | Named in prose |
|---|---|---|---|---|---|---|---|---|
| binding-fidelity | yes | yes | yes | yes | yes | yes | yes | yes |
| inherited-inputs | yes | yes | yes | **no** | **yes** | yes | yes | no |
| section-framing | yes | yes | yes | no | no | yes | yes | no |
| identifier-qualification | yes | yes | yes | yes | yes | yes | yes | yes |
| review-mode-gating | yes | yes | yes | yes | yes | yes | yes | yes |
| audience | yes | yes | yes | yes | yes | yes | yes | yes |
| artifact-guides | yes | yes | yes | yes | yes | yes | yes | no |
| description-hygiene | yes | yes | yes | yes | yes | yes | yes | yes |
| checkpoint-entry | yes | yes | yes | yes | yes | yes | yes | no |
| decision-order | yes | yes | yes | yes | yes | yes | yes | no |
| bootstrap-self-contained | yes | yes | yes | yes | yes | yes | yes | no |
| set-action-values | yes | yes | yes | yes | yes | yes | yes | no |
| harness-adapter-set | yes | yes | yes | yes | yes | yes | yes | no |
| self-provisioned-input | yes | yes | yes | no | no | yes | **MISSING** | yes |
| activity-technique-overlap | yes | yes | yes | no | no | yes | **MISSING** | yes |
| prism-lens-reachability | yes | yes | yes | no | no | yes | yes | no |
| resource-anchors | yes | yes | yes | no | no | yes | **MISSING** | yes |
| technique-template | yes | yes | yes | no | no | yes | yes | yes |
| variable-model | yes | yes | yes | no | no | yes | yes | yes |
| fragments | yes | yes | yes | no | no | yes | yes | yes |
| stealth-isolation | yes | yes | yes | no | no | yes | yes | yes |
| when-expression | yes | yes | yes | no | no | yes | **MISSING** | no |
| refs | yes | yes | yes | **no** | **yes** | yes | yes | yes |
| activities | yes | yes | yes | no | no | yes | yes | **yes, contradicted** |
| workflow-yaml | yes | yes | yes | no | no | yes | yes | **yes, contradicted** |
| site-links | yes | yes | yes | no | no | n/a | n/a | no |
| svg-layout | yes | yes | yes | no | no | n/a | n/a | no |
| source-encoding | yes | yes | yes | yes | yes | n/a | n/a | no |

Registry-to-implementation agreement on the finding protocol: 26 of 28. Implementation-to-docstring agreement on `--root`: 21 of 25 corpus guards. Prose-to-implementation agreement on argument contract: 13 of 15 named guards.

## Matrix C — the 12 prior candidates against the corpus today

| ID | Prior location | Present at that location today | Change since 2026-08-17 |
|---|---|---|---|
| MECH-01 | corpus-wide | yes — 0 script invocations across 262 technique files | exemplar improved; a second exemplar workflow appeared |
| MECH-02 | `sync-progress-status.md:32,54` | yes — `delivered_artifact` still has exactly 2 corpus references, both inside the declaring file | none |
| MECH-03 | `naming-conventions.md:45` | **no — resolved** | table is now total over all five categories; a stop-and-report clause covers an unset category |
| MECH-04 | `sync-progress-status.md` + `planning-readme.md#status-transition-policy` | yes — 5-row write matrix, 3-row link table, per-status default all intact; resource unchanged at 15,690 bytes | none |
| MECH-05 | `write-artifact.md:46` | yes — step 4 mint-attempt guard verbatim | none |
| MECH-06 | `review-mode-detection.md:53-54` | yes — open enumeration, self-assessed ambiguity flag | none |
| MECH-07 | `verify-artifact-links.md:30,35` | yes — ref-relative resolution still unimplemented; anchor guard still anchor-only | `{artifact_publish_ref}` now has a producer (`resolve-artifact-publish.md:29`) and is a declared workflow variable (`work-package/workflow.yaml:399`) |
| MECH-08 | `three-dot-name-status.md:47-48` | yes — file unchanged at version 1.0.0 | none |
| MECH-09 | `verify-artifact-conforms.md:55-59` | yes — step 3 still fuses five corrections | none |
| MECH-10 | `select-target-component.md:46`, `create-worktree.md:30-33` | yes — both intact | none |
| MECH-11 | six technique files | yes — all six present, 7,378 bytes total | none |
| MECH-12 | `version-control/TECHNIQUE.md:40-42` | yes — three literal string tests | none |

Eleven of twelve survive. MECH-03 is closed.

---

# Step 3 — Gap Classification

## TRUE GAPs — capability shipped and not wired

### G1. Two guards speak the finding protocol; the registry says they do not

`scripts/check-all-refs.ts:14` and `scripts/check-inherited-inputs.ts:23` both import `runGuard` and a `Finding[]` collector from `guard-protocol.ts`, and both document `[--json]` in their usage lines. Their registry entries omit `json: true`.

The missing wire is two words. The consequence is at `scripts/check-delta.ts:156` and `:172`:

```
if (guard.json) args.push('--json');
...
if (guard.json) { try { findings = (JSON.parse(stdout) as { findings: Finding[] }).findings; } catch { findings = null; } }
```

The merge-base delta runner gives a per-finding delta only to guards the registry marks JSON. Two guards that can produce one are downgraded to line-diff comparison of human-readable stdout. The ratchet these guards get is coarser than the ratchet they were built for, and nothing reports the discrepancy because the registry is the only authority consulted.

**Wire:** add `json: true` to the `refs` and `inherited-inputs` entries in `scripts/guards.ts`. Add an assertion to the guard-registry test that a script importing `runGuard` carries `json: true`, so the class closes rather than the instances.

### G2. The workflow-authoring exemplar states an argument contract both named scripts contradict

`workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:19` reads:

> The two validators take a **positional** path and implement no `--root`

Both implement `--root`. `scripts/validate-workflow-yaml.ts:7` documents `--root /wt/workflows`, and line 117 calls `requireRootOrExit`. `scripts/validate-activities.ts:12` documents the same, and line 93 calls `requireRootOrExit` whenever no positional argument is given. `validate-activities.ts:16` records that it "used to accept a positional path only, which is why nothing in package.json invoked it" — the technique prose is describing the contract as it stood before that change.

This is the ECO-02 defect reappearing in the workflow that replaced the exemplar. The prior instance is fixed: `workflow-design/techniques/audit-schema-validation.md:30,35` now pass `--root` and explain the resolution order in the same bullet. The new instance is live, in a file whose own Capability line is "The repository's definition guards run against one target".

The functional cost is bounded but real: taking the positional path on `validate-activities.ts` bypasses `requireRootOrExit`, which is the check that refuses to report a pass against an unreachable or empty corpus.

**Wire:** correct two prose lines. Then build the guard that would have caught it — a check that every `npx tsx scripts/*.ts` invocation in corpus prose names a script that exists and passes flags the script's own argument parser accepts. Nothing in the 28-guard suite reads workflow prose for script invocations; `grep -rn "npx tsx" scripts/check-*.ts` returns only each script's own usage docstring.

### G3. Four guards implement `--root` and do not advertise it

`check-self-provisioned-input.ts:20`, `check-activity-technique-overlap.ts:14`, `check-when-expression.ts:8` and `check-resource-anchors.ts:17` each print a `Run:` line with no `--root`. All four resolve a root through `resolveWorkflowsRoot`, which reads `--root` from argv.

The module docstring of `scripts/workflows-root.ts` states the stakes precisely: without `--root`, "the guards would validate the stale main copy, not the change under review". Three of these four are named in the workflow-authoring guard block, which covers them with a blanket "The remaining guards each take `--root {target_path}`" — correct, but derived from the registry rather than from the guards, so the guard's own documentation and the workflow's instruction now disagree about the same command line.

**Wire:** four docstring lines.

### G4. The anchor guard reports a clean pass having inspected almost nothing

Pointed at a planning folder, `check-resource-anchors.ts` prints a pass regardless of what it did or did not check. Measured directly:

```
$ npx tsx scripts/check-resource-anchors.ts --root .../2026-08-17-meta-and-work-package-workflow-optimisation
resource-anchors: OK — every relative .md#anchor link resolves to a rendered heading, and every fence closes
```

That folder holds 19 markdown files carrying 1 anchored link and 25 unanchored ones. The guard validated the 1 and ignored the 25, and its output is indistinguishable from a folder with no links at all. Pointed at an unrelated scratch directory under `/tmp` — not a corpus, not a planning folder — it walked in and emitted a finding against whatever markdown it happened to contain. There is no root-shape validation of any kind.

Three defects compose here, and all three are in MECH-07's remedy list from the prior evaluation:

1. `check-resource-anchors.ts:116-117` — `const m = ANCHORED_RE.exec(destination); if (!m) continue;` skips every link without an anchor.
2. The guard calls `resolveWorkflowsRoot`, not `requireWorkflowsRoot`, and never calls `assertScanned`. It is one of 8 corpus guards in that state and one of 12 with no scanned-count assertion.
3. `check-resource-anchors.ts:126` — `if (relative(ROOT, targetPath).startsWith('..' + sep)) continue;` drops any target outside the root, which is every link from a planning folder into the checkout it documents.

Corpus-wide the unchecked population is measurable: across meta and work-package there are **358 anchored markdown links and 543 unanchored ones**, so 60.3% of relative markdown links are validated by nothing. In `docs/` the split is 17 anchored against 81 unanchored, and no guard points at `docs/` at all.

**Wire:** three edits to the guard — `requireWorkflowsRoot` plus `assertScanned`, a root shape that admits a planning folder, and a relaxation of the outside-root skip when the root is not a corpus. That is the cheap half of MECH-07 and it does not need a new tool.

### G5. `sync-progress-status` declares an input no call site can bind

Confirmed unchanged. `grep -rn "delivered_artifact" workflows/` returns exactly two hits, `sync-progress-status.md:32` (the declaration) and `:54` (the branch that reads it). Every one of the five prose call sites — `workflow-orchestrator.md:41`, `dispatch-activity.md:48,60,61`, `commit-and-persist.md:22` — passes some subset of `activity_id`, `planning_folder_path`, `target_status` and `mark_progress_na`, and none passes an artifact.

The unreachable branch is the documented policy row at `planning-readme.md`: "complete, deliverable landed elsewhere → repointed at the artifact that actually holds it". Because it never fires, a deliverable that landed elsewhere is marked complete with a link to a file that does not hold it — while the same resource states, four lines above, that "cancelled-with-a-link contradicts itself" and that status "tracks the deliverable, not the producer".

The binding is not a step-binding rename, because there are no step bindings to rename: `grep -rn "sync-progress-status" workflows/ --include=*.yaml` returns zero. The orchestration spine is invoked from prose only, which also puts it outside `check-binding-fidelity`'s reach.

**Wire:** add the argument to the `commit-and-persist.md:22` Apply, whose caller has just written an artifact.

## VISIBILITY GAPs — capability works and is not discoverable

### G6. `record_usage` is absent from the hand-maintained tool reference

Registered at `src/tools/workflow-tools.ts:1475`, rendered at `site/api/tools.html:450`, absent from the 17-row table in `docs/api-reference.md`. The tool whose entire purpose is making delivery cost measurable is the one tool missing from the document a reader consults to find out what the server can measure.

**Wire:** one table row. The durable fix is to generate that table from the same `TOOL_GROUPS` structure `scripts/generate-site-data.ts` already uses, which is why the site surface has stayed complete and this one has not.

### G7. Ten corpus guards are absent from the only workflow that runs guards

`workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md` names 15 of the 28 registry guards. Three of the 13 unnamed are `scope: 'repo'` and correctly excluded from a definition audit. The remaining ten are corpus guards a definition audit would want and does not get: `section-framing`, `inherited-inputs`, `checkpoint-entry`, `decision-order`, `bootstrap-self-contained`, `set-action-values`, `harness-adapter-set`, `prism-lens-reachability`, `artifact-guides`, `when-expression`.

Coverage of the corpus guard set from the authoring workflow: 15 of 25, 60%.

### G8. The prose restatements have already drifted from the registry lines they copy

Each of the 15 named guards carries a one-line description in the technique prose. Each also carries a `proves` line in `scripts/guards.ts`. Three pairs no longer say the same thing:

| Guard | Registry `proves` | Technique prose | Divergence |
|---|---|---|---|
| audience | every artifact declares who reads it, and every agent-audience artifact is JSON on disk | every output declaring an agent audience carries a machine-readable artifact name | prose drops the universal declaration requirement and the on-disk format requirement |
| review-mode-gating | no review-reachable checkpoint auto-advances into unapproved mutating work | review-reachable gates are resolvable without a person | different property entirely |
| technique-template | every technique file follows the normative template, artifact bodies included | every technique file follows the normative template | prose drops the artifact-bodies clause |

Three drifts in 15 restatements is a 20% rate on a surface that was authored once, recently, by hand. The registry already carries the canonical sentence for every guard; the technique restates it instead of citing it, and nothing compares the two.

## BY-DESIGN — surfaces that intentionally differ

### G9. The 25 corpus guards are not reachable from meta or work-package, and should not be

The prior evaluation framed the guards as "reachable only by accident of subject matter". That framing understates the design constraint. Twenty-five of 28 guards validate workflow *definition* files: schema conformance, binding fidelity, template shape, gate parseability, fragment resolution, variable coherence. Their subject is the corpus. meta and work-package run against arbitrary repositories and never edit a definition file, so those guards have no target in a meta or work-package run. Naming them from those trees would produce a step that either fails or validates the server's own checkout — the exact failure mode `workflows-root.ts` was written to prevent.

The per-guard verdict for meta and work-package:

| Guard | Should be a workflow operation for meta/work-package | What it would save |
|---|---|---|
| resource-anchors | **yes**, with G4's three edits | Replaces `verify-artifact-links.md` steps 1–3 and the `findings-report.md#anchor-integrity` prose. 358 anchored links validated by tested code instead of by hand; the 543 unanchored ones become checkable for the first time. |
| artifact-guides | **yes, but as a server tool** | The `no-guide` violation of `verify-artifact-conforms.md` rule `guide-is-the-standard`. The guard resolves filename-to-guide against the corpus; the run needs the same resolution against a planning folder. Only the server holds both. |
| source-encoding | **yes, cheaply** | Every artifact a run persists is a text source. The guard is 100% mechanical and already speaks the finding protocol. No corpus root needed. |
| site-links, svg-layout | no | Site-specific; no run produces site assets. |
| binding-fidelity, refs, activities, workflow-yaml, technique-template, variable-model, fragments, when-expression, section-framing, inherited-inputs, identifier-qualification, description-hygiene, self-provisioned-input, activity-technique-overlap, checkpoint-entry, decision-order, set-action-values, harness-adapter-set, bootstrap-self-contained, stealth-isolation, review-mode-gating, audience, prism-lens-reachability | no, for meta/work-package; **yes** for workflow-authoring and workflow-design, where 15 already are | Ten of these are the G7 coverage gap. |

Three guards out of 28 belong in a meta or work-package protocol step. The other 25 belong where they mostly already are.

### G10. The corpus wraps the control plane in prose because the control plane is the only callable plane

Eleven workflow-engine techniques restate a tool call. `list-workflows.md` is 273 bytes whose Protocol is a single sentence naming a tool. This looks like redundant surface and is not: it is how a technique acquires a declared output (`{workflow_catalog}`) that later steps can bind, since the schema has no way to bind a raw tool response. It is by-design, and it is also the clearest statement of the asymmetry this lens is about — the corpus has a vocabulary for calling the server and no vocabulary at all for calling a computation.

## FALSE POSITIVES — present under another name or already resolved

### G11. MECH-03 is fixed

`naming-conventions.md:45` now maps all five enum members — `feature`→`feat`, `enhancement`→`feat`, `epic`→`feat`, `bug`→`fix`, `task`→`chore` — each with a stated reason, under the sentence "The table is total, so no run supplies a prefix of its own." Line 55 adds "Stop and report when `{issue_type}` is unset". Upstream, `issue-type-detection.md` now emits `issue_type_ambiguous` and instructs "Do not pick a category unaided." The producer gap and the enum gap are both closed.

### G12. The condition evaluators are wired

The prior report's core structural claim — "Nothing under `src/tools/` imports either one; their only callers are tests, a harness and two guards" — is false as of today. `src/tools/workflow-tools.ts:18` imports three functions from `src/utils/gate-liveness.ts` and the delivery path uses them. The audited walk shows gate evaluation live: `bundled_steps: 11, lazy_gate_unanswered: 21, lazy_gate_false: 0` on `start-work-package`.

### G13. `{artifact_publish_ref}` is no longer producerless

`resolve-artifact-publish.md:29` emits it, `work-package/workflow.yaml:399` declares it, and `13-submit-for-review.yaml:28` and `14-complete.yaml:59` set it. MECH-07's structural half moved; only the capability half — resolution against a git ref — remains unwritten.

---

# The Judgement-Call Test

A step that looks mechanical but requires reading intent is not a mechanisation candidate. The test applied to each candidate: **can the step's output be computed from its declared inputs by a total function, without any appeal to what a human meant?** A step fails the test if any branch turns on reading free-form natural language for intent, on semantic equivalence between two prose passages, or on a hedge word the specification never resolves.

Eleven candidates survive from the prior twelve. Applying the test:

| ID | Verdict | Evidence |
|---|---|---|
| MECH-01 | **passes** — but it is a convention, not a computation | The finding is that 0 of 262 technique files invoke a script. Nothing to mechanise; something to enable. |
| MECH-02 | **passes** | Binding an argument. No inference of any kind. |
| MECH-04 | **passes with one exception** | Four of the five rows in the write matrix are total. The fifth reads "Re-open only when not cancelled/N/A (and typically **not complete unless intentionally resetting**)". "Typically" and "intentionally" are unresolved hedges: a script cannot decide whether a pending write onto a complete cell is an intentional reset. The link reconciliation table's three rows are total. The `allow_overwrite_na` defaults are total. **Mechanise four rows; leave the pending-target row at a gate.** |
| MECH-05 | **passes** | Scan-then-create is a concurrency primitive, not a decision. `store.ts:214-227` already holds the exclusive-create-plus-rename pattern the fix needs. |
| MECH-06 | **FAILS** | `review-mode-detection.md:53` reads the user's request for "an explicit 'review', a PR number or URL, 'is this safe to merge', **and similar**". Deciding whether free-form text expresses review intent is the definition of reading intent. The prior evaluation reached the same conclusion by a different route ("Structural at its core"). Two *sub-steps* pass and are separable: step 3's "parse a PR number or URL from `{user_request}`" and step 5's "extract the associated tracker ticket (a Jira key or GitHub issue reference)" are both regular expressions over a closed grammar. The classification is not mechanisable; the extraction is, and the remedy — asserting the contradiction `is_review_mode && review_pr_missing` — is a guard rather than a computation. |
| MECH-07 | **passes** | Link resolution, anchor slugging and ref-relative existence are all total. The five slug edge cases the guard documents (fenced-code skip, duplicate-heading suffixes, non-collapsing space-to-hyphen, unclosed-fence direction, non-markdown targets) are precisely why an agent re-deriving this diverges from CI. |
| MECH-08 | **passes** | Two git commands with fixed output grammars and one join. The unspecified key and the binary-file dash are specification gaps a script closes by having to pick an answer. |
| MECH-09 | **FAILS as scoped; a narrower slice passes** | The prior evaluation graded three of four corrections mechanical. That overclaims. Of the five actions at line 57: "replace a restated fact with a link to its canonical home" requires deciding that two prose passages assert the same fact — semantic equivalence, judgement. "Delete a section whose content is an absence" requires deciding that a paragraph says nothing; `No findings.` is a string match, `Nothing of consequence surfaced this pass` is not. "Collapse a table whose every row passes" is computable only where "passes" is a closed-vocabulary column value, which the guides do not universally declare. "Condense prose over budget" and "rewrite against the register" are generative by the technique's own admission. **What survives: detection of over-budget prose (a line count) and detection of a filename with no guide (the `no-guide` violation, which `check-artifact-guides.ts` already computes against the corpus).** Two detections, zero corrections. |
| MECH-10 | **splits, as the prior evaluation found** | `select-target-component.md:46` tier 1 (`{component_hint}` matches a path basename) and tier 2 (`{mentioned_repo}`'s repository segment matches) are string equality. Tier 3 — "`{identifying_context}` when it **clearly names one**" — is judgement with no criterion. `create-worktree.md:30` idempotency detection via `git worktree list --porcelain` is total; the two escalations are user gates, not judgements. **Mechanise tiers 1–2 and the registration probe; leave tier 3 and the gates.** |
| MECH-11 | **passes, all six** | `identify-path-type` (git mode prefix, two values), `project-type-detection` (two-member output space with a stated default), `verify-feature-branch` (equality against two literals), `repo-root-resolution` (path arithmetic plus a `.gitmodules` read), `derive-workflows-target-path` (pure path composition), `verify-readme-conforms` (section-set comparison). No fallback path is stated in any of them, so none loses degradability. |
| MECH-12 | **passes** | Three literal string tests. No boundary case exists. |

**Survivors: 8 of 11 intact, 2 partial, 1 rejected.** MECH-06 fails outright as a computation. MECH-09 collapses from four mechanical corrections to two mechanical detections. MECH-04 and MECH-10 each lose one branch to a hedge or a missing criterion but keep the bulk.

Counting the way the brief asks — how many of the corpus's mechanisation candidates are genuine deterministic procedures after the judgement-call filter — the answer is **nine**: MECH-02, MECH-04 (partial), MECH-05, MECH-07, MECH-08, MECH-10 (partial), MECH-11, MECH-12, plus the new candidate below. MECH-01 is an enablement finding rather than a candidate; MECH-06 and MECH-09 are rejected or reduced to guards.

## A control case for the filter

`work-package/techniques/review-assumptions/reconcile.md` is what a genuine judgement step looks like when written in the same register as a computation. Its `code-resolvable` and `not-code-resolvable` rules each supply eight worked examples and no criterion; the classification is "determine whether targeted code analysis could validate or invalidate it". That step has numbered protocol lines, declared inputs, declared boolean outputs driving a loop gate, and is unmechanisable in principle. It shares its shape with `identify-path-type`, whose entire Protocol is "run `git ls-tree HEAD {path}` and read the mode prefix". The corpus gives the two the same typography, which is the reason the false-positive risk is real and the reason this filter has to be applied per step rather than per technique.

---

# A Candidate the Prior Evaluation Missed

## MECH-13 — The server names an algorithm it declines to run, in its own tool description

`start_session`'s registered description at `src/tools/resource-tools.ts:107-108` reads:

> Always pass `repo` as owner/repo, derived from git via `version-control::resolve-host-repo` (origin remote of the outermost claiming superproject); the user or workspace AGENTS.md is a fallback only when the workspace is not a git repo or has no origin remote. Stored on session.json#repo.

The server declares a required coordinate, names the exact algorithm that computes it, states the precedence rule, and computes none of it. `workflows/meta/techniques/version-control/resolve-host-repo.md` — 2,692 bytes, version 2.0.2 — holds that algorithm as agent-executed prose:

1. `git -C {workspace_path} rev-parse --show-toplevel`
2. Ascend while the parent directory is a git repository whose `.gitmodules` declares the current toplevel's basename as a submodule path, recording each boundary and whether it was infrastructure
3. `git -C {host_repo_path} remote get-url origin`, accepting both `git@host:owner/repo.git` and `https://host/owner/repo.git`, dropping a trailing `.git`

Four outputs, every one derivable: `{target_repo}`, `{host_repo_path}`, `{component_hint}`, `{host_binding_mismatch}`. The last is a basename comparison the technique itself describes as a server limitation: "The server maps `owner/repo` onto a filesystem root by basename alone, so it cannot represent this divergence."

It is the **first step of the first activity of meta** (`meta/activities/00-discover-session.yaml:8-9`) and it is bound again in work-package (`work-package/activities/01-start-work-package.yaml:142`), so it runs at least twice per full engagement. Its output feeds a blocking checkpoint eight lines later.

This is not one technique. It is a cluster of six that computes one thing:

| Technique | Bytes | Procedure |
|---|---|---|
| `version-control/resolve-host-repo.md` | 2,692 | git ascent + origin URL parse |
| `version-control/detect-repo-type.md` | 1,077 | `.gitmodules` presence + non-infrastructure filter |
| `version-control/list-submodules.md` | 602 | `.gitmodules` section parse |
| `version-control/identify-path-type.md` | 414 | `git ls-tree` mode prefix |
| `version-control/select-target-component.md` | 1,881 | cardinality test + two string-equality tiers |
| `work-package/repo-root-resolution.md` | 1,560 | path join + `.gitmodules` basename lookup |

8,226 bytes, plus the `infrastructure-submodule-paths` rule at `version-control/TECHNIQUE.md:40-42` that three of them cite (MECH-12). Every one passes the judgement-call test except `select-target-component` tier 3.

Passes the test. Home: this is the strongest case in the whole set for a **script**, not a tool, because it needs git and the server cannot spawn a process. It is also the case that most exposes ECO-01 — the checkout is the surface not guaranteed present, and this is the one procedure that must run before the run knows which checkout it is in.

---

# Where Each Survivor Should Live

Three homes, ordered by presence at the moment of execution. The server is present by definition. The corpus is present because the server reads it. The checkout is present only when the run's subject happens to be a repository the run can reach.

| Candidate | Home | Why that home | Blocking dependency |
|---|---|---|---|
| MECH-02 | **definition edit** | One argument on one prose Apply. `commit-and-persist.md:22` has just written the artifact. | Land before MECH-04, which reads the bound value. |
| MECH-04 (4 of 5 rows) | **registered server tool** | The write target is `{planning_folder_path}/README.md`, which the server already resolves canonically, already authenticates by `session_index`, and already creates directories under. The seal covers `session.json` bytes only, so no new trust boundary. | MECH-02's binding. Must return a diff, not `rows_updated`. |
| MECH-05 | **registered server tool** | An exclusive-create open is the only correct fix, and the server is the only party that can hold one. The primitive is already in `src/utils/session/store.ts:214-227`. | Land before MECH-02, so the wrong instance path never reaches a Progress link. |
| MECH-07 cheap half | **script** (`check-resource-anchors.ts`, three edits) | The guard exists and is tested. It needs `requireWorkflowsRoot` + `assertScanned`, a non-corpus root shape, and a relaxed outside-root skip. | None. This is the cheapest correctness win in the set. |
| MECH-07 capability half | **script** | Ref-relative resolution via `git cat-file -e {ref}:{path}`. Needs git; the server cannot spawn. | ECO-01 — the script needs an address. |
| MECH-08 | **script** | Two git invocations and a join. Its consumer is a review activity inside a checkout that has git anyway. | ECO-01. |
| MECH-09 (reduced) | **server tool** for the `no-guide` detection; **definition edit** for the rest | Filename-to-guide resolution needs the corpus and the planning folder together, and only the server holds both. `check-artifact-guides.ts` already computes the corpus half in 307 lines. | Rewrite `verify-artifact-conforms.md` to separate detection from correction first. |
| MECH-10 tiers 1–2 | **definition edit** | Lift two string-equality tiers out as computed inputs to the gate that already exists. About 15 lines. | None. |
| MECH-11 (six) | **definition edit** for five; **script** for `project-type-detection` | Five are path or string arithmetic an agent performs correctly. `project-type-detection` reads a `Cargo.toml` dependency table and is the one that benefits from real parsing. | None. Batch them into one landing; their marginal cost inside a batched landing is near zero. |
| MECH-12 | **definition edit** | Three lines, folded into whichever landing touches `detect-repo-type`. | None. |
| MECH-13 | **script** | Requires git subprocess execution. Cannot be a tool while `src/` contains no `child_process` import. | ECO-01, hardest instance. |

Counting homes: **2 server tools** (MECH-04, MECH-05, with MECH-09's detection as a third if scoped), **4 scripts** (MECH-07 both halves, MECH-08, MECH-11's project-type, MECH-13), **4 definition edits** (MECH-02, MECH-10, MECH-11's five, MECH-12).

Note the asymmetry this produces. Every script-homed candidate is blocked on the same thing: a script has no address a run can reach unless the run's subject is this checkout. Every tool-homed candidate is unblocked, because the server is present by definition — and the two tool-homed candidates are also the two highest-frequency and highest-blast-radius items in the set.

---

# What the Delivery-Cost Gate Can and Cannot See

The gate is real and it runs. `verify.yml:83` invokes `npm run --silent bench:token -- --label=ci --context-mode=fresh --gate` on every pull request and every push to main. `run-token-benchmark.ts:172` sets the default threshold to 1%.

## The floor

Baseline total delivery, from `scripts/fixtures/token-benchmark-baseline.json`: `get_activity` 520,075 + `get_workflow` 108,356 + `get_resource` 527,683 + `get_technique` 146,205 = **1,302,319 characters**. The audited run reproduced it at 1,302,321, a delta of 2 characters.

**Resolution floor at 1%: 13,023 characters.** The prior evaluation's figure was 13,555; the floor has come down 3.9% because the baseline was re-recorded lower.

## Per-candidate measurement against that floor

Every figure below is from the audited walk's own delivery events, not from file sizes.

| Candidate | Measurable delivery footprint in the gated walk | Share of 1,302,321 | Clears 13,023? |
|---|---|---|---|
| MECH-04 | `meta/planning-readme#status-vocabulary` 1,612 + `#status-transition-policy` 2,485 = **4,097** | 0.31% | **no** — 3.2x below |
| MECH-05 | `manage-artifacts::write-artifact` delivered twice at 12,068 and 12,031 = 24,099 total, of which step 4 is roughly 300 bytes of the 2,587-byte source, so about **600** | 0.05% | **no** — 22x below |
| MECH-07 | `manage-artifacts::verify-artifact-links` bundled, 2,490-byte source; steps 1–5 are most of it, call it **2,000** | 0.15% | **no** |
| MECH-11 (all six) | 7,378 bytes of source; the saving is the difference between a procedure statement and a signature, 30–60 words each, so about **1,500–3,000** | 0.12%–0.23% | **no** — the delivery is paid either way |
| MECH-13 cluster | 8,226 bytes of source across six techniques; a signature-plus-invocation form saves perhaps **5,000** | 0.38% | **no** |
| MECH-12 | three lines, about **200** | 0.015% | **no** |
| **All of the above together** | about **12,900** | 0.99% | **no, by 123 characters** |

The entire surviving mechanisation programme, measured on the instrument that gates it, lands one tenth of one percent below the threshold that would make it visible. That is not a coincidence of arithmetic — it is what the prior evaluation predicted at ECO-03, now confirmed against a live gate rather than an estimated one.

## The sharper problem: half the candidates are off-instrument entirely

The gate walks **work-package only**. `run-token-benchmark.ts` defaults `--workflow` to `work-package` and the CI line does not override it. meta's 150 technique files and 297,551 bytes are measured by nothing.

Of the eleven surviving candidates, these live in meta and are invisible to the gate except through the handful of `meta/` resource anchors a work-package technique happens to link:

- MECH-02 (`meta/techniques/workflow-engine/sync-progress-status.md`)
- MECH-04's technique half (same file)
- MECH-08 (`meta/techniques/version-control/three-dot-name-status.md`)
- MECH-09 (`meta/techniques/verify-artifact-conforms.md`)
- MECH-12 (`meta/techniques/version-control/TECHNIQUE.md`)
- MECH-10's `select-target-component` half
- three of MECH-11's six
- most of MECH-13's cluster

The gated walk did deliver four `meta/planning-readme` sections and `meta/writing-register`, and it did deliver `version-control::resolve-host-repo` bundled into the first activity, because work-package binds those directly. It delivered no other meta content. So for the meta-resident candidates the correct statement is not "the saving is below the floor" — it is **"the instrument does not measure the surface the saving is on."**

For comparison, the two figures the gate *can* resolve, neither of which is a mechanisation finding: `manage-artifacts::write-artifact` costs 24,099 characters across two deliveries of a 2,587-byte file (a 4.66x composition tax, 1.85% of the walk), and `review-mode` is fetched whole twelve times at 21,239 characters each. Those clear the floor by an order of magnitude. The instrument is well matched to composition and delivery findings and badly matched to prose-length findings, which is the whole of the mechanisation programme's measurable side.

## What is actually gateable

One restatement makes one candidate measurable, and it is the one ECO-03 already named. MECH-04's saving is not "a table stops being applied by hand". It is "`planning-readme.md#status-transition-policy` and `#status-vocabulary` stop being run-time dependencies of the highest-frequency orchestrator hook" — 4,097 characters on the gated walk, and considerably more on a real multi-worker run where the `seenResource` dedupe the benchmark applies does not hold. The benchmark fetches each distinct resource id once per walk; a production run with fresh worker contexts refetches per context. The gated 4,097 is a floor on the real saving, not an estimate of it.

**Recommendation for the instrument, not for the candidates:** add a second gated walk over `meta`. `run-token-benchmark.ts` already takes `--workflow`, already records it in the output, and already refuses to gate a cross-workflow comparison. A second CI line and a second fixture cost one file and one step, and they would put six of the eleven surviving candidates on an instrument for the first time.

---

# Findings Register

| ID | Class | Severity | Title | Site |
|---|---|---|---|---|
| REG-01 | TRUE GAP | Medium | Two guards speak the JSON finding protocol; the registry marks them plain, so the merge-base ratchet is coarser than the code supports | `scripts/guards.ts` entries `refs`, `inherited-inputs`; consumed at `scripts/check-delta.ts:156,172` |
| REG-02 | TRUE GAP | Medium | The current guard-invocation exemplar states an argument contract both named scripts contradict | `workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:19` against `scripts/validate-workflow-yaml.ts:117`, `scripts/validate-activities.ts:93` |
| REG-03 | TRUE GAP | Low | Four guards implement `--root` and omit it from their own usage line, which is the line an author copies | `check-self-provisioned-input.ts:20`, `check-activity-technique-overlap.ts:14`, `check-when-expression.ts:8`, `check-resource-anchors.ts:17` |
| REG-04 | TRUE GAP | High | The anchor guard reports a clean pass having inspected almost nothing, accepts any directory as a root, and ignores 60.3% of the corpus's relative links | `scripts/check-resource-anchors.ts:116,126`, and the absence of `assertScanned` |
| REG-05 | TRUE GAP | High | `sync-progress-status` declares `delivered_artifact`, branches on it, and no call site can bind it | `workflows/meta/techniques/workflow-engine/sync-progress-status.md:32,54`; call sites at `commit-and-persist.md:22`, `dispatch-activity.md:48,60,61` |
| REG-06 | VISIBILITY GAP | Low | `record_usage` is registered, rendered on the generated site, and absent from the hand-maintained tool reference | `src/tools/workflow-tools.ts:1475` against `docs/api-reference.md` |
| REG-07 | VISIBILITY GAP | Medium | Ten corpus guards are absent from the only workflow that runs guards — 60% coverage of the corpus guard set | `workflows/workflow-authoring/techniques/workflow-definition/audit-schema-validation.md:25-37` against `scripts/guards.ts` |
| REG-08 | VISIBILITY GAP | Medium | Three of 15 prose guard descriptions have drifted from the registry line they restate, with no comparison anywhere | `audience`, `review-mode-gating`, `technique-template` |
| REG-09 | TRUE GAP | High | No guard reads workflow prose for script invocations, so every drift in REG-02, REG-03 and REG-08 is undetectable by construction | `grep -rn "npx tsx" scripts/check-*.ts` returns only self-documentation |
| MECH-13 | TRUE GAP | High | The server's own `start_session` description names the algorithm that produces its required `repo` argument, and the server computes none of it | `src/tools/resource-tools.ts:107` against `workflows/meta/techniques/version-control/resolve-host-repo.md` |
| INS-01 | Instrument | High | The delivery-cost gate walks work-package only; meta's 297,551 bytes and six of eleven surviving candidates are on no instrument | `.github/workflows/verify.yml:83`; `scripts/run-token-benchmark.ts` `--workflow` default |
| INS-02 | Instrument | Medium | The whole surviving mechanisation programme measures at 0.99% of a walk — 123 characters under the gate's own 1% threshold | 12,900 estimated against a 13,023 floor |

---

# Conservation Law: Detection Breadth Against Context Depth

This lens's encoded law is that exhaustive per-surface enumeration trades against per-surface depth, and that conflating layered registrations produces the characteristic false positive. Two conflations were available in this target and both were declined:

**Registry and docstring look like one surface.** They are two, and they disagree four times (REG-03). Merging them would have reported 25 of 25 corpus guards as `--root` capable and documented, missing the gap entirely — because the registry is right and the docstrings are stale.

**Guard file count and guard count look like one number.** Twenty-eight files match `check-*.ts` and 28 entries sit in the registry, and they are not the same 28: two files are runners and two registry entries are validators named `validate-*`. A flat reading gives 28 = 28 and a clean bill. The layered reading gives 26 guards plus 2 runners on disk against 26 check-guards plus 2 validators in the registry, which is the arithmetic that surfaces the runner/guard distinction the delta runner depends on.

The depth cost was paid on the other side. This audit did not enumerate the site surface's own internal layers, did not enumerate the test surface's coverage of each tool, and did not trace each of the 199 technique steps to its bound technique. Those are other lenses' ground.

---

# Most Important Insight

**The server's tool descriptions are the only place where a domain algorithm and its non-implementation are stated in the same sentence.** `start_session` tells the caller to derive `repo` "from git via `version-control::resolve-host-repo`", cites the precedence rule, names the fallback, and says where the answer is stored — in a process that cannot execute a git command. That is not an oversight in one description. It is the boundary of the whole design made explicit: the server is authoritative about what must be computed and structurally incapable of computing it, and the corpus has a vocabulary for calling the server and none for calling a computation.

Every registration gap found here is a consequence of that boundary rather than a defect beside it. The guards are 5,374 lines of exactly the right code on exactly the wrong side of a process boundary, reachable only when the run's subject happens to be the repository that holds them. The prose that would reach them is hand-copied from a registry that already carries the canonical sentence, and has already drifted three times in fifteen. And the one instrument that could price any of it walks the wrong half of the corpus.
