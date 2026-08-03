# Deep-dive gap analysis and interview decisions — 2 August 2026

A second-pass analysis of epic #401 against the codebase, run after consolidation. Four surfaces were mapped (session creation, workflow schema and catalog, the guard suite, the meta workflow and the removed solo path), the epic's open questions were cross-checked against what the code actually does, and the nine decisions below were settled interview-style with the owner. Every recommended option was accepted.

## What the code says today (facts the decisions rest on)

- **Seeding has exactly two injection points.** Both `start_session` (fresh branch) and `dispatch_child` funnel through `seedDefaults()` plus `createInitialSessionFile()`, and the seeding is already recorded as one `variables_seeded` history event in the sealed session file. A profile layer slots in at those two points and inherits the audit trail for free. `dispatch_child` passes no variables today beyond the inherited `user_request` — profile seeds at dispatch are a new capability, not a generalisation.
- **Variable writes are warn-only.** Checkpoint `setVariable` effects and worker-reported `variables_changed` both land through `applyVariableWrites()`, which records type mismatches but never refuses. Nothing stops an agent volunteering `stealth_mode: false` mid-run; the static guards prove no reachable *step* does it, but not that no *agent* will.
- **The reachability evaluators are already bag-parameterised.** `evaluateWhenExpression(expr, vars)` and `evaluateCondition(condition, vars)` take an arbitrary variable bag, so evaluating "per profile" needs no evaluator changes. What does need work: `check:stealth` and `check:review-mode` each carry a private copy of the conservative three-valued (provably-true / provably-false / unknown) reachability layer, and each hard-codes its own single-variable bag — those are the two implicit profiles the epic generalises, and the shared logic should be lifted into one module first.
- **No `profile`, `preset`, or `posture` concept exists anywhere** in the server source or schemas. The nearest precedent is `context_mode` (`persistent`/`fresh`): a session-level field, set at creation, carried in the session file — exactly the shape a posture field needs.
- **The solo machinery survived its own removal.** PR #247 deleted only the workflow-definition prose (`execute-activity`); the server still accepts `context_mode: persistent` freely on both creation tools. Nothing but convention prevents a solo walk today.
- **Every input the cost model needs is statically computable, and a path enumerator already exists.** Activity YAML bytes, inherited rules, eager technique bundling (gated steps always stay lazy), resource bytes at whole-file or section grain — all resolvable from definitions; the e2e walker's `enumeratePaths()` already enumerates distinct paths using the server's own evaluators. Calibration data exists as `activity_usage`, `activity_dispatched.chars`, `technique_bundled`, and `resource_fetched` history events.
- **Nothing under the workflow corpus is machine-derived today** — a committed cost-profile file would be the first derived artifact and would bring its own staleness policing.
- **The server already does most of W3's deterministic half.** Slug resolution, planning-folder search and creation, migration, and repo *binding* are server-side; only the git parsing (owner/repo derivation) is agent-side, via technique prose that encodes non-trivial rules (superproject wins, worktree pointers, submodule selection).
- **Latent catalog gap.** The workflow-matching technique declares a catalog input of `{ id, title, description, tags }`, but `list_workflows` ships only `{ id, title, version, tags }` — the matcher is already written for a richer entry than the server provides. Adding profile entries touches the same shape.
- **The wrapper's real tax is variable redeclaration.** `remediate-vuln`'s only local content is one 141-line start activity; its bulk is ~70 re-declared variables, because borrowed activities do not inherit the base workflow's declarations.

## Decisions (all recommended options accepted)

### W1 — profiles

1. **Entry-activity override: seeds only.** Profiles carry variable values (and posture) — nothing else. `remediate-vuln` stays as the documented pattern for content-bearing specialisation; its redeclaration tax is fixed separately by letting a borrowing workflow inherit the base's variable declarations. This is the written decision the epic's acceptance criteria call for: the wrapper is not retired; it shrinks.
2. **Seed protection: per-seed lock flag.** A profile marks which seeds are locked; the server rejects (hard error, not warning) any write to a locked variable. `stealth_mode` and `push_remote` lock; working-state values stay writable. Closes the volunteer-write hole the static guards cannot see.
3. **Already-answered machinery: gate on absence.** Authoring convention, no engine change: detection steps and activation checkpoints are gated "variable not yet set". A profile that seeds the variable makes them statically unreachable, and the existing guards can prove the skip. `work-package` already declares `is_review_mode` with no default for exactly this reason.
4. **Posture: structured field, orchestrator-honored.** `posture: headless` becomes a recorded session attribute (following the `context_mode` precedent). Enforcement stays behavioural with the orchestrator, but guards can check that headless paths contain only auto-advanceable checkpoints, and the rule prose shrinks to the exceptions.
5. **Addressing: separate `profile` parameter.** `start_session` and `dispatch_child` gain an optional `profile` field next to `workflow_id`; the catalog lists profiles as structured entries (parent workflow id, profile id, own description and tags). The `work-package@stealth` form is display-only. The same change ships the missing `description` field the matcher already expects.

