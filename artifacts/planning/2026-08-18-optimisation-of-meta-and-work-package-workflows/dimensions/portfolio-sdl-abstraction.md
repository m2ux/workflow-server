---
target: /home/mike1/projects/dev/workflow-server
date: 2026-08-18
lens: sdl-abstraction (15)
dimension: Delivery Economy
subject: workflows/meta (171 files, 291 KB), workflows/work-package (168 files, 619 KB), src/ (55 files, 12,628 LOC)
baseline: 2026-08-17 EVALUATION-REPORT.md, after server PRs #467/#471 and definition PRs #468/#470
corpus_rev: workflows@2e8b6297
---

# Delivery Economy — Abstraction Leak lens

Lens `15` / `sdl-abstraction`, applied to the bytes a run still ships into agent contexts and to the abstraction that would collapse each remaining duplication.

## How the figures here were obtained

Every number below is measured, not estimated, and each was produced in one of three ways.

**A recorded walk.** `scripts/run-token-benchmark.ts` was run unmodified against the current checkout, walking work-package's twelve-activity `skip-optional` path with the robot walker. It reproduced the committed baseline exactly — 1,302,319 delivery characters over 242 tool calls, `get_resource` 527,683 over 162 calls, `get_activity` 520,075 over 12, `get_technique` 146,205 over 24, `get_workflow` 108,356 over 1, 66 techniques bundled and 24 fetched, 146 resource fetches against 77 distinct ledger keys. Every figure in the task brief is confirmed to the character. The same script was then run a second time with `--context-mode=persistent`, which changes nothing about the corpus and only switches on the collapse machinery already in the build.

**A per-call probe.** A copy of the benchmark's call model, instrumented to record the tool, argument, response size and delivery mode of every one of the 242 calls, plus the session's own history and delivery ledger. Two runs, one per context mode.

**Static composition through the server's own loaders.** `resolveTechniques`, `formatTechniqueBundle`, `composeActivityTechnique`, `projectTechnique`, `projectTechniqueToYaml` and `extractMarkdownSection` were driven directly over all 20 activities and all 199 technique-step bindings of the two trees, so that corpus-wide block accounting is the server's own composition rather than a re-implementation of it.

Character counts are wire characters after `stringifyForResponse`. Where a figure disagrees with the prior report, both are given.

---

## What the remediation already closed, so this report does not re-report it

Three of the prior report's Context Economy findings are closed by the merged work, and the closure is measurable in the recorded walk.

**The invariant worker bundle no longer re-ships once per activity (CTX-01, closed).** Composing the worker bundle statically for the twelve walked activities gives 446,773 characters — seven activities at 35,204 and five at 40,069. The recorded walk delivers 65,253. The server's own per-activity cost line reports 35,204 on the first activity, 24,311 on the second, then 620 or 543 for the remaining ten. The mechanism is `mayReferBack` at `src/tools/workflow-tools.ts:877`, which admits the ledger when `hasDispatch(state, scope)` is true even in a fresh-mode session — so the second and every later delivery to the same context collapses. **381,520 characters per walk, already recovered.**

**The reported eager spend is now complete (part of CTX-08, closed).** `spentChars` is initialised to `workerBundleChars` at `src/tools/workflow-tools.ts:967`, so the delivery-cost line no longer understates an activity by the size of the bundle it opened with.

**Response-local block collapse runs unconditionally on the bundled path (part of CTX-02, closed).** `dedupTechniqueBlocks` is called from `src/tools/workflow-tools.ts:1061` on every `get_activity`, with `ledgerLookup` set to `referenceMode` — so the response-local half runs whatever the mode. Measured on the walk: 22,387 characters of `rules` and 43,700 of `inherited_inputs` collapse inside the twelve responses, 66,087 characters in all.

Everything below is what remains.

---

## Step 1 — Name the abstraction layers, and what crosses them

Four layers, and the boundary that matters is the third.

| Layer | What it claims to hide | Where it lives |
|---|---|---|
| **A. Definition corpus** | how a step's instructions reach a context | `workflows/meta/**`, `workflows/work-package/**` |
| **B. Composition** | contract inheritance — a leaf technique need not restate its ancestors' inputs, outputs or rules | `src/loaders/technique-loader.ts:513-576` (`composeLoaded`), `:652-678` (`formatTechniqueBundle`) |
| **C. Delivery ledger** | whether a context already holds these bytes | `src/utils/delivery.ts`, `src/utils/resource-delivery.ts`, the five tool handlers |
| **D. Agent contract** | nothing — it is where C's internals are restated as prose for agents to obey | `workflows/meta/techniques/workflow-engine/TECHNIQUE.md` |

### A1 — Layer C claims one boundary and enforces five different ones

The header comment of `src/utils/delivery.ts:5-40` states a single rule: "When reference delivery is active (session `contextMode: 'persistent'` or a per-call opt-in), a payload whose hash matches the ledger is replaced by a short marker." One rule, one ledger, one marker shape.

Five call sites implement five different admission tests for that one ledger.

