## Summary

Three properties of a workflow session are currently decided in the wrong place. The first is its starting state: some uses of a workflow need certain variables locked to specific values before the first step ever runs — a security remediation that must stay private from step zero, a review run that must advance headlessly. Today the only way to ship a different seed set is to clone the workflow: one production workflow is a roughly 200-line wrapper whose real payload is three seeded values, three isolation rules, and one start activity. The second is its setup facts: which repository the session binds, where its planning folder lives, the session record itself — values derivable mechanically at creation time, yet currently produced by agents hand-executing an algorithm written as prose. The third is whether a session already exists: opening one a second time into the same planning folder is how a run is resumed, and today it silently overwrites the run it was meant to continue.

All three are the same missing shape: work that belongs at session creation — fixed before the first step, auditable, checkable by static guards, and never re-decided or re-derived mid-run by an agent.

## The three gaps

**A different starting state means cloning the workflow.** Seeded defaults are declared per workflow, and nothing else can fix a session's variables before execution begins. So the private-remediation case ships as a wrapper workflow, and the review case ships as a mid-run detection step plus activation checkpoints with the interaction posture riding along as rule text. Both are curated presets over the same base graph, and both want the same guarantee: because the values are fixed from step zero, safety gates hold from the first step, and a static guard can verify what is reachable against the preset's values rather than trusting a selection made at runtime. There is no window where the session runs open on defaults, no runtime checkbox to get wrong, no dependence on steps running in the right order.

**Setup facts are derived by agents following prose, and the prose has been wrong.** Working out which repository a session binds is a forty-eight line algorithm an agent hand-executes every run: resolve the top level, climb while the parent claims the directory as a submodule, classify the crossings, parse either remote URL form, then assert the names agree. Three validations exist alongside it purely because the server cannot check the answer. It has failed in production. One run bound a repository named in a link rather than derived from the checkout, created an empty directory where the reviewer expected source, and looked healthy throughout. The same fault elsewhere threw a whole session away at a cost of 81,762 tokens. A planning folder was once minted under the dated fallback instead of its intended name and written into for three days across six commits. A temporary session was never promoted and its child written as the top-level record, inverting the documented nesting.

In none of these did an agent get arithmetic wrong. Each is the same shape: the prose named the wrong source and nothing checked the answer. A rule that lives as prose has no test, no type, and no guard, so a wrong rule ships silently and every run pays it until someone notices.

**Resuming a run rebuilds it instead of continuing it.** A meta session opens with no planning folder, so the server keeps it in a temporary one and the first dispatch promotes that session onto a stable folder named by the planning slug. On a resume the same sequence runs again, promotion asks for the folder for that same slug, and — finding it already occupied by the previous run — writes the new session over it with a freshly built child inside. The identifier is derived from the folder plus the slot the child occupies, and both runs use the same slot, so the caller is handed back the identifier the previous child had. Nothing in the response suggests anything was lost, the identifier resolves, and every subsequent call succeeds against an empty session. Measured on a real work-package: a cursor and one completed activity before, an empty cursor and none after, five history events reduced to two, the same identifier throughout. No guard or test covers the second-dispatch path, which is why it went unnoticed.

## The work

**W1 — Profiles.** A named preset declared against a base workflow: seeds laid over the workflow's defaults at session creation, plus an interaction posture. A profile carries values only — it never overrides the starting activity or contributes content, so the wrapper workflow stays as the documented pattern for a specialisation with real content of its own, and shrinks instead by inheriting the base workflow's variable declarations rather than restating three quarters of them. Seeds may be locked, and a write to a locked value is dropped and reported rather than recorded. Posture is an ordinary declared variable that a profile seeds, not a parallel field beside the state it would duplicate. The catalog lists profiles so a request matches them the way it matches workflows; session creation names the workflow and the profile separately and records the seeding in session history, so it is auditable and survives a resume; guards evaluate reachability per profile and validate seed values against the declared variable types. Detection steps whose only job is setting a value a profile already fixes gate on the value not yet being set, so a preset makes them statically unreachable. Review mode is the first profile; the private-remediation case keeps its seeds in the wrapper, where the guard that proves its guarantee already reads them.

