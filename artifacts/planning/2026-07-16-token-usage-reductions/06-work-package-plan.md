# Work package plan — fidelity-safe token-usage reductions

## 1. Problem / opportunity

**Already fixed:** Eager step-technique bundling (~74% `technique_bundled` vs `technique_fetched`). Remaining lazy `get_technique` calls are mostly correctly gated (`when` / `condition`); do not ungate to force bundling.

**Still burns tokens:**

1. Solo multi-activity walks often leave `contextMode` unset. The session builds a large `deliveredContent` ledger, but full-mode delivery never collapses ops/rules / inherited activity bundles across activities.
2. `get_resource` always returns full content. Hot templates (`pr-description`, `meta/activity-worker-prompt`, `probe-catalog`, `review-mode`, `design-context-readme`, …) are re-paid on every fetch. Resources are outside the delivery ledger today (`resource_fetched` is observability-only).
3. Some techniques pull whole resource files where a `#section` anchor would suffice (section fetch already supported).

**Opportunity:** Adopt the existing persistent reference-delivery path for solo walks (Opt1), extend the same ledger to resources (Opt2), and narrow a few hot refs to sections (Opt3).

## 2. Option decision (v1)

| Opt | Include? | Rationale | Risk |
|-----|----------|-----------|------|
| **1** Solo `context_mode: "persistent"` + stable `agent_id` | **Yes — corpus** | Existing server feature; highest unused saving; guidance in meta bootstrap only (D3) | Low — wrong topology under-delivers; mitigated by solo-only guidance + fresh default |
| **2** Resource reference delivery | **Yes — server** | Closes repeated-template tax; mirror `get_technique` | Med — must key by `agentId`, keep events, force-full escape; avoid changing `recordDeliveries` signature (GitNexus CRITICAL callers) |
| **3** Prefer `#section` resource refs | **Yes — corpus, narrow** | No protocol change; only hottest whole-file pulls on the reference path | Low — section must still contain what the step needs |
| **4** Split `activity-worker-prompt` | **Defer** | Largely subsumed by 1+2 for solo; fresh workers still need full prompt once | — |

**Non-goals**

- Ungate conditioned steps to increase bundling rates.
- Inline resources into `step_techniques`.
- Force `context_mode: "persistent"` on fresh per-activity dispatched workers.
- Require ADR-0006 usage relay for the ship gate (D2).
- Duplicate solo-topology notes into client workflows (D3).

**Sequencing (D1):** Coordinated pair — open both PRs together; **merge server (Opt2) before or with corpus** if corpus docs describe resource unchanged markers. Opt1 guidance can mention resource collapse only after Opt2 lands, or phrase it as “same rules as `get_technique` once resources participate in the ledger.”

## 3. Change surface

### 3.1 Server (Opt2)

**Worktree:** `~/projects/work/workflow-server/2026-07-16-token-resource-reference/`  
**Branch:** `feat/token-resource-reference-delivery` off `main`

| Path | Change |
|------|--------|
| `src/tools/resource-tools.ts` | `get_resource`: when `contextMode === 'persistent'` and `full !== true`, if ledger hash matches, return unchanged marker; else deliver full body and `recordDeliveries`. Always append `resource_fetched`. Add optional `full?: boolean`. |
| `src/utils/delivery.ts` | Documentation only — add `resource:<resource_id>` to the key-namespace comment. **Do not** change `recordDeliveries` / `unchangedMarker` signatures. |
| `docs/api-reference.md` (+ tool description strings) | Document resource reference delivery + `full: true` escape. |
| `schemas/` / generated docs if tool schemas are published | Additive `full` param only. |
| `tests/reference-delivery.test.ts` | Persistent collapse, `full: true`, different `agentId`, `#section` key isolation, fresh mode unchanged, `resource_fetched` on collapse. |

**Ledger key (D4):** `resource:<exact resource_id as passed>`, including `#section` when present. Bare `pr-description` and `pr-description#assumptions` are distinct keys.

**API:** Additive optional `full` on `get_resource`. **Not BREAKING.** Default/fresh behavior unchanged.

**Impact note:** Prefer calling existing `contentHash` / `deliveredHash` / `recordDeliveries` / `unchangedMarker` from the handler. Changing `recordDeliveries` itself is CRITICAL blast radius — out of scope.

### 3.2 Corpus (Opt1 + Opt3)

**Worktree:** `~/projects/work/workflows/2026-07-16-token-usage-solo-persistent/`  
**Branch:** `feat/token-usage-solo-persistent` off orphan `workflows`

| Path | Change |
|------|--------|
| `meta/resources/bootstrap-protocol.md` | Strengthen solo vs dispatch decision: when to pass `context_mode: "persistent"`, one canonical `agent_id`, force-full escapes; explicitly forbid persistent on dispatched workers. After Opt2: note `get_resource { full: true }` parity with techniques. |
| Hot technique resource links (narrow) | Convert select whole-file `get_resource` targets used on the reference walk to `#section` anchors where only a section is needed. |
| Meta agent-conduct + bootstrap | Rule: ≥2 sections needed from one resource in the same activity → bare fetch once; single slice → `#section`. |
| Client workflows (`workflow-design`, `work-package`, …) | **No** solo-topology notes (D3). |
| `dispatch-activity.md` | Leave “never persistent on workers” as-is (already correct); no expansion required unless a one-line cross-link helps — prefer bootstrap as single source of truth. |