| Content | Admission test | Source |
|---|---|---|
| `get_activity` worker bundle, `bundle:rules`, `activity_rules` | `bundle !== 'full' && (referenceMode \|\| hasDispatch(state, scope))` | `workflow-tools.ts:877`, used at `:897`, `:911`, `:1266` |
| `get_activity` step techniques | `referenceMode` for the ledger; response-local always | `workflow-tools.ts:1039-1041` |
| `get_activity` eager resource bodies | unconditional ledger read — but reachable only inside `if (referenceMode)` | `workflow-tools.ts:1094`, `:1125` |
| `get_technique`, `get_resource` | `full !== true && (bundle ?? contextMode-derived) === 'reference'` | `resource-tools.ts:801`, `:940` |
| `get_workflow` orchestrator bundle | `state.contextMode === 'persistent'`, session-scoped, no `agent_id` parameter exists | `workflow-tools.ts:447-450` |

This is asymmetric concealment in its textbook form. The same content key, the same hash function and the same marker shape are shared by all five, and whether a repeat collapses depends on which block of which handler assembled it. The abstraction that the code is one refactor away from having is already named in its own docstring — it just has no object.

**The abstraction: one `ReferencePolicy` value, constructed once per call from `(state, scope, bundle, full)`, exposing a single `refer(key, hash)` that returns a marker or null.** Each handler would then answer the question once instead of five handlers answering five variants of it. The measured consequence of not having it is item A2.

### A2 — The two most expensive delivery tools import the predicate that would authorise collapse and use it only for bookkeeping

`src/tools/resource-tools.ts:53` imports `hasDispatch`. It is called twice, at `:792` and `:921`, in both cases inside a `recordFirstArrival` helper whose only effect is to append an `activity_dispatched` history event. The reference decision three lines below — `resource-tools.ts:801` and `:940` — never consults it.

`hasDispatch` is exactly the predicate the reference decision needs. Its own docstring says so (`src/utils/dispatch.ts:23-29`): "`fresh` is an empty ledger taking full delivery, `resume` is prior deliveries to collapse." `get_activity` already treats it that way and recovers 381,520 characters per walk by doing so. `get_technique` and `get_resource` do not.

What that costs, measured on the same walk by switching the session's declared mode and changing nothing else:

| Call | Fresh (recorded baseline) | Persistent | Delta |
|---|---:|---:|---:|
| `get_activity` | 520,075 over 12 | 623,884 over 12 | **+103,809** |
| `get_resource` | 527,683 over 162 | 91,591 over 123 | **−436,092** |
| `get_technique` | 146,205 over 24 | 67,608 over 24 | **−78,597** |
| `get_workflow` | 108,356 over 1 | 108,356 over 1 | 0 |
| **Total** | **1,302,319 over 242** | **891,439 over 203** | **−410,880 (−31.5%)** |

`unchangedResourceAnswers` moves from 0 to 71 and `unchangedTechniqueAnswers` from 0 to 1. `get_activity` grows because reference mode also moves resource bodies into the activity response as a sibling `resources` map; netting that against the resource channel still leaves 332,283 characters off the resource bill.

**410,880 characters — 31.5% of the whole walk — is recoverable by machinery that is already built, already tested, and already trusted enough to run on `get_activity`.** Nothing in the corpus changes. The narrowest form of the change is three lines: replace `referenceMode` with `referenceMode || hasDispatch(state, scope)` at `resource-tools.ts:805` and `:942`, and at `workflow-tools.ts:1039`.

### A3 — The ledger is a write-only structure in the one mode the gate measures

The recorded fresh walk writes 265 delivery-ledger keys and reads none of them: `unchangedResourceAnswers: 0`, `unchangedTechniqueAnswers: 0` in the committed baseline fixture (`scripts/fixtures/token-benchmark-baseline.json:46-47`), reproduced exactly. Seventy-seven of those keys are `resource:*`, 31 are `technique:rules:*`, 30 are `technique:inherited_inputs.items:*`, 30 `technique:inherited_inputs:*`, 22 `technique:*` whole-payload keys, 8 `bundle:*`, and one each for `activity_rules`, `technique:provenance_note` and the two inherited notes.

Those keys are hashed, serialised and sealed into the session file on every call. The seal, the write and the growth are paid; the read is refused by `referenceMode`. This is the clean statement of A1 and A2 together: the cost of the abstraction is paid in full and its benefit is switched off at the point of use.

### A4 — Layer D restates layer C's mechanics, and the restatement is the larger half of the group contract

`workflows/meta/techniques/workflow-engine/TECHNIQUE.md` is 8,242 characters. Twelve rules, whose bodies total 7,701 characters. Eight of the twelve are prose about how to call the server rather than about the workflow engine's domain:

| Rule | Chars |
|---|---:|
| `agent-id-scopes-delivery` | 1,065 |
| `resource-section-or-whole` | 1,028 |
| `fetch-costs-what-it-delivers` | 720 |
| `resource-loading-via-tool` | 715 |
| `progressive-step-technique-load` | 560 |
| `force-full-after-summarization` | 310 |
| `session-index-passes-on-each-call` | 302 |
| `validation-warnings` | 92 |
| **Total** | **4,792 (62.2% of the rule bodies)** |

The prior report measured 5,014 of 8,286 characters, 60.5%. My count is 4,792 of 7,701 rule-body characters, 62.2%, or 58.1% of the whole file; the difference is that I measure rule bodies rather than the file, and the file has shrunk by 44 bytes since. Both readings say the same thing.

