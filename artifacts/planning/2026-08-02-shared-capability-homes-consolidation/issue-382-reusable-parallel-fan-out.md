# Issue #382: Reusable parallel fan-out: give the concurrent-suite structure a named meta contract (evaluate scatter-gather and spawn-concurrent)

Captured verbatim on 2026-08-02 when the issue was consolidated into the shared-capability-homes epic.

---

## Summary

One of our technique files — `run-suite`, the cargo validation-suite runner under `cargo-operations` — describes how to run four checks at once purely in free protocol prose: fan out concurrent invocations of several different child operations, wait for all of them, gather the results in a fixed order, and fall back to running sequentially when the host is under resource pressure. Nothing names that structure, so every caller that wants it has to reinvent it in its own prose. This issue is about binding the structure to a **named technique contract** instead — a contract a step Applies, rather than a pattern each author re-describes.

**Do not assume** the existing primitives are insufficient. Two techniques already under **meta** — `scatter-gather` and the `spawn-concurrent` variant of `harness-compat` — may already be the right answer, possibly with small extensions, clearer binding guidance, or a thin reusable resource. The work is to **decide and document** the binding, then retarget the callers.

Whatever technique or resource carries this pattern **must live in `workflows/meta/`** and stay **domain-agnostic and reusable**. Cargo (or any other toolchain) owns only its child operations and the domain-specific combining of results into an envelope — not a private copy of the fan-out structure.

## The call site that motivates this

Protocol step 1 of `run-suite` currently states the fan-out in prose:

> Fan out four concurrent shells invoking [check](./check.md), [clippy](./clippy.md), [test](./test.md), and [fmt-check](./fmt-check.md) against the same `{build_scope}` …

Informally, that one step also owns:

- fan-out of a fixed set of **different** child operations over the same shared inputs (a fixed suite — not N copies of one brief);
- per-operation resource budgets (`nice`, `CARGO_BUILD_JOBS`) and backoff under memory pressure;
- **waiting for all** operations before composing results — no short-circuit on the first failure;
- an ordered gather and envelope combine, in the order `check` → `clippy` → `test` → `fmt-check`;
- a sequential fallback when the host cannot sustain concurrency.

Other validation suites and non-cargo toolchains will need the same structure — which is why the supporting surface belongs under **meta**, not under a cargo-only path.

## Where each piece lives (required placement)

| Layer | Lives where | Owns |
|-------|-------------|------|
| Fan-out structure (dispatch, join, gather, degrade) | **meta techniques** (and meta resources if needed) | A reusable contract any workflow or group can Apply |
| Agent concurrent batch (if that is the dispatch) | **`harness-compat`** under meta (the existing `spawn-concurrent`) | Harness-shaped parallel agent dispatch |
| Domain child operations and envelope | e.g. `cargo-operations`, future npm or go suites | What each unit runs and how its results fold into a domain envelope |

- Prefer extending or documenting the **existing meta** techniques over adding a second gather model.
- Do **not** bury a one-off "run four cargo shells" procedure only under `cargo-operations` if the structure is general.
- If a new technique is required, its home is **meta**, and `run-suite` becomes a consumer that Applies it.

## Open design question

| Candidate | Why it might fit | What to verify |
|-----------|------------------|----------------|
| **`scatter-gather` (parallel mode)** — already meta | One gather contract; wait-all; ordered collection; a combine phase; sequential is just concurrency = 1, since parallelism is an optimisation | Can the work units be heterogeneous named operations? Does "per-unit operation" cover Applying distinct technique files, including host shell operations? |
| **`spawn-concurrent`** — already meta, under `harness-compat` | Parallel batch with results returned in input order | Is a **shell or process** unit in the caller's own foreground in scope, or only sub-agents? If shells need a sibling operation, keep it under `harness-compat` (or adjacent in meta), still reusable. |
| **A new meta technique** (and/or a meta resource) | Only if the above cannot express the call site without breaking existing contracts | Name to be decided; must stay reusable and not cargo-specific; no second gather contract if `scatter-gather` already owns gathering |

Prefer **reuse or a thin meta extension** over a parallel vocabulary. A new technique is justified only after a concrete mismatch is shown — for example, agent-only dispatch with no host-process path, isolation rules that cannot cover local shells, or no way to bind a fixed suite of different operations.

## Non-goals

- A server-side parallel execution engine.
- Replacing `scatter-gather`'s gather contract with a second gather model.
- A cargo-only fan-out technique that other groups cannot Apply.
- Changing the four cargo child-operation signatures, except where `run-suite` already notes follow-ups (e.g. uniform diagnostics on `check`).

## Acceptance criteria

- [ ] A written decision: bind `run-suite` (and its peers) to the existing meta primitives (as-is or extended), **or** introduce a **new meta** technique or resource with an explicit rationale for the mismatch.
- [ ] The supporting technique(s) and resource(s) live under **`workflows/meta/`**, domain-agnostic and reusable beyond cargo.
- [ ] If reuse: binding guidance (work-unit shape, combine hook, wait-all, degrade path) so authors do not re-describe the fan-out in prose; `run-suite`'s Protocol updated accordingly.
- [ ] If extension: a minimal delta to the existing meta technique(s), written in positive present tense, with no second gather contract.
- [ ] If new: Capability, Inputs, Outputs, Protocol, and Rules (and a resource only if needed); a clear boundary against `scatter-gather` and `spawn-concurrent`; and at least one bind target other than `run-suite` — or an explicit "bind next" note under another meta or client consumer.
- [ ] The `run-suite` call site no longer carries the ad-hoc concurrent-shell structure in protocol prose alone — it Applies the meta contract and keeps only the cargo-specific envelope folding.

## Origin

Raised while reviewing concurrent validation authoring: the suite wants four concurrent shells, and the **structure** of that fan-out should be a first-class meta Apply — whether that turns out to be the existing scatter/concurrent primitives or something new after evaluation — and it must stay reusable outside cargo.

## References

- `workflows/meta/techniques/cargo-operations/run-suite.md` (primary call site)
- `workflows/meta/techniques/scatter-gather.md`
- `workflows/meta/techniques/harness-compat/spawn-concurrent.md`
- `workflows/meta/techniques/orchestration-patterns/` (related mid-phase fan-out repertoire)

