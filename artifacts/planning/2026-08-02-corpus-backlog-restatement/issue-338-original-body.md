# Issue #338: Corpus backlog: unfinished work from #189, #232, #323, #324

Captured verbatim on 2026-08-02, immediately before the body was restated to the epic structure. This capture preserves the full done-ledger, the per-item provenance (which superseded issue and item id each entry came from), and the carried-items list.

---

Five issues closed with their pull requests only partially merged, leaving work behind. This issue consolidates the half of that work that lives in the **corpus** — the workflow definitions themselves, held in the `workflows` submodule: workflow definitions, activities, techniques, and resources. A companion issue carries the server half.

Superseded issues: #189, #232, #323, #324. Each item below names the issue and item id it came from, so the original evidence stays reachable.

**Companion issue: #365** — the server half. Every "companion issue" reference below means that one. (#365 supersedes #337, which is closed; W1's gate was satisfied there by #356 before it closed.)

**Delivery routing: #343** — which of these items ride together in a pull request, in what order, and which stay out.

Each item opens in ordinary language — what the problem actually is, readable without knowing the corpus shorthand — with the technical detail after it.

## Scope

`workflows` submodule only — workflow definitions, activities, techniques, resources. Server items are in #365.

Two items are gated on server work landing first (W1, W6); that is stated per item rather than assumed.

---

## W1 — Relax `workers-need-full-delivery` to a fresh ledger per worker · S

The corpus carries a blanket rule telling the server to send every worker everything from scratch, reusing nothing. That rule is not there because full delivery is desirable — it is there to dodge a server bug where one worker's deliveries are wrongly credited to another. Once the server files deliveries per worker, the blanket ban is too strong: the right rule is "each worker starts with an empty slate *of its own*". Three separate documents describe what a worker receives, and all three have to move together or they will contradict each other.

From **#323 T3** (corpus half). **Blocked on the server ledger re-keying** in the companion issue — do not start before it lands.

In detail: the rule `workers-need-full-delivery` forbids `persistent` delivery outright, because the delivery ledger — the server's record of what has already been sent — is kept per session, so it records deliveries to worker contexts that no longer exist. Once the ledger is namespaced per receiving context, that prohibition is over-broad, and it is the only thing keeping ≈96k tokens per 12-activity walk out of reach.

- [x] `workers-need-full-delivery` relaxed from "no ledger" to "fresh ledger per worker" — renamed `delivery-keys-on-agent-context` in #355; the predicate is now "is this the same agent context?" rather than "is this a worker session?"
- [x] `dispatch-activity` and `create-session` updated coherently — the three surfaces must not disagree about what a worker receives. #355 swept `dispatch-activity`, `activity-worker`, `compose-prompt`, `harness-compat::continue-agent` and all four citation sites.

## W2 — `commit-and-persist` assumes planning artifacts live in the parent repo · M

The instruction for saving planning documents assumes they sit in an ordinary folder of the main repository. In this repo they do not — they live in a nested checkout of their own (a git submodule), which needs a different git command entirely. The instruction also has no answer for where the resulting pointer update should land: the branch it would have to go to accepts changes only through pull requests, so a direct push is not available.

From **#324 A8**. In detail: the operation prescribes `version-control::commit-regular-files` for everything under `.engineering/artifacts/`, but in this repo `.engineering` is an infrastructure submodule (per `infrastructure-submodule-paths`), so the correct primitive is `commit-submodule`. The technique also has no answer for where the parent's submodule-pointer bump lands: `main`'s first-parent history is 100% PR merges, and `origin/main`'s `.engineering` pointer is already deliberately behind.