**W2 — Server-side bootstrap.** Session start, or a bootstrap variant of it, takes the working directory, derives the repository from its git metadata, creates the session, and resolves the planning folder in one call — so the derivation lives in one tested place instead of being re-executed from prose every run. Where the server cannot decide — several candidate components, a binding that disagrees with the folder found, a saved session that might be the one to resume — it keeps the work it completed and returns the open decision with its candidates and a recommendation, for the orchestrator to put to the user. It also closes a gap left open when the binding fix shipped: session start still accepts a repository whose mapped directory is neither present nor a checkout, and creates it. The throwaway-session-then-promote machinery retires with this change, along with the process-local registry the code documents as fragile across restarts and which has already mis-promoted a session once.

**W3 — Attaching to a session that is already there.** A dispatch into an occupied folder continues the child it finds, with its cursor, completed activities and variables intact, rather than replacing it; a resumed run is visible in the response and in the folder's history. This is the promote-over-the-folder path W2 retires, so the two are one change: whoever moves session creation server-side decides what happens when the folder is already occupied. A guard belongs with it, since nothing today covers a second dispatch.

Six faults a straightforward reattach walks into are already known, each found by reviewing a first attempt that was written and then taken back out, and each only visible once the previous was fixed. **A session that cannot be read is not a session that is absent** — the likeliest cause is a rotated key, which leaves the content perfectly intact, and refusing the dispatch costs the caller one call where continuing costs them the run. **Whether a child has finished is not recorded where the reattach looks:** the embedded reference reads running for ever for a dispatched child, so reading it resumes a completed workflow onto its close-out activity and runs it a second time, observed on the real corpus with completion recorded twice. **A cursor can point somewhere that cannot be entered** — a terminal marker, or an activity the workflow no longer declares — and strand the run, because only a worker's result moves the pointer. **The identifier is recorded in two places and only one resolves it,** which shows up once the folder has moved, exactly the case the refresh exists for. **A run abandoned at a checkpoint is the most likely thing to resume and the hardest,** because every tool refuses until the checkpoint is answered and every step that could answer one is gated on a worker's result. And **order inside the folder is load-bearing,** since an identifier is derived from the slot a child sits in, so carrying children forward has to keep each one where it was. Two smaller ones: the arguments a caller passes on a resume are silently ignored if the saved child is adopted whole, and the previous session's own history is lost even when the child's is preserved.

## Why now is cheap

The wrapper workflow already isolates exactly what a profile needs to carry — its diff against the base is the first profile's content, written and shipped. The review mode's detection-and-activation machinery likewise names its seed and posture precisely. For the bootstrap item, the server already performs most of the deterministic half — slug resolution, planning-folder search and creation, migration, and repository binding are all server-side today — so it completes a split rather than opening a new surface, and the incidents that motivate it are already written up. The reattach item costs almost nothing extra on top of it: it touches the same path, and its six constraints were paid for once already by a reverted attempt whose review rounds are on the record, so the design starts from what has to be true rather than from a blank page.

Waiting is what costs. Every resume between now and the fix overwrites the run it was asked to continue, silently, and the report the caller gets says the work was resumed.

## Acceptance criteria

- [ ] A profile can be declared, listed in the catalog with its own description and tags, and named at session creation; the resulting seeding is recorded in session history and survives a resume.
- [ ] Static guards evaluate reachability per profile, and seed values are validated against declared variable types; the private-remediation guarantee — disclosure steps statically unreachable given the seeded state — holds at least as strongly as it does today.
- [ ] A write to a locked seed never changes the value, is recorded as a rejection, and is reported back to the caller — and no session can be left with a gate it cannot resolve.
- [ ] The wrapper workflow carries only what a profile cannot — its start activity, its isolation rules, its remaining security setup operations — with its variable declarations inherited from the base workflow instead of restated.
- [ ] Repository derivation, session creation, and planning-folder resolution complete server-side in one call, and a working directory that is not a checkout is refused rather than created.
- [ ] Ambiguity a bootstrap cannot resolve comes back as a named open decision with candidates and a recommendation, keeping the deterministic work already done.
- [ ] No setup activity remains that contains no judgment call.
- [ ] A second dispatch into a folder holding a running child of the same workflow continues that child, with its cursor, completed activities and variables intact; a finished child is not resumed, a new one starts beside it, and every prior child keeps its slot.
- [ ] A dispatch into a folder whose session cannot be read is refused, naming the reason, and leaves the file untouched.
- [ ] A cursor that cannot be entered does not strand the run, and a child left at a checkpoint can be resumed — or the dispatch says plainly that it cannot, and why.
- [ ] The identifier handed back resolves, including after the folder has moved, and a resumed run is visible in the response and in the folder's history, distinguishable from a first dispatch.