### W2 — context-cost profile

6. **Storage: the server computes the estimate.** ~~Derived from the loaded definition at load time and surfaced on `get_workflow` and the catalog — it cannot be stale by construction, so "missing or stale means dispatch" collapses to eligibility alone. A small committed snapshot, regenerated by tooling and checked by a guard, gives reviewers visibility when a change moves a workflow's cost class.~~ **Superseded in the second loop — no cost model ships (decision 13).**
7. **Enforcement: the server refuses.** `start_session` and `dispatch_child` reject `context_mode: persistent`. **Stands, with its basis changed by decision 13:** the refusal keys on whether the workflow is the named solo-eligible one, not on an estimate. This makes the overflow class structurally unreachable rather than discouraged by prose — the shape that failed before PR #247.

### W3 — server-side bootstrap, and sequencing

8. **Order: W3 lands before W2's pilot.** Folding the deterministic setup into session creation removes the dominant dispatches outright; solo then pilots on the shrunken meta walk plus a deliberately small workflow. Avoids calibrating solo eligibility for activities about to disappear. **Weakened by decision 13:** with no model to calibrate, the ordering constraint largely dissolves — making the orchestrator solo is a small, self-contained change that can land whenever it is convenient, and doing it first yields a measurement of the setup walk that W3 then improves on again.
9. **Bootstrap input: a filesystem path.** The one-call bootstrap takes the working-directory path and the server derives owner/repo from the repository's git metadata itself, applying the superproject and worktree rules in one tested place. This is the only reading under which "derivation completes server-side" fully holds.

## Smaller gaps noted, no decision needed

- Lift the three-valued reachability layer shared by `check:stealth` and `check:review-mode` into one module before adding per-profile evaluation; one new guard registration then covers `check:all`, CI, and `check:delta` automatically.
- The `exists-on-defaulted` rule in `check:variable-model` becomes per-profile: a variable seeded in one profile but not another changes which existence-gates are constant.
- Profile seeds need the same type validation as `defaultValue` (same `jsonTypeOf` path), evaluated per profile.
- Resume semantics: defaults are never re-seeded on resume, so a profile recorded at creation survives a resume by construction — but the profile name itself should be stored on the session file so a resumed session can state which preset it runs under.
- The planning-slug fallback in `dispatch_child` (`YYYY-MM-DD-<workflow_id>`) should incorporate the profile id when one is named.

---

# Second loop — mechanics of the accepted decisions

A follow-up pass, run once the first round settled, checking what the accepted decisions actually cost to build. It measured the wrapper's declaration overlap, inventoried every write to the variables a lock would protect, traced how a solo refusal could be evaluated at session creation, and mapped what survives of the orchestrating workflow once setup folds server-side. It produced five more decisions, one of which supersedes part of the first round.

## What the second pass established