Every one of those eight restates something the tool schema already carries. `force-full-after-summarization` restates the `full` parameter description at `resource-tools.ts:875`. `agent-id-scopes-delivery` restates the `bundle` parameter description at `:874` and the tool description at `:868`. `resource-loading-via-tool` restates the `resources_note` the server synthesises at delivery time (`workflow-tools.ts:1189-1191`). The tool schema is delivered once per session and stays resident; this block is paid again per composed technique, per activity.

**The abstraction: the server already knows how to state delivery mechanics at delivery time and does so, in `step_techniques_note`, `resources_note`, `bundle_note`, `inResponseNote`, `priorCallNote` and the two `enforcement_notes`.** Those notes are synthesised from the shape of the response being sent, so they cannot drift from it. Eight rules in a corpus file can, and one of them already has — `resource-section-or-whole` tells an agent that "loading the whole file does not collapse a later section fetch under a different key," which is true of `get_resource` and false of the eager bundle path in the same response.

---

## Step 2 — Abstraction inversions: where the interface reveals a choice that should be hidden

### B1 — The technique ledger key promises payload identity that the payload does not have

`get_technique` keys the whole composed payload on `technique:${techniqueId}` (`resource-tools.ts:803`). The payload it hashes is not a function of the technique id: `decorateTechniqueProvenance` (`src/utils/binding-provenance.ts:366-418`) rewrites `source:` on each input and `destination:` on each output from the *step binding*, so two steps that bind the same technique produce two payloads with the same key and different hashes.

Measured on the walk. `update-pr::render` is fetched four times:

| Activity / step | Wire chars |
|---|---:|
| `plan-prepare/update-pr` | 7,663 |
| `strategic-review/refresh-pr-body` | 7,661 |
| `submit-for-review/update-description` | 7,618 |
| `submit-for-review/rerender-body` | 7,661 |
| **Total** | **30,603** |

Composing the first two through the server's own decoration path and diffing them character by character: **common prefix 2,506, common suffix 5,152, differing middle 5 characters against 3** — the strings `initi` and `fin`, one arm of a template name. Four deliveries, 30,603 characters, to carry a three-character difference. `manage-artifacts::write-artifact` is delivered twice at 12,068 and 12,031, a 37-character difference.

Across the walk, **eight of the 24 `get_technique` calls re-deliver a body this same context already holds — 64,633 characters.** Four of the eight follow an earlier eager bundling of the same technique into a `get_activity` response, which is precisely the case the task brief names:

| Fetch | Chars | Already held because |
|---|---:|---|
| `start-work-package/detect-provided-issue-reference` — `issue-reference-detection` | 4,054 | bundled |
| `start-work-package/derive-branch-name` — `naming-conventions` | 5,782 | bundled |
| `codebase-comprehension/analyse-challenge-pass` — `analyse-challenge::run-loop` | 7,758 | bundled |
| `codebase-comprehension/update-artifact` — `manage-artifacts::write-artifact` | 12,068 | bundled |
| `codebase-comprehension/record-log` — `manage-artifacts::write-artifact` | 12,031 | fetched |
| `strategic-review/refresh-pr-body` — `update-pr::render` | 7,661 | fetched |
| `submit-for-review/update-description` — `update-pr::render` | 7,618 | fetched |
| `submit-for-review/rerender-body` — `update-pr::render` | 7,661 | fetched |

Turning on reference delivery collapses only **one** of these eight, because the other seven are not byte-identical. That is the whole of the inversion: the key says "this technique", the hash says "this technique as annotated for this step", and the caller is left holding both.

**The abstraction: split the composed technique into an invariant core and a step-bound delta, and key them separately.** `dedupTechniqueBlocks` already performs exactly this split one level down — `inherited_inputs.note` is hashed apart from `inherited_inputs.items` at `src/utils/delivery.ts:165-170`, precisely so that "a shared preamble collapses across techniques whose own-input sets differ." The same treatment applied to the technique body gives `technique:core:<id>:<hash>` plus a small `provenance` block, and the four `update-pr::render` deliveries become one 7,600-character core and three deltas of a few dozen characters each.

Total recoverable on `get_technique` for this walk: **97,330 of 145,653 characters (66.8%)** — 64,633 as whole-payload markers and 32,697 as shared-block markers on the other sixteen calls. Reference delivery alone reaches 78,045 of that; the core/delta split is the remaining 19,285.

### B2 — `bundle` and `full` put the caller in charge of a fact only the server can know

`get_technique`, `get_resource` and `get_activity` each expose two parameters that select an internal execution path: `bundle: "reference" | "full"` and `full: boolean`. Their descriptions instruct the caller to reason about server-side state — `resource-tools.ts:874`: "collapses a refetch already delivered to THIS agent_id scope"; `:869`: "A freshly spawned worker must not ask for reference delivery — it holds no prior delivery to reference."

The server can answer both questions itself and does so on one of the three tools. Whether a scope has been met is `hasDispatch`. Whether the content matches is the hash comparison already performed. The only genuinely caller-owned fact is the one `full: true` encodes: *this context has lost the bytes since*. That is one boolean, and it is the only one that needs to be on the wire.