- [x] Branch the technique on submodule-ness — `commit-and-persist` step 5 resolves the primitive from the layout via `version-control.infrastructure-submodule-paths` (#360)
- [x] State that the pointer bump lands via PR, not a direct push to a PR-only branch — stated as the third note on step 5 (#360)

Related and already fixed on the review path: PR #274 Pass D routed `publish-review-artifacts` step 2 through `manage-git::artifact-commits` for the same class of defect. This is the general case that path did not cover.

**Same defect class as #319 item 6**, which names four further sites carrying the parent-repo assumption on the PR-description path. Worth taking in one pass — fixing either alone leaves the class live.

## W3 — Write the usage and cost record into the planning artifact on completion · S

Once the server can total up what a run cost, that figure should be written into the run's own paperwork when it closes, so each work package carries its own cost record instead of the number existing only in server state that nobody reads.

From **#232 US-3**. **Consumes the server-side aggregate** in the companion issue; the per-activity rows already exist (`inspect_session view: usage`, PR #329).

- [x] On completion, per-activity and per-workflow usage plus the cost estimate appear in the appropriate planning artifact, so each work package carries its own cost record

**DONE — verified 2026-08-01 at `workflows@46bc1811`.** Client close-out mints `token-usage.md` as the run's sole cost home (`readme-seed` row 28; `session-trace.md` and `complete-wp-guide` link it rather than restating), and meta's `revise-session-metrics` (#369) rewrites it after the client exits from the rolled-up `activity_usage` — per-activity tokens, duration, model, `priceTableVersion`, and cost from the #366 server aggregate — so the terminal activity is included.

Natural home is the close-out path — `conduct-retrospective` / activity 14 — alongside the existing Progress Status write.

## W4 — Content-defect sweep and checkpoint-message lint · S

Two things. First, an earlier review found five content defects and no backlog item ever owned fixing them, so they are still there. Second, checkpoint messages sometimes refer to a value that nothing in the workflow ever sets — so the message renders with a hole in it, or the gate it guards can never fire. That has now happened at least three times in different places, which makes it a class worth an automated check rather than another manual sweep.

From **#189 C3** (cluster 4, never shipped). The five content defects the original schema/technique/disclosure review found were never fixed — no backlog item owned them. Plus a lint for checkpoint messages that reference variables nothing sets.

The lint half may want a script in the server repo; the defects are corpus. Note that #324 A2 was exactly this shape (a checkpoint conditioning on `workflow_match_ambiguous`, which no step wrote) and #335 found two more — a class worth a guard rather than a sweep.

**Update 2026-08-01 — the lint half now exists.** `check-binding-fidelity`'s read-resolution walks checkpoint **message** `{token}` reads, and since #364 (#341 R1) also `when` / `validate` gate expressions — so a checkpoint message or gate naming a value nothing produces is a guard finding today, not a manual sweep. What remains of W4 is the five #189 C3 content defects, which are still unenumerated anywhere except that issue's evidence.

## W5 — Burn down the `fix-later` binding-fidelity entries · M

**DONE — #336 is closed.** It carried the full evidence, the two rationale classes and the per-class plan (R1–R5). The burn-down landed in #367 (corpus) and #368 (guard reach): the ledger went from 196 triaged entries to 78, and every one of the 78 is `harmless` — zero `fix-later` remain. The gate recorded here held in the right order, too: #342 landed first (in #364), so the masking defect was fixed before the count was burned down.

Note the gate recorded there: **#342** must land first. That guard defect is currently dropping real entries out of the ledger and reporting them as closed, so the count understates the debt until it is fixed.

## W6 — Fragments phase 2 · M

Shared boilerplate was supposed to be written once and referenced from everywhere that needs it — those shared pieces are called fragments. The conversion was never finished: some inline copies remain, some of the shared pieces duplicate each other, and activity rules still cannot reference a shared piece at all. That last one needs a schema change, so it cannot start on the corpus side.

From **#189 C10** (cluster 4, never shipped).

**Update 2026-08-01:** fragments live as per-workflow `fragments:` blocks in `workflow.yaml` (`WorkflowFragmentsSchema`; `scripts/fragments-index.ts` mirrors the loader). Exactly three inline ORCHESTRATION MODEL copies remain at `workflows@46bc1811`: `prism/workflow.yaml`, `prism-audit/workflow.yaml`, `remediate-vuln/workflow.yaml`.

- [ ] Convert the last inline ORCHESTRATION MODEL copies to fragment refs
- [ ] Dedupe fragment bodies
- [ ] Allow refs in activity rules — **schema change, so the server half gates this sub-item**

## W7 — Migrate the 17 `when` uses once the merge is decided · S

The schema has two ways to write a step condition, and the server side is deciding which one survives. Once that is settled this is a mechanical find-and-replace across seventeen places. It is listed on its own purely so it is not forgotten at the moment the schema actually moves.

From **#189 C8** (corpus half). **Gated on the server-side decision and schema change.** Mechanical once the target shape is fixed; listed separately so it is not forgotten when the schema moves.

**Update 2026-08-01 — the count is stale.** `when:` now appears at roughly 67 sites across 18 activity files at `workflows@46bc1811` — `workflow-authoring` alone carries 32 — against the 17 of the #189-era measurement. Still mechanical, but about four times the size, and growing with each workflow built on the `when` dialect.

## W8 — B12 retire sweep at the next schema major · S

The corpus half of a cleanup that can only happen when a breaking schema version is cut. Nothing to do until then; recorded so it is not lost.

From **#189 C13** (corpus half). Nothing to do until a major is cut.

---

## Carried items that are already resolved — recorded, not to be redone

- **#324 A1–A7, D4** — closed by #328 (`user_request` binding, the `workflow-selection` gate, `create-pr` consent ordering, `issue_type` derivation, `view-issue` `--json` form, prefixed README seed links, `depth-1-only` concurrency contract, the handoff convention).
- **#324 D1** — spawn stubs carrying identity bindings only. The convention is now written down in `compose-prompt::context-travels-as-state` and on `activity-worker` (#328 D4). The caveat it carried — prefer bare file paths over `#section` anchors in handoffs — stands until **#141** lands.
- **#189 C1/C6** — cluster 1, shipped 2026-07-10 (#207, #208, #209).
- **#189 C1's `bundleTechniques` opt-ins** — dropped by design; automatic context-derived bundling replaced them.

## Sequencing

**Status 2026-08-01:** W1, W2, W3 and W5 are done. W4's lint half is covered by the binding-fidelity guard; its five content defects are the live remainder and are unblocked. W6's first two bullets are unblocked; its third bullet and W7 wait on schema changes. W8 waits on a major.

W2 is best taken together with **#319**'s live items, since #319 item 6 is the same defect class at four further sites.