- **Inheritance is worth exactly what was hoped, and touches only declaration time.** The wrapper shares 75 variable declarations with the base workflow: 72 are semantic duplicates (9 identical outright, 63 differing only in drifted description prose), 3 differ only in their default — `stealth_mode`, `push_remote`, `is_review_mode`, precisely the posture trio — and 4 are wrapper-only. The wrapper already runs borrowed activities against 63 base variables it never declares, which proves the merge is sound. Nothing at delivery time reads variable declarations: seeding happens once at creation from the entry workflow's list, the server never evaluates gates, and the authoring workflow of a borrowed activity is consulted only for fragments, techniques, and resource ids. So inheritance is a loader-time merge and nothing more.
- **The wrapper is genuinely irreducible to seeds.** Beyond its start activity it owns three isolation rules, two workflow-tier rules and a local orchestration-model fragment, and a six-operation security-setup technique group. The first round's "wrapper remains, slimmed" ruling matches the file layout.
- **A lock is nearly free.** `push_remote` is never written anywhere — every use is read-only. `stealth_mode` has exactly one write in the whole corpus: the wrapper's own start activity re-setting it to the value it already seeds, through the agent-interpreted `set` verb that is already slated for removal. `is_review_mode` has three checkpoint writes plus one technique-reported write, all inside the detection block that gate-on-absence removes.
- **Gate-on-absence does not fight the recent migration.** The absence test needs `notExists`, which only the structured `condition` form provides — the inline `when` grammar has no existence predicate, and `!x` conflates unset with false. The condition-to-when migration completed on 1 August deliberately kept exists-shaped predicates structured, so the re-gate uses the sanctioned form. The load-bearing edit is a single step: gating the detection step on `is_review_mode notExists` makes the whole review-activation block statically unreachable under a profile that seeds it. Every step already gated on the variable's value needs no change.
- **The server has nothing to budget against at session creation.** `context_tokens` exists only on activity delivery and is documented as per-call by design — never stored, never guessed, never defaulted, because one session serves differently-sized agents. There is no default window constant anywhere.
- **The active path is not knowable at creation.** The server never evaluates gates; the real branch points are checkpoint options a user chooses mid-run. Any estimate would have had to cover every still-possible path, not one.
- **No caching exists in the loader.** Every tool call re-reads and re-parses the workflow and its activities; one measured delivery walked the 184-file technique catalog three times. Sizing a whole workflow on every session creation would multiply a cost the delivery-cost epic is already working to reduce.
- **The temporary-session machinery is retirable.** Today a throwaway session in a temp directory is promoted to a durable folder on first dispatch, tracked through a process-local registry the code documents as fragile across restarts. The parent-child embedding it feeds is largely dormant already — the field driving child-completion tracking is never set on children — and the saved-session scanner matches both the nested and top-level shapes, so resume survives either way.
- **Everything in the setup walk is server-doable except four things:** matching free-form text to a workflow, slugifying an initiative name, reading intent and identifiers out of prose beyond regex-able forms, and the three user checkpoints. The three binding validations in the target-resolution activity exist only because the server cannot currently check them.

## Decisions from the second loop

10. **Locking is strict, and the redundant write is deleted.** ~~Any write to a locked variable is a hard error.~~ **The enforcement half is superseded by decision 15 — a locked write is refused and reported, never thrown.** The wrapper's re-set of `stealth_mode` is still removed — it is a no-op against the seed and uses a verb already scheduled for removal.
11. **An inherited declaration may be overridden in its default and its lock, nothing else.** Type and description always come from the base, so a variable keeps one meaning across a borrow. This is exactly what the wrapper needs, and it resolves the 63 drifted descriptions by construction.
12. **Ambiguity comes back as an open decision, not an error.** The bootstrap call succeeds, keeps the deterministic work it completed, and returns a structured field naming the decision kind, the candidates, and its ranked recommendation; the orchestrator presents it and calls back. This follows the existing pattern where session start reports an unbound repository as a field. A checkpoint cannot be used — the machinery needs a live session already walking an activity, which has not happened yet.
13. **No cost model ships.** *(Supersedes decision 6 and rebases decision 7.)* The static estimate, its storage, its staleness policy, and per-path eligibility are all dropped as over-built for what the epic actually needs. Real runs after the change provide the data for revisiting. **The execution-shape half of this decision — "the orchestrating workflow runs solo" — is itself superseded by decision 21: many activities to one worker, rather than the orchestrator walking them itself.**
    **Worth keeping distinct, and still true:** a short setup walk held in one context is not the failure PR #247 reverted. That was the orchestrator absorbing *client* activity content — 93 delivered entries under one ledger. The epic's constraint that the shared orchestrating workflow never accumulates client deliveries is untouched, and the startup measurement names the setup ceremony (2–43 KB per activity) as the canonical short walk.
14. **The bootstrap creates a durable session directly, and the temp-then-promote path is deleted.** Restart-fragile code is removed rather than ported; resume keeps working because the saved-session scanner already matches both shapes.

## Constraints carried into implementation, no decision needed