The corpus pays for the other one. `workflows/meta/techniques/workflow-engine/dispatch-activity.md:93` and `TECHNIQUE.md:22` and `create-session.md:46` and `start-session.md:56` — four sites across the engine group — instruct the orchestrator not to set `context_mode: "persistent"`, and the server's own `start_session` response repeats the instruction at `resource-tools.ts:454`. Five statements of a policy that exists only because one boolean stands for two questions.

**The abstraction: keep `full: true` as the caller's declaration of loss, and derive reference delivery from `hasDispatch(state, scope)` server-side.** `bundle` becomes an override for testing rather than a required protocol act, and five corpus statements plus one server response line stop being load-bearing.

### B3 — The resource ledger is keyed on the identifier string, and the server knows the identifiers are not independent

`resource-tools.ts:936-938` states the rule in a comment: "Ledger key is the exact caller resource_id (including any #section) so bare and sectioned fetches never share a slot." So `review-mode` and `review-mode#review-comment-template` occupy two slots, and a context that holds the first is sent the second in full.

The server already knows better in one place. The eager resource path in `get_activity` sorts bare ids ahead of anchored ones and skips any section whose own file is already in the bundle (`workflow-tools.ts:1103-1112`, the `coveredByItsFile` helper), with a comment explaining exactly why: "A whole-resource body already carries every section of itself." That knowledge is local to one loop in one handler and is never taught to the ledger.

Measured on the persistent-mode walk, where the ledger is actually read: **eight full section deliveries land in a context that already holds the containing file, 21,656 characters and eight round trips.**

| Section delivered in full | Chars | Container already delivered |
|---|---:|---|
| `review-mode#review-comment-template` | 14,342 | `review-mode` (21,239) |
| `pr-description#rules` | 1,892 | `pr-description` (6,475) |
| `pr-description#link-row-forms` | 1,348 | `pr-description` |
| `pr-description#template-final` | 1,347 | `pr-description` |
| `pr-description#template-initial` | 970 | `pr-description` |
| `pr-description#lifecycle-tense` | 822 | `pr-description` |
| `pr-description#mandated-sections-present` | 572 | `pr-description` |
| `review-mode#review-type-selection` | 363 | `review-mode` |

The reverse case — a whole file delivered after its sections — did not occur on this walk.

**The abstraction: an extent-keyed resource ledger.** Key a delivery by `(resource file, byte range)` rather than by the caller's identifier string. `extractMarkdownSection` already computes the range; `coveredByItsFile` already reasons about containment. Making the ledger key the extent makes containment a lookup rather than a special case, covers the section-within-section relation the prior report's CTX-05 identified, and removes the corpus rule `resource-section-or-whole` that exists only to warn agents about the flat key space.

### B4 — Three size caps on the eager bundle, none of which can bind

The eager path carries three independent bounds and every one has slack of at least 3.7 times against the largest thing it could ever see.

| Bound | Value | Largest observed | Slack |
|---|---:|---:|---:|
| Cumulative eager budget (`context_tokens × 0.8 × 4`) | 640,000/activity | 91,516 (`start-work-package`) | 7.0× |
| `DEFAULT_MAX_EAGER_RESOURCE_CHARS` (`resource-delivery.ts:6`) | 80,000 | 21,574 (`review-mode.md`) | 3.7× |
| Per-activity `bundleTechniques.maxChars` | activity-declared | — | never declared |

Total eager spend across the twelve activities is 473,964 against 7,680,000 of cumulative budget, 6.2%.

