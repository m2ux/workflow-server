# Issue #394: Technique folding: inline references between techniques resolve, get checked, and arrive as real steps

Captured verbatim on 2026-08-02 when the issue was consolidated into the protocol-structure epic.

---

## Summary

Techniques sometimes call other techniques from inside their protocol text — a step that says `Apply [group](…)::[op](…)` with a couple of arguments. The server treats that sentence as ordinary prose. Nothing resolves the reference, nothing checks that the arguments match what the called technique actually declares, and the called technique never shows up as a real step when the calling technique's package is composed. The agent receives a raw relative file path and is left to improvise.

This issue introduces a **fold**: a way to take an inline technique reference, resolve it, check its bindings against the callee's declared inputs and outputs, and deliver the callee as a discrete sequential step in the caller's composed protocol.

## What happens today

The reference evaporates at every layer:

- **The loader passes it through untouched.** The only rewriting done to a technique body is for resource links; technique links are explicitly left alone. A protocol step is just a string — there is no slot for "this step calls that technique".
- **No guard looks at it.** The reference checkers only read activity YAML (`techniques[]` lists and step binds). The link checker only validates links that carry a `#anchor` — and the house-style technique reference never has one. The argument syntax the spec defines for these calls has no validator at all.
- **Delivery is papered over by hand.** About ten entries in `core-ops.ts` exist only because inline references don't resolve — the file's own comments say that without them, the orchestrator "reaches the dispatch step with nothing to apply and improvises". Nothing keeps that hand-maintained list in sync with the prose it mirrors.
- **The guards can even point the wrong way.** A technique reached only through an inline reference looks unused to the dead-output check, so the diagnostic blames the callee instead of the missing delivery path.

The cost is measurable. A survey of all 554 technique files (full results in the planning folder) found:

- **118 distinct inline call edges**, and **99 of them (84%) are invisible to the activity layer** — the agent only discovers them by reading the caller's prose.
- **56 call sites leave out at least one required input** of the technique they call.
- Live drift of exactly the kind a check would have caught: a caller passing `{state}` to a technique whose input is named `substitutions`; a wrapper that silently dropped one of its callee's three inputs; a caller describing a borrowed procedure that no longer matches what the source file actually does.

Notably, **every link target exists** — no dangling paths. The rot is entirely in the contracts, which is exactly the part nothing checks.

## The fix, in three stages

### 1. Check what we already write

A new guard that finds inline technique references in protocol text, resolves each one through the same loader the server uses, and compares any named arguments against the callee's declared inputs. This alone catches all 56 contract-silent sites and every future rename or file move that would strand a caller. Two small repairs ride along: the resource-reference scanner currently mistakes a bare sibling technique link for a resource id (producing a spurious "unresolvable resource" warning), and the dead-output check should stop blaming techniques whose only callers are inline.

The guard's output doubles as a complete inventory of which references invoke work and which are just documentation pointers — the worklist stage 3 needs.

### 2. Give the reference a real home

Teach the loader to parse the canonical reference into structure — which technique, which arguments — at the same point it already rewrites resource links. Composition then delivers each called technique as its own clearly-marked step, in order, inside the caller's package, reusing machinery that already exists: the per-step technique bundling that `get_activity` does, the dedup ledger so a shared callee isn't delivered twice, and the provenance annotations on inputs. Two genuinely new pieces: cycle detection (the existing fragment system deliberately never recurses; a fold must, carefully), and a policy decision to deliver by reference (a discrete step plus the bundled callee) rather than by pasting the callee's body into the caller.

Once callees are delivered properly, the hand-maintained workaround entries in `core-ops.ts` come out.

### 3. Decide the doctrine

There is a standing contradiction. The design canon forbids technique-to-technique work calls in three places (the atomic-techniques principles and the `pass-orchestration-in-technique` anti-pattern — and the in-flight #385 hardens this further with AP-142/143). Yet the addressing spec fully defines the call syntax, even sanctions it for error recovery, and the corpus uses it 118 times. Neither side has any mechanical enforcement.

Two coherent end states:

- **Enforce the prohibition.** Migrate the 99 activity-invisible edges into proper activity step binds, keep folds only for the genuine exceptions (the workflow-engine orchestrator techniques, where the activity layer isn't the executing context), and let the new guard become the enforcement the canon has never had.
- **Sanction declared folds.** Allow technique-to-technique calls when they are structured and checked, keep forbidding unchecked prose invocation, and amend the canon and spec in the same change so all the homes agree.

Either way, stage 1 is prerequisite and nothing is wasted: under enforcement it is the detector, under sanction it is the fidelity checker. The decision should be made over the full 118-edge inventory, with each edge dispositioned as migrate, fold, or documentation-only.

## Why now is cheap

Roughly 80% of the fold machinery already exists, pointed at other targets: the loader already parses `::` paths and composes techniques on demand; ancestor wrapping already splices foreign blocks into a protocol; the fragment system already does in-place inclusion; step bundling already delivers techniques as ordered, marked, budget-capped blocks; and dedup and provenance already exist. And with PR #385 still open, the doctrine question is being actively worked — deciding it now, with this inventory in hand, avoids hardening a prohibition that 118 live call sites already violate with no way to notice.

## Scope of change

- **Guards**: new inline-reference check (resolution + argument conformance); fix the resource-scanner misclassification; adjust the dead-output check.
- **Server**: loader parses the reference into structure; composition delivers callees as discrete ordered steps with cycle detection; retire the workaround entries in `core-ops.ts`.
- **Canon & spec**: whichever way stage 3 goes, the anti-pattern entries, design principles, construct inventory, and the spec's call-syntax sections must end up saying the same thing.
- **Corpus**: disposition of the 118 edges — migrations to activity binds, retained folds, or documentation-only links.

## Acceptance criteria

- [ ] New guard in the registry; on the current corpus it reproduces the investigation's counts (118 edges, 56 contract-silent sites).
- [ ] The spurious "unresolvable resource" warning for sibling technique links is gone.
- [ ] A written stage-3 decision with the full edge inventory dispositioned.
- [ ] If folds are sanctioned: structured reference in schema and loader, discrete-step delivery with cycle detection, `core-ops.ts` workarounds removed, canon and spec amended together.
- [ ] If the prohibition is enforced: migration PRs for the invisible edges, the exception list documented, and the guard promoted to enforcement.

## Non-goals

- Server-side *execution* of called techniques — this is composition and delivery only; the agent still does the work.
- A second orchestration vocabulary — multi-unit coordination stays with the activity patterns from #382/#385.
- Any resource-link behavior change beyond the one bug fix.

## Investigation detail

Full record — composition pipeline trace with file:line evidence, guard/canon/schema coverage survey, and the 554-file corpus survey with drift instances:
**[engineering/artifacts/planning/2026-08-02-inline-technique-fold-investigation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-inline-technique-fold-investigation)**

Related: #382, #385 (AP-142/143, in flight), the AP-114 audit false-negative note in the 2026-08-01 fan-out planning folder.