## Non-goals

- The shipped private-remediation design stays as-is; this epic must not weaken its guarantee while generalising its mechanism.
- The schema surface stays minimal: prefer the smallest engine addition that removes the wrapper boilerplate over a general configuration system.
- No cost model for a workflow's context load. It was designed and dropped as more machinery than the question needs.
- How many worker contexts a walk needs is #407's area, not this epic's; what a delivery contains is #404's.
- Resuming through a persistent parent, which appends a second child rather than continuing the first. That path overwrites nothing, so it loses no work, and the bootstrap does not take it.

## Tracking

Each work item is delivered as its own pull request when picked up:

- [ ] W1 — profiles: declaration, catalog, seeding at creation, locked seeds, inherited declarations, per-profile guards
- [ ] W2 — server-side bootstrap: deterministic setup folded into session creation, judgment calls staying with agents
- [ ] W3 — session reattach: a second dispatch into an occupied folder continues the run it finds; lands with W2, which retires the machinery the fault lives in

Consolidates #213 and #248; both bodies are captured verbatim in the planning folder. **Session reattach joined as W3 on 6 August 2026** (#429, closed on joining, body captured in the planning folder). It belongs here because the fault lives in the throwaway-session-then-promote path W2 retires, and because W2 already names a saved session that might be the one to resume as an open decision the bootstrap returns rather than settles for itself — this is what happens today when nothing returns it. Its own investigation record, including the reverted first attempt and the corpus-side gate semantics, is linked below. The bootstrap item joined on 2 August 2026, relocated from the first draft of #406 (since subsumed into #404) after an epic-scoping review.

**Batched dispatch left this epic on 2 August 2026 and is now [#407](https://github.com/m2ux/workflow-server/issues/407).** It is a per-dispatch decision made during a run rather than a property fixed at creation, so the same scoping rule that brought the bootstrap item in took it out. It also carries the startup-cost measurement this epic was re-prioritised on: batching alone saves about 65% of the setup walk, which leaves the bootstrap item's own cost saving at roughly 2.5% of that headline figure — the reason its case here is stated as correctness rather than cost.

Two decisions are needed from neighbouring epics before the profile item encodes posture: the gate-presentation contract owned by #400, and the wording in #402 that exempts existence tests from the next schema major, on which the absence gating rests.

## Investigation detail

Full record — grouping rationale and verbatim issue captures with the schema sketches, candidate-profile tables, cost-model signals, and open design questions:
**[engineering/artifacts/planning/2026-08-02-session-presets-consolidation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-session-presets-consolidation)**

W3's own record — the measured damage, each of the six constraints with the evidence behind it, and the corpus-side gate semantics verified against the when-expression evaluator: **[engineering/artifacts/planning/2026-08-04-session-reattach](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-04-session-reattach)**. The reverted first attempt is on the batched-dispatch branch, and its revert commits state what each fault was and why the direction was wrong.

The design questions were settled over four code-level deep dives on 2 August 2026 — twenty-seven decisions, each recorded with the evidence behind it and with what it supersedes, including the cost model's removal, the entry-activity ruling, and the relocation of batched dispatch: **[deep-dive decision record](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-02-session-presets-consolidation/deep-dive-decisions.md)**.




## The repository a session derives is the one under work (extends W2)

`target_repo` binds to the workspace superproject rather than to the component the work package
targets. On a review of a `midnight-node` pull request it held `shieldedtech/midnight-agent-eng`, so
every activity that needed the component repository substituted it by hand — and `target_repo`'s own
declaration says it supplies the GitHub protocol operations by name-match, which cannot work while
it names the host.

**W2** moves repository derivation into one tested server-side place. Deriving the component from
the working directory rather than the outermost checkout is the fix, and it is cheaper there than in
every consuming activity.

Source: item 21 of the [July–August retrospective review](https://github.com/shieldedtech/midnight-agent-eng/blob/mike/.engineering/artifacts/planning/2026-08-06-workflow-retrospective-review/03-item-tracker.md).