The third is the sharpest. **`bundleTechniques` is declared by zero activities across all 21 definition trees**, while costing 41 sites across `src/`, `schemas/`, `scripts/` and `tests/` — a schema object, an `optedOut` sentinel branch at `workflow-tools.ts:951`, a `perTechniqueCap` branch at `:952`, a skip branch at `:1034`, and a 340-character schema description at `src/schema/activity.schema.ts:287` that documents a bundling rule the server no longer applies (it says bundling is "opt-in hybrid", and it has been automatic since #189 C1c). An unexercised caller-facing knob whose documentation contradicts the behaviour is a leak in both directions: it invites an activity author to reason about delivery internals, and it tells them something untrue when they do.

The prior report's CTX-08 recommended retiring the budget and keeping the activity cap; that recommendation stands, and the per-activity cap should go with it.

### B5 — In full mode the delivery path loads every resource body it declines to deliver

`workflow-tools.ts:1163-1181`. In reference mode the bundler loads each linked resource and ships the body. In full mode it pushes the ids into `resource_refs` and then — in a second loop — loads every one of the same resources anyway, solely so an unresolvable reference produces a validation warning, and discards the content.

The persistent walk records 95 bundled resource deliveries; the fresh walk records zero and issues 162 `get_resource` calls instead. So the same walk performs roughly 64 whole-resource reads it throws away, then the worker asks for them one at a time. Same read, two outcomes, decided by a mode flag the read itself does not depend on.

**The abstraction: separate resolvability from delivery.** Resolvability of a technique's resource links is a static property of the corpus, checkable once by `scripts/check-resource-anchors.ts` at authoring time, not per delivery per session. If it must stay at run time, it needs a resolve-only path that stats the file rather than reading it.

---

## Step 3 — Leak bugs: couplings that break silently

### C1 — Composition inserts three shared blocks into every technique, and the ledger only sometimes knows

Composition is layer B's whole purpose: `composeLoaded` (`technique-loader.ts:513-576`) merges each ancestor contract into the technique value so a leaf file need not restate it. Zero technique files in either tree contain the string `inherited_inputs` — the corpus really is free of the restatement, which corrects the framing in the task brief: these blocks are not "restated across 262 technique files", they are **synthesised at composition and then restated across every delivery**.

Corpus-wide, driving all 199 technique-step bindings of the two trees through the server's own composition:

| Block | Shipped if every binding delivered | Distinct values | Union | Redundant |
|---|---:|---:|---:|---:|
| `rules` | 336,657 (31.0%) | 64 | 167,636 | **169,021** |
| `inherited_inputs` | 277,133 (25.5%) | 24 | 34,171 | **242,962** |
| `inherited_outputs` | 19,669 | — | — | — |
| **Shared total** | **633,459 (58.2% of 1,087,656 composed characters)** | | | |

`inherited_inputs.note` deserves its own line: it occurs in all 199 bindings and has **exactly one distinct value** — the 119-character `INHERITED_SCOPE_NOTE` at `technique-loader.ts:422-423`. One string, 199 copies, and the ledger holds precisely one key for it.

On the twelve-activity walk specifically, across the 90 step-technique deliveries (66 bundled plus 24 fetched):

| | Composed chars | `rules` | inherited | Shared share |
|---|---:|---:|---:|---:|
| Bundled into `get_activity` | 338,982 | 68,901 | 104,295 | 51.1% |
| Fetched via `get_technique` | 122,382 | 36,517 | 39,465 | 62.1% |
| **Total** | **461,364** | **105,418** | **143,760** | **54.0%** |

Response-local collapse already recovers 22,387 of the bundled `rules` and 43,700 of the bundled `inherited_inputs`. What remains is split cleanly by which side of the boundary it falls on:

- **Cross-activity residue on the bundled path: 35,542 characters** (7,205 `rules` over 31 distinct blocks, 28,337 `inherited_inputs` over 16 distinct). This is content the *same context* received in an earlier activity of the same batch. It is exactly what the worker bundle already collapses via `hasDispatch`, and exactly what the step-technique path at `workflow-tools.ts:1039` refuses to.
- **The whole lazy path: 75,982 characters**, none of which collapses, because `dedupTechniqueBlocks` on `get_technique` is inside `if (referenceMode)` at `resource-tools.ts:837`. Of those, **65,719 characters (86.5%) are blocks this same context demonstrably already holds** — 33,123 of 36,517 `rules` and 32,596 of 35,468 `inherited_inputs`.

**The abstraction: deliver the contract by name.** One `contracts:` block per response keyed by ancestor group, and `contract: workflow-engine` on each technique. The projection has the seam and `dedupTechniqueBlocks` is half of it; what is missing is that the collapse is a per-response and per-mode accident rather than the composition's own output shape.

### C2 — `get_technique` does not record what it delivered, contradicting a documented invariant

`workflow-tools.ts:870-872` states the invariant: hashes are "Recorded in every mode so a later per-call reference opt-in can refer back to content that was delivered under the default full mode." `get_activity` honours it — `dedupTechniqueBlocks` stages into `newDeliveries` regardless of `ledgerLookup`, and `recordDeliveries` commits them at `:1295`.

`get_technique` does not. At `resource-tools.ts:836-843`, `blockDeliveries` is populated only inside `if (referenceMode)`, so a full-mode fetch commits `{ [ledgerKey]: hash }` and nothing else. The 75,982 characters of shared blocks that the 24 fetches carried in the recorded walk are delivered and unrecorded.

The failure is silent and asymmetric: a worker that fetches in full mode and then opts into `bundle: "reference"` on a later call — which is precisely the resumed-worker protocol described at `resource-tools.ts:798` — will be sent, in full, blocks it is holding, because the ledger has no record that they arrived. Whether the ledger describes the context depends on which tool delivered the bytes.

Fix: hoist the `dedupTechniqueBlocks` call out of the mode branch and use its `newDeliveries` output unconditionally, keeping the substitution mode-gated. Three lines, and it is a prerequisite for A2's saving being real on a resumed worker rather than only on a solo walk.

### C3 — `get_workflow` is the one delivery tool that cannot be scoped, and its collapse can never fire

`get_workflow` (`workflow-tools.ts:413-515`) has no `agent_id` parameter, no `bundle` parameter, and its collapse is gated on `state.contextMode === 'persistent'` with `deliveredHash(state, opsKey)` called without a scope argument (`:450`) — so it reads the session's own agent ledger whoever calls it. It is also called once per session by construction, so even in persistent mode the marker path is unreachable on any normal run.

What it delivers, measured through the server's own loaders:

| | work-package | meta |
|---|---:|---:|
| Orchestrator ops bundle | 79,312 | 98,555 |
| of which one merged `rules` record | **34,654 (43.7%)** | **37,248 (37.8%)** |
| 17–21 technique entries | 41,861 | 55,624 |
| Whole `get_workflow` response | **108,356** | 104,571 |

Two specific leaks inside that:

**The four harness variants ship together.** `harness-compat::claude-code` (1,060), `cursor` (1,055), `cline` (1,048) and `generic` (1,050) are all in `CORE_ORCHESTRATOR_TECHNIQUES` (`src/loaders/core-ops.ts`). One applies to any given run. **3,153 characters are always wrong**, and the selection is performed by `resolve-harness-operation` in prose after all four have been delivered. The prior report measured 4,410 with 3,297 always wrong; the current figures are 4,213 and 3,153.

**Orchestrator and worker rules overlap by 26 entries, roughly 11,695 characters**, and on a solo walk — which is what the benchmark and the CI gate measure — both land in the same context.

**The bootstrap budget is 97.9% consumed and does not measure the workflow the gate walks.** `tests/bootstrap-budget.test.ts` runs `meta` and reports 107,748 of 110,000 characters (`discover` 2,829, `start_session` 348, `get_workflow` 104,571) — 2,252 characters of headroom. The same three calls for work-package are 2,829 + 789 + 108,356 = **111,974, already over the stated budget**, and no test measures them. A guard that passes because it is pointed at the smaller of two subjects is the same shape as the leak this lens hunts: the bound is stated at one boundary and the traffic crosses another.

### C4 — The corpus's section-versus-whole rule asks agents to predict their own reads, and the two heaviest files are still chosen wrongly

`resource-section-or-whole` (engine `TECHNIQUE.md:36-38`, 1,028 characters) instructs an agent to choose between a bare id and a `#section` by "how much of the resource this agent context will need," and adds that "when the same agent context will need two or more sections from the same resource in the current activity … call `get_resource` once with the bare resource id."

Counting every reference in the two trees against the server's own `extractMarkdownSection`:

| Resource | Whole (chars) | Cited whole | Distinct anchors | Anchored citations | Union of anchors |
|---|---:|---:|---:|---:|---:|
| `work-package/review-mode.md` | 21,480 | 3 | 15 | 24 | **32,371** |
| `meta/planning-readme.md` | 15,547 | 7 | 10 | 38 | **21,077** |
| `work-package/codebase-comprehension.md` | 18,450 | 3 | 5 | 13 | 16,988 |
| `work-package/pr-description.md` | 6,545 | 0 | 6 | 16 | 6,346 |

For `review-mode.md` and `planning-readme.md` the union of the anchors exceeds the whole file — 150.7% and 135.6% respectively — because the anchors nest. `#review-comment-template` (14,238) contains `#header-fields` (3,943), `#severity-definitions` (1,233), `#reference-dont-restate` (938), `#caveat-form` (427), `#review-type-selection` (261) and `#prose-register` (212); `#review-categories` (6,333) contains seven more. `planning-readme#rules` (6,089) contains `#progress-table` (4,669), which contains `#item-cell` (1,359) and `#row-ownership-map` (958).

So the corpus addresses one 15,547-character file through **eleven distinct ledger keys across 45 citations**, and one 21,480-character file through **sixteen keys across 27 citations**. Under an extent-keyed ledger (B3) every one of those collapses to a single delivery of the file. The prior report's CTX-05 priced this at 3,325 and 4,171 characters of direct overlap; the larger figure is the key fan-out, which is what turns a single delivery into eleven cache misses.

### C5 — The delivered response text carries resource identifiers in a form that does not resolve

Sixteen of the 162 `get_resource` calls in the recorded walk return errors — 1,109 characters and sixteen round trips. Four of them are identifier-shape failures:

| Id | Error |
|---|---|
| `writing-register` | Resource not found in workflow work-package |
| `debt-ledger#template` | Resource not found in workflow work-package |
| `debt-ledger#rules` | Resource not found in workflow work-package |
| `l12` | Resource not found in workflow work-package |

`extractResourceIds` (`src/utils/resource-ref.ts:80-92`) takes a markdown link, finds the last `resources/` segment, and keeps everything after it — so `../../../meta/resources/writing-register.md`, the exact form used at `work-package/techniques/manage-artifacts/TECHNIQUE.md:95` and `work-package/resources/review-mode.md:103`, becomes the bare slug `writing-register`. The one piece of information the link carried — which tree — is discarded, and `qualifyResourceId` (`:102-113`) then reconstructs it from where the *citing file* lives, which for a cross-tree link is the wrong answer. For a same-tree link the two sources agree, which is why this is invisible until a link crosses a tree.

**The abstraction: parse the link into a qualified reference at extraction, rather than flattening it and re-deriving the qualifier.** The path segment before `resources/` already names the workflow; keeping it makes `qualifyResourceId`'s fallback a fallback rather than the only source of truth.

The remaining twelve errors are `review-mode#consolidated-review-format`, a section that does not exist in `review-mode.md`. It is named in the benchmark's own `HOT_RESOURCES` list (`scripts/run-token-benchmark.ts:166`) and nothing checks that list against the corpus — `scripts/check-resource-anchors.ts` walks the definition trees, not the instrument. Twelve failing calls are baked into the committed baseline the CI gate compares against.

### C6 — 26.8% of the number the gate defends is a property of the harness, not of the corpus

Splitting the recorded walk's 162 resource calls by why they were issued:

| | Calls | Chars |
|---|---:|---:|
| First delivery of a distinct id | 77 | 173,747 |
| Re-fetch of one of the seven `HOT_RESOURCES` on a later `get_activity` | 66 | **349,162** |
| Re-fetch reached through a link | 3 | 3,665 |
| Errors | 16 | 1,109 |

`review-mode` alone accounts for 254,868 of the total — twelve deliveries of a 21,239-character body, 19.6% of the entire walk. `pr-description` adds 77,700 over twelve.

The hot set is a deliberate probe: `run-token-benchmark.ts:451` describes it as "a fixed hot-template set re-fetched on every `get_activity` (cross-activity repeat tax)." It models a worker that does not honour `fetch-costs-what-it-delivers`. That makes it a defensible instrument, but it also means **349,162 characters — 26.8% of the 1,302,319 the gate defends — measure a modelled agent behaviour rather than anything in the two definition trees.** A corpus edit that removed every anchor in `review-mode.md` would not move the gate; changing one entry in a seven-element array in a script would move it by 20%.

This is the leak that matters most for the programme rather than for the run: the measurement boundary claims to price the corpus and in fact prices the corpus plus a harness constant, and the two are not separated in the reported number.

### C7 — The worker bundle's rules block is set-valued and keyed as a scalar

The remaining worker-bundle cost after CTX-01's fix sits almost entirely in one activity. The recorded per-activity `worker_bundle_chars`:

```
start-work-package    35,204     lean-coding-audit       543
design-philosophy     24,311     post-impl-review        543
codebase-comprehension   620     validate                543
plan-prepare             620     strategic-review        543
assumptions-review       620     submit-for-review       543
implement                620     complete                543
                                 TOTAL                65,253
```

The second activity pays 24,311 because it is the first to declare `scatter-gather`, which takes the bundle from five techniques to six and, with it, the merged rules record from 18,754 characters to 20,426. The key is `bundle:rules:<hash>` (`workflow-tools.ts:910`) — content-keyed over the *whole merged record* — so the six-technique rule set is a different key from the five-technique one and ships whole to carry the difference. Seven work-package activities declare `scatter-gather`; five of the twelve walked ones do, and they alternate with the seven that do not, which is why the fifth activity's return to the smaller set collapses correctly (543) while the second's expansion does not.

Approximately **18,754 of that 20,426 is content the context received one call earlier.**

**The abstraction: content-key each rule, not the merged record.** `formatTechniqueBundle` already flattens rules to an array of `[name, line]` pairs (`technique-loader.ts:663-667`), so the per-entry key is one line of code away. The same change fixes the corresponding case one level down — `dedupTechniqueBlocks` splits `inherited_inputs` into `note` and `items` but still hashes `items` whole, so a technique whose inherited set differs by one entry re-ships all of them. That is 28,337 of the 35,542 cross-activity residue in C1.

Measured incidentally: the rules arrays are otherwise clean. Of 73 entries in work-package's orchestrator bundle only one pair duplicates (`resume`, 918 characters), and the worker bundle's 42 entries are all distinct.

### C8 — Behaviour that only a comment encodes

Three couplings in the delivery layer are documented in prose and enforced by nothing:

- `src/utils/delivery.ts:92-98`: `DEDUP_BLOCKS` "mirror `projectTechnique`'s key strings, so renaming those keys must update this list." Two string lists in two files, no shared constant, no test that compares them.
- `src/utils/resource-delivery.ts:14`: `hash` "must match get_resource ledger hashing." Two call sites compute `contentHash(fullText)` over independently constructed `fullLines` arrays (`resource-delivery.ts:50-58` and `resource-tools.ts:926-934`). The two arrays are currently identical, line for line. Nothing asserts that they remain so, and a divergence produces a silent cache miss rather than an error.
- `workflow-tools.ts:933-935`: bundled entries "share the `technique:<resolvedId>` delivery-ledger key with `get_technique`, so persistent-context refetches of bundled content collapse to unchanged-references in either direction." B1 measures that they do not, seven times out of eight, and the comment is the only place the claim appears.

---

## The leak law

**The boundary with the widest blast radius is the delivery ledger's unit of identity.**

Every collapse in this system is a hash comparison against a key, and every key names a *composition output* rather than a *composition input*. So any internal change to composition — a step-bound `source:` annotation of five characters, one extra rule merged from one extra ancestor, one more entry in an inherited-input list — changes the hash of every payload that carries it, and every consumer of that key takes a full delivery instead of a marker.

The blast radius is measurable at three scales, and it is the same defect each time:

- **Five characters** of step-bound provenance invalidate four deliveries of a 7,600-character technique: 22,940 characters lost to a three-character difference.
- **One technique** added to an activity's declared set invalidates a 20,426-character rules record of which 18,754 characters are unchanged.
- **One entry** added to a group's input contract invalidates the whole `inherited_inputs.items` block for every technique in that group: 28,337 characters on this walk, 242,962 across the corpus.

The fix is the same at all three scales, and the codebase already contains it in miniature: `dedupTechniqueBlocks` hashes `inherited_inputs.note` apart from `inherited_inputs.items` for exactly this reason, and the comment at `src/utils/delivery.ts:134-137` states the principle — "the invariant `note` and the `items` list are hashed separately so a shared preamble collapses across techniques whose own-input sets differ." The principle is right and it is applied to one field. Applied to the composition as a whole — invariant core keyed separately from per-binding delta, set-valued blocks keyed per element, resources keyed by extent rather than by identifier string — it collapses every remaining duplication this lens found.

The second-order observation is that the ledger's other boundary, *whose* context holds the bytes, is answered five different ways by five call sites (A1), and that the one call site that answers it correctly is the one that recovered 381,520 characters. The remaining 410,880 is the same answer applied to the other four.

---

## Opportunity enumeration

Savings are characters per twelve-activity work-package walk against the recorded 1,302,319 baseline. Items are independent unless a dependency is stated; where two overlap, the overlap is noted so the figures are not summed twice.

| # | Opportunity | Saving | Surface | Build |
|---|---|---:|---|---|
| **1** | Derive reference delivery from `hasDispatch(state, scope)` on `get_technique` and `get_resource`, as `get_activity` already does (A2, B2) | **410,880 (31.5%)** | `resource-tools.ts:801`, `:940`; `workflow-tools.ts:1039` | 3 lines plus tests. No corpus change. Land item 2 first. |
| **2** | Record block hashes on `get_technique` in every mode, per the invariant `get_activity` already honours (C2) | 0 directly; makes item 1's saving hold on a resumed worker rather than only a solo walk | `resource-tools.ts:836-843` | 3 lines. Prerequisite for 1. |
| **3** | Split the composed technique into invariant core and step-bound delta, keyed separately (B1) | 19,285 beyond item 1; 97,330 of 145,653 recoverable in total | `delivery.ts`, `binding-provenance.ts:366-418`, both delivery paths | ~60 lines, mirroring the `note`/`items` split already present. |
| **4** | Extent-keyed resource ledger: key by (file, byte range) so a section is a sub-range of a delivered file (B3, C4) | 21,656 and 8 round trips within item 1's total; removes 11 and 16 ledger keys on the two heaviest files | `resource-tools.ts:936-942`, `resource-ref.ts` | ~60 lines. `coveredByItsFile` and `extractMarkdownSection` supply the parts. |
| **5** | Content-key each rule and each inherited item, not the merged record (C7, C1) | 18,754 on the worker bundle; 28,337 of cross-activity inherited residue — inside item 1's total | `workflow-tools.ts:908-916`, `delivery.ts:159-185` | ~40 lines. Measure the sealed-ledger cost first: keys grow from 265 to low thousands. |
| **6** | Retire the eager-delivery character budget, the per-resource cap and `bundleTechniques` (B4) | 0 characters, ever | `workflow-tools.ts:948-957`, `:1034`, `:1140`, `resource-delivery.ts:6`, `activity.schema.ts:287` | Removes ~80 lines and 41 sites for a knob no activity in 21 trees uses and whose schema text contradicts the behaviour. |
| **7** | Resolve resolvability once at authoring time instead of loading every resource body to discard it (B5) | 0 wire characters; ~64 whole-file reads per walk | `workflow-tools.ts:1163-1181`, `scripts/check-resource-anchors.ts` | Small, and it removes a mode-dependent I/O path. |
| **8** | Qualify a resource link at extraction from its own path rather than re-deriving it from the citing file (C5) | 4 failing calls per walk; content that presently never arrives | `resource-ref.ts:80-113` | ~15 lines. Extend the anchor guard to resolve through the delivery path. |
| **9** | Cut the eight delivery-mechanics rules from the engine group contract, keeping the synthesised response notes (A4) | 4,792 per composed engine technique; multiplied by the engine techniques each activity carries. Strictly after items 1–5, which change what the notes must say. | `meta/techniques/workflow-engine/TECHNIQUE.md` | Definition edit. Confirm the template and audience guards accept a shorter rules section. |
| **10** | Select the harness variant before delivery instead of shipping all four (C3) | 3,153 per session | `core-ops.ts`, `get_workflow` | Needs the harness identity at `start_session`; today it is resolved in prose after delivery. |
| **11** | Point the bootstrap-budget test at every workflow, not only `meta` (C3) | 0; the guard currently reports 107,748/110,000 while work-package's own bootstrap is 111,974 | `tests/bootstrap-budget.test.ts:26-64` | ~10 lines. Do it before item 9 so the trim has a gauge. |
| **12** | Separate the harness's hot-resource probe from the corpus figure in the gate's report (C6) | 0; 349,162 of the gate's 1,302,319 is currently a harness constant | `run-token-benchmark.ts:160-168`, `:465-469` | Report two subtotals. Also fix `review-mode#consolidated-review-format`, an anchor in the probe list that no longer exists and costs 12 failing calls per recorded walk. |

**Independent total on the wire: 410,880 from item 1, plus 19,285 from item 3, plus 3,153 from item 10 — 433,318 characters, 33.3% of the current walk.** Items 4, 5 and part of 3 are inside item 1's measured total and are what make it robust rather than mode-dependent; items 6, 7, 11 and 12 save no characters and are the ones that make the remaining measurements trustworthy.

For scale: the run is currently 1,302,319 characters, down 26.8% from 1,780,292. Item 1 alone would take it to 891,439 — below the 1,355,532 of the July reference by 34.2%, and it requires no definition edit and no new machinery.