- **Container path duality is the real hazard in accepting a caller-supplied directory** — not traversal, which existing containment machinery already handles by canonicalising and failing closed. The server presents container paths to agents rewritten as host paths, so a bootstrap taking a working directory must apply the inverse mapping before reading it, and under a container deployment the caller's directory may not be mounted at all. A directory outside every search root should degrade to the same partial-success shape as an unbound repository, not a hard error.
- The bootstrap can derive a planning slug mechanically when the request carries a parseable identifier, and otherwise fall back to the dated `YYYY-MM-DD-<workflow_id>` form the dispatch path already sanctions.
- With setup folded in, the orchestrating workflow plausibly lands at three activities: match the request and present any decisions the bootstrap returned, then dispatch, then close out. The session-creation activity disappears entirely and target resolution reduces to a single checkpoint presentation.
- Guard interaction to preserve: the existing rule rejecting existence tests on defaulted variables means the base workflow's `is_review_mode` must keep its deliberate absence of a default when inheritance merges declarations.

---

# Third loop — breakage, collisions, and a better execution shape

A third pass, checking what the accepted decisions break, whether they collide with the other open epics, and what the execution-shape change actually costs. Two accepted decisions did not survive it, and the execution-shape item changed shape entirely.

## What the third pass established

### The reverted solo path was never what we were proposing

The removed operation was bound at exactly one place — the client-activity loop, authenticated with the *client* session index. The revert message says it directly: solo-as-default "overflowed agent context on multi-activity **client** walks." The orchestrating workflow's own activities were untouched by both the original change and its revert. So there was no prior art either way for holding a short setup walk in one context; the question was open, not settled by the earlier failure.

### A hard error on a locked write can strand a session

This is the sharpest finding of the pass. The refusal would happen inside the session mutation, so the change is discarded and the checkpoint stays open on disk — while a helper gates every authenticated tool except responding to that same checkpoint. The values a checkpoint writes come from the workflow definition, not the agent, so the agent cannot avoid the write by answering differently; if every option on the gate writes the locked value, nothing can resolve it. There is no abort, reset, or reseal tool, and hand-editing the file fails the seal, whose error text tells the user to restore from a commit — which restores the stuck gate too. Meanwhile the response shape already carries an unused errors channel: the type is there, `buildValidation` only ever fills warnings, and no tool sets it.

### The design canon argues against posture as its own field

Two catalog entries apply. One says a mode is one authoritative variable driving conditional flow, not a parallel field; the other warns against derived state shadowing an existing variable, and its worked example is the review-mode flag itself. The construct inventory already lists "named bundle of mode settings" as activation variable plus conditional flow. Posture as a declared variable needs no new construct and inherits history recording, audit, resume, and guard evaluation for free.

### Moving privacy into a profile would break its own guard first

The privacy guard models what the server seeds by reading the wrapper's declared defaults directly, then asserts privacy is on before evaluating a single step. Move those seeds into a profile and the guard fails on its own headline assertion until rewritten in the same change. Leaving privacy in the wrapper — which decision 1 already does — keeps the guard untouched.

### Two prerequisites sit behind this epic in the running order

The decision-integrity epic owns the contract for how a gate reaches the user, which a headless posture overrides, and would build the caller-identity check that enforcing posture needs — which does not exist: the respond tool takes no agent id and performs no role check, so "only the orchestrator resolves gates" is error-message prose. The server-unblocks epic owns the schema wording that decides whether the absence test gate-on-absence rests on survives the next schema major. Both sit at order 2 and 3 behind this epic's order 1.

### Gate-on-absence is cheaper than feared, with one snapshot cost

The review-mode guard needs no changes: its allowlist is keyed to checkpoints in other activities, and its provably-false logic already evaluates the absence operator correctly against a seeded bag. The walker never tries to satisfy step conditions, so its path selection is unaffected. One stored walk snapshot loses one step and must be re-baselined in the same commit as the corpus stamp.

### Inheritance is safe, and one guard already proves it

All 75 shared declarations agree on type, so "an override may never change type" costs nothing today. The variable-model and fragment guards scope their scans to each workflow's own activity directory, so borrowed activities are already linted against the workflow that authored them — meaning those guards never forced the duplication and inheritance will not break them. No snapshot covers the wrapper's variable list. The privacy guard is the exception: it walks borrowed activities with the wrapper's bag, so a wider inherited bag changes which steps it considers reachable and needs re-baselining.