Never edit the main checkout’s `./workflows` worktree in place for this WP.

### 3.3 Planning / benchmark (this folder)

| Path | Role |
|------|------|
| `20-token-benchmark.md` | Protocol + results tables (filled at execute) |
| This plan / test plan | Spec only until execute |

## 4. Worktree + PR plan

### Create (at execute)

```bash
git -C ~/projects/main/workflow-server worktree add \
  ~/projects/work/workflow-server/2026-07-16-token-resource-reference \
  -b feat/token-resource-reference-delivery main

git -C ~/projects/main/workflow-server/workflows worktree add \
  ~/projects/work/workflows/2026-07-16-token-usage-solo-persistent \
  -b feat/token-usage-solo-persistent workflows
```

### PR sequencing

| Order | PR | Contents |
|-------|----|----------|
| 1 | Server | Opt2 + tests + api docs |
| 2 | Workflows | Opt1 bootstrap + Opt3 section refs; docs that assume resource markers only after (1) is merged or clearly version-gated |

Prefer **two PRs**; never mix server and corpus commits in one worktree/PR.

### Review checklist

- [ ] Fresh / omitted `context_mode`: full resource body every time
- [ ] Persistent + same `agentId`: second identical `resource_id` → unchanged marker
- [ ] Persistent + `full: true`: full body
- [ ] Different `agentId`: full body
- [ ] `#section` vs bare id do not share ledger keys
- [ ] `resource_fetched` still recorded when collapsed
- [ ] Bootstrap forbids persistent on dispatched workers
- [ ] No client-workflow solo notes added
- [ ] No step ungating; no resource inlining into `step_techniques`
- [ ] Server tests + typecheck green; corpus lint/guards green

## 5. Implementation tasks (when execute approved)

| ID | Track | Task | Est. |
|----|-------|------|------|
| S1 | Server | `get_resource` reference path + `full` param | 1–2h |
| S2 | Server | Docs + delivery.ts namespace comment | 30–45m |
| S3 | Server | `reference-delivery` tests | 1–2h |
| C1 | Corpus | Bootstrap solo/persistent adoption text | 30–60m |
| C2 | Corpus | Narrow `#section` ref updates on hot pulls | 30–90m |
| B1 | Planning | Benchmark harness → `scripts/run-token-benchmark.ts` / `npm run bench:token` | 1–2h |
| B2 | Planning | Run before/after (+ ablations); fill `20-token-benchmark.md` | 1–2h |

## 6. Rollout / adoption

| Topology | Instruction |
|----------|-------------|
| **Solo** (one agent context runs every activity) | `start_session { …, agent_id: "<canonical>", context_mode: "persistent" }`; reuse the same `agent_id` on resume; after summarization use `get_activity { bundle: "full" }`, `get_technique { full: true }`, `get_resource { full: true }` |
| **Dispatch / fresh workers** | Omit `context_mode` or `"fresh"`; never persistent on worker sessions |

**Migration:** None. `contextMode` remains optional; existing sessions keep full delivery until restarted with persistent. No schema migration.

**Adoption:** Meta bootstrap is the single instructional surface (D3). Success of Opt1 is measured by benchmark + later session sampling (`contextMode === 'persistent'` on solo walks), not by scattering notes into every client workflow.

## 7. Success metrics (ship gates)

| Gate | Threshold |
|------|-----------|
| **B — ops/bundle (Opt1)** | ≥40% reduction in sum of `get_activity` + `get_workflow` ops/bundle response payload chars on the reference walk **or** ≥50% reduction in full ops-bundle redelivery on activities 2..N (unchanged-marker / char proxy) |
| **B — resources (Opt2)** | ≥60% reduction in repeated full resource payload chars for resources fetched ≥2× (event count may stay similar) |
| **C — calls** | No unexpected increase in MCP call totals; report by tool name |
| **A — tokens** | Optional; record if harness/relay available; **not** a ship blocker (D2) |
| **Fidelity** | Zero increase in technique-fidelity warnings on reference walk; zero resource/technique unchanged markers on a fresh-worker control walk |
| **CI** | Server worktree: `npm run typecheck` + `npm test` green; corpus worktree: definition lint / binding guards green |

## 8. Deferred

- Opt4: split `activity-worker-prompt` into static body + binding stub
- Corpus relay of ADR-0006 `usage` on `next_activity` (depends on #233 merge) — track separately
- Client-workflow solo notes — only if post-merge adoption sampling shows bootstrap insufficient
- Slim bootstrap / dedupe into techniques without breaking `discover` — [#237](https://github.com/m2ux/workflow-server/issues/237) (see [deferred-items](deferred-items.md))
