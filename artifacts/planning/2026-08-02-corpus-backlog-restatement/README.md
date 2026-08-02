# Corpus backlog (#338) — restatement record

On 2026-08-02 the body of issue #338 was restated from a running ledger (done-items interleaved with live ones, per-item status updates, provenance threading) to the epic structure used by the other consolidation epics. This folder preserves everything the restated body no longer carries.

## Contents

- [issue-338-original-body.md](./issue-338-original-body.md) — the full pre-restatement body, verbatim: the eight original work items W1–W8 with their provenance lines, status updates, and the carried-items list.

## Done-ledger at restatement time

Completed before the restatement, and therefore absent from the restated body:

| Original item | What it was | Where it landed |
|---|---|---|
| W1 | Relax the full-delivery rule to a fresh ledger per worker | Renamed to a per-agent-context predicate and swept across all five surfaces in #355, after the server ledger re-keying landed |
| W2 | Submodule-aware commit path for planning artifacts, pointer bump via pull request | Both halves landed in #360 |
| W3 | Usage and cost record written into the planning artifact on completion | Verified done 2026-08-01: close-out mints a token-usage artifact as the run's sole cost home, rewritten after exit from the rolled-up per-activity usage (#366, #369) |
| W4 (lint half) | Checkpoint messages and gate expressions that reference values nothing produces | Covered by the binding-fidelity guard's read-resolution walk since #364 |
| W5 | Burn down the fix-later binding-fidelity entries | Landed in #367 (corpus) and #368 (guard reach); ledger went from 196 triaged entries to 78, all remaining entries harmless, zero fix-later; the #342 guard-defect gate held in the right order (#364 first) |

## Provenance map

The original body consolidated four superseded issues; each restated work item traces back as follows:

| Restated item | Original item | Source |
|---|---|---|
| W1 — five content defects | old W4 (defect half) | #189 C3, friction register entry R4 |
| W2 — fragments completion | old W6 | #189 C10 |
| W3 — step-condition migration | old W7 | #189 C8 (corpus half) |
| W4 — retire sweep at next major | old W8 | #189 C13 (corpus half) |

## The five content defects, enumerated

The original body admitted these were "unenumerated anywhere except that issue's evidence". They are enumerated in the 2026-07-08 review's fix-verification ledger (entry F15) and friction register (entry R4), in [2026-07-08-schema-technique-disclosure-review-repeat](../2026-07-08-schema-technique-disclosure-review-repeat/):

1. Environment assignment placed after the `nice` command — invalid shell — in the cargo operations `check` file and its siblings.
2. The `RUST_TEST_THREADS` budget in the cargo group rule disagrees with what the check and clippy operations state.
3. The create-issue operation's first step contradicts its own scoping.
4. The suite runner's concurrency instruction is in tension with the group's foreground-only rule. (This site is also the motivating call site of the shared-homes epic's fan-out work item #399 W1 — whichever lands second inherits the other's resolution.)
5. The design-philosophy checkpoint message interpolates `{problem_complexity}` while its default option sets `path_gating_complexity` — now guard-detectable since the binding-fidelity walk covers checkpoint messages.

## Companions unchanged by the restatement

- **#365** — the server half of the same superseded work; its gates on the restated items are stated per item in the body.
- **#343** — delivery routing: which items ride together in a pull request and in what order.