### Adding a session field is well-precedented; adding a workflow key is half-checked

The seal is computed over raw bytes before any parse, session parsing is non-strict, and the delivery-mode field was added with no migration and no version bump — so an optional field is safe. On the workflow side there is a gap worth knowing: the workflow schema object is not strict while its generated JSON counterpart is, and nothing validates corpus YAML against the generated schema, so an unregistered key is silently dropped — a half-landed key looks declared and does nothing.

### A five-month-stale pull request overlaps this work

Open since March, untouched since, it adds a second session store backed by a database, its own session lifecycle, a relay of gates to human approvers, and a second meaning of "headless."

## Decisions from the third loop

15. **A locked write is refused and reported, never thrown.** *(Supersedes the enforcement half of decision 10.)* The write is dropped rather than applied, recorded as a rejection in session history, and surfaced through the errors channel that already exists in the response shape and is currently unused. The value genuinely never changes — the whole point of the lock — and no session can be stranded.
16. **Posture is an ordinary declared variable, not a session field.** *(Supersedes decision 4.)* An enumerated variable that a profile seeds like any other value. No new construct, conforms to the canon, and it inherits history recording, audit, resume survival, and guard evaluation from the seeding path that already exists.
17. **Review mode is the first profile, and privacy stays in the wrapper.** The privacy guarantee is not put through brand-new machinery, and its guard keeps the driver it reads today. A privacy profile is revisited only if a second private variant appears.
18. **Two decisions are pulled forward rather than re-ordering the epics.** The gate-presentation ruling and the wording exempting existence tests from removal become inputs to this epic's profile item. Everything else in those two epics stays where it is, and the two setup items proceed immediately with no such dependency.
19. **Which workflows may use a persistent context is a server setting, defaulting to the orchestrating workflow.** Tests and the token benchmark set their own. The shipped default stays strict, and the reference-delivery suite — the regression net for the delivery mechanics this depends on — keeps exercising them.
20. **The client dispatch loop moves to the orchestrator.** It is currently handed to a spawned worker that then spawns further workers, which the harness rule against spawned agents inheriting the dispatch primitive forbids. Fixing it removes a standing violation, is implied by the batching change anyway, and removes the most expensive setup dispatch measured.
21. **Many activities to one worker, as a general mechanism.** *(Supersedes the execution-shape half of decision 13.)* A dispatch may carry a run of activities rather than exactly one, and the worker walks them in a single context, resumed in place when a gate fires. An acceptable batch size is calibrated after the fact from real runs rather than guessed now. The orchestrating workflow's setup walk is the first user of the mechanism.
    **Why this beats the orchestrator walking them itself:** the orchestrator's context stays clean and its no-domain-work rule is untouched; the existing yield-and-resolve contract needs no carve-out, because the worker still yields and the orchestrator still resolves; and cost accounting keeps working, because the dispatch accounting rule already covers a resume after a gate. It needs one rule relaxed — workers are currently told never to ask for the next activity — against roughly six the alternative required. The resume machinery already exists as a harness operation documented as preserving the context window.
22. **The stale pull request is closed, with what is worth keeping captured.** Its human-approval relay is recorded against the epic that owns gate delivery. Five months of drift means it would be substantially rewritten regardless, and leaving it open lets the repository drift toward two session lifecycles and two meanings of headless.

## Further constraints carried into implementation

- **Profile shape follows the fragments precedent:** a record keyed by a kebab-case name, with no separate id field (the key is the id), no title (reserved to the workflow root), and no tags (which exist at exactly one place in the schema surface today). Seed keys inside are variable names and stay qualified snake_case.
- Registering the new key means the schema field, schema regeneration, an enforcement-model row, and a construct-inventory row — without the inventory row it trips the rule requiring operative criteria to have a home.
- The privacy guard and the variable-model guard both need to evaluate the *effective* declaration set once inheritance lands, not the literal file contents.
- Re-baselining sequence for gate-on-absence: update the walk snapshots and re-stamp the corpus in one commit, since the stamp check runs first and fails with a drift message before any snapshot is compared.
- Watch two tests that assert on the delivered workflow payload when the wrapper's declaration list grows under inheritance.
- Adding a session field must change both the type and the schema object together — the schema is cast to the type, so changing only the type still compiles and then silently strips the field on every read. A bad enumerated value surfaces as a seal mismatch, whose message wrongly suggests tampering.
- The measurement sequence across epics needs managing: this epic's batching change, then its bootstrap fold, each measured against the July baselines before the delivery-cost epic audits what survives.
- One acceptance criterion inside this epic contradicts another: the profile item pins a planning-folder operation inside the wrapper that the bootstrap item retires. The wrapper keeps its privacy content; the planning-folder operation goes.

---

# Fourth loop — what batching moots, and where it belongs

The general batching mechanism from decision 21 changes the arithmetic the epic was built on, so a fourth pass tested every assumption that rested on dispatch cost. Two work items changed home or justification, and one blocker appeared that no earlier pass reached.

> **Correction note, 3 August 2026 — the token figures in this loop are on a per-record basis.** The analyser behind them summed usage once per transcript record; a figure belongs to a response, and the harness repeats one usage object across every content block of it. Counted once per response, the cache-write figures in this section are roughly **2.4× smaller**: the four setup workers cost **124 thousand tokens, not 307**, so collapsing them saves about **half the setup walk rather than 65%** — around 60 thousand tokens per run rather than 200. The server-side bootstrap residue is correspondingly **about 14% of the setup walk, not 2.5%**, which weakens rather than supports the decision to demote its cost case. Respawn savings and the twelve-resume figure below halve the same way. Character-derived figures (delivered content bytes, the 937-thousand-character definition total) are unaffected, and every ratio and ranking holds, because the error scaled everything alike. The decisions recorded in this loop stand on the ratios and were not revisited. Measured with `npm run profile:run`; see [#409](https://github.com/m2ux/workflow-server/issues/409) and the startup-cost measurement record.

## What the fourth pass established

### Batching captures almost the whole cost win, and the bootstrap's cost case does not survive

Decomposing the profiled 27 July run gives an exact split, because the five worker ledgers sum to the recorded total. The four setup workers cost 307 thousand tokens of fresh context, of which roughly 272 thousand is context establishment and only 29 thousand is delivered content. Collapsing four dispatches into one leaves one establishment plus all the content: **roughly 110 thousand against 307, a saving of about 65% of the setup walk.** The second clean run gives 60–66% independently.

Folding setup into the server removes no dispatches on top of that — there is only one left. It removes content and turns: **about 25 to 30 thousand tokens per run, roughly 2.5% of the headline figure** the epic was re-prioritised on. That residue is delivered content weight, which is the delivery-cost epic's declared area, so it is also double-counted.

### The bootstrap's correctness case survives, and there are real incidents behind it

Four documented failures, two of them priced. A run bound the wrong repository from a link rather than deriving it from the checkout, creating an empty directory where the reviewer expected source — and the run looked healthy throughout. The same fault elsewhere threw away a whole session at a cost of 81,762 tokens. A planning folder was minted under the dated fallback instead of its intended name and written into for three days across six commits. A temporary session was never promoted and the child was written as the top-level record, inverting the documented nesting — which is exactly what decision 14 deletes.

In none of these did an agent get arithmetic wrong. Each is the same shape: the prose named the wrong source and nothing checked the answer. That is the argument for code rather than prose — a rule with no test, no type, and no guard ships wrong silently. The current fix for the first incident is itself prose: a 48-line derivation the agent hand-executes every run, propped up by three validations that exist only because the server cannot check them. One live gap is still unfiled: session start accepts a repository whose mapped directory is neither present nor a checkout, and creates it.

### Batching is not a creation-time property

The epic's thesis is properties fixed at session creation and never re-decided mid-run. Batch composition is chosen per dispatch during a run, its size is explicitly to be tuned from real data rather than fixed, and what it changes is the dispatch contract. The rule that moved the bootstrap into this epic — an epic coordinates one area of concern — moves batching out of it.

### The commit rule collides with batching, and no earlier pass caught it

A standing rule requires that after every completed activity both source changes and planning artifacts are committed and pushed before transitions are evaluated, and the commit hook is the orchestrator's, explicitly denied to workers. A worker crossing an activity boundary inside its own context cannot run it.

### Per-activity transitions are what make a failed resume survivable

If the batched worker reports each activity as it finishes, a failed resume costs one activity: a fresh worker picks up the session's current activity, and already-answered gates replay silently because recorded responses are keyed per activity rather than per agent. If instead the worker defers its transitions to the end of the batch, the session cursor goes stale and the whole batch is redone — and the worker is told to stop when the pointer disagrees. So relaxing the rule that forbids workers from asking for their next activity is a **requirement** of the mechanism, not a convenience.

### Measured batch shapes and collapse

Thirteen of the main workflow's fifteen activities carry a gate, so there is no gate-free run of two — batching removes respawns, not pauses. Delivery collapses about 40–45% for the second activity in a batch and 55–70% for the third; the best measured runs of three collapse 32% and 40% overall. But the payoff is lopsided: the ledger collapse on a good batch of three saves about 23 thousand tokens while skipping two respawns saves 120 to 200 thousand. **Batching is five to eight times more about not re-paying the harness baseline than about content dedupe** — which means it loses most of its value, and keeps all of its risk, if resume does not work.

One context walking all fifteen activities would take 937 thousand characters of definition alone, about 234 thousand tokens before a line of code is read. Counting ledger entries the same way puts the historical overflow at roughly three to four of today's activities — two independent routes to the same limit.

### The calibration plan measured itself out of existence

Cost is recorded once per dispatch against one named activity. A worker covering three activities yields one figure attributed to one of them, destroying exactly the per-activity resolution needed to determine a safe batch size from real runs.

## Decisions from the fourth loop

23. **Batching becomes its own issue at high priority.** *(Relocates decisions 20 and 21 out of this epic.)* It carries the dispatch-loop ownership fix, the batch-size calibration, and the re-measurement, and it inherits the high priority the startup measurement granted — that measurement is now its evidence, not this epic's. The precedent is exact: the last dispatch-mechanics change shipped as a standalone issue rather than under an epic.
24. **The bootstrap item is rewritten on correctness.** The dispatch-count and token-total framing comes out; the four incidents, the hand-executed derivation with its three compensating validations, the mis-promoting temporary-session path, and the unfiled bind-time precondition go in. Cost stays as one secondary sentence at its true size. The item remains worth doing — it is small, most of it is already server-side, and it closes an open silent-failure gap — but it is no longer a headline.
25. **A batched worker pauses at each activity boundary so the orchestrator can commit.** The pause-and-resume machinery is already needed for gates, which fire in thirteen of fifteen activities, so the boundary costs a round trip rather than a respawn. The invariant that a resume finds its work already pushed is preserved, and the saving is untouched because the saving comes from not respawning.
26. **The batch limit is a server-enforced cumulative budget plus a hard cap of three activities.** The server refuses to deliver the next activity once a worker's accumulated delivery passes a budget carrying its own, much smaller headroom setting — reusing the existing per-delivery fraction unchanged would admit nine of fifteen activities. The cap covers what a byte count cannot see: the harness baseline, the code the worker reads, and context degradation across a long walk. Both the byte measurement and the ledger-entry count converge on three.
27. **Cost is recorded per activity within a batch.** The usage record is extended so one dispatch can report a figure for each activity it covered, keeping the resolution calibration depends on while the existing reconciliation between recorded entries and actual dispatches still balances.

## Further constraints carried into implementation

- Batching's premise — that resuming a worker is cheap — holds only because the per-agent delivery ledger shipped; before it, resumed workers were forced into full delivery and twelve resumes cost over a million tokens in one measured run. Name that work as the enabler.
- Mid-batch arrivals are currently recorded as fresh dispatches, because the discriminator keys on the activity as well as the agent. Left alone this corrupts the saving measurement that the ledger work is judged by, and any limit later keyed off it. The scope-only predicate already exists alongside it.
- Batch discipline on delivery mode: the first activity takes full delivery, later ones take reference. Reference mode on a batch's first activity is measurably more expensive than full, because it ships resource bodies eagerly so they can collapse later.
- A worker that has silently lost content mid-batch and still asks for reference delivery receives unreadable markers for content it no longer holds. The existing escape hatch is agent-judged, and there is no server-side detector. Per-activity dispatch makes this impossible by construction; batching makes it a live mode.
- Good batch candidates in the main workflow are the analysis runs in its middle, not its ends. The activities that create the worktree, do the implementation, submit for review, or read unbounded external material should stay one to a worker.
- Abandoned batches leave their ledger entries behind permanently, since deliveries merge and are never pruned.
