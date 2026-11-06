# Work Planner Consumer Trial C

- Checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/w01-solid-guidelines-fields-and`.
- Pinned revision: `358287d8cc7ede34ed0ce70f330cd2bc758af2d6`.
- Scope: fresh-context, read-only preparation for a small artifact-field wording edit; no source, tracker or commit changes.
- No expected sequence or findings were supplied. No agents were spawned and no memory was consulted.

## Actual Reads

1. `skills/work-planner/SKILL.md`, whole: selected Revise because the proposed edit concerns the skill's own artifact guidance. Initial command also returned the expected commit and clean status.
2. `skills/work-planner/rules.md`, `conventions.md`, and `modes/revise-mode.md`, each whole in one bounded batch: learned section boundaries, context reuse, decision routing, execution conventions, and Revise's explicit requirement to read both guidelines whole before an edit.
3. `skills/guidelines.md` and `skills/work-planner/guidelines.md`, requested whole. The first sandbox attempt failed with the bubblewrap namespace error. Repeating the sandbox invocation with `require_escalated` succeeded. The tool result was truncated in the Work Planner document; the shared document was received completely, while the Work Planner prefix was incomplete.
4. Counted lines and inspected headings in both guideline files to bound the missing read. Recovered `skills/work-planner/guidelines.md:1-124` explicitly. Combined with its previously received lines 125-322, this supplied the full document, including SOLID, Field Boundaries, Policy Review, Procedure, Prose, Operations, Modes, Protocols, Artifacts, References, Entry Point, Scripts, Progressive Disclosure, and Changes.
5. Followed the Rules decision link to `artifacts/plan-change.md#allowance`, locating headings first, then reading only lines 43-46. Followed its contextual link to `#change-kinds`, reading only lines 47-56. Did not load or execute that artifact's operations.

## Conclusions

- Governing route: SKILL -> Rules and Conventions -> Revise -> shared and skill-specific guidelines whole. The direct semantic owners are Work Planner Guidelines / SOLID / Field Boundaries and Policy Review, alongside Artifacts / Fields and No Procedure in Fields. Shared Prose supplies the one-home rule; Revise supplies change and validation procedure.
- A conditional constraint on a value's valid state belongs in Fields: values, types, permitted states, invariants, conditional constraints and schema examples are legitimate field content. A safe wording pattern is `When <condition>, <field> is <permitted state>.` The condition alone does not make it procedural.
- A condition that selects or refuses an action belongs in the operation step or command details that perform that action. Evidence gathering, deriving a result, selecting membership or state, retries and continuation are behavior even when expressed declaratively. A shared behavioral policy has one linked home in its subject's Guidance; creating an artificial field/input object does not make it schema.
- For a wording-only change, preserve the owning condition and its semantics, update affected public-contract callers if shape or home changes, and search for stale claims. No artifact or exact sentence was supplied, so this trial prepares the classification decision; it does not claim to have drafted an actual repository edit.
- Apparent policy conflict requires matched inputs and entry conditions before declaring a contradiction. Record pinned sources, current prose, observed outcomes, the owning contract and competing interpretations. Different contexts may explain different outcomes. Obtain confirmation before a policy-changing fix; a mechanical clarification preserving an unambiguous invariant does not itself create a policy decision.
- Required user decisions follow the one-at-a-time interview with context, multiple choices, a marked recommendation and an actual answer. Rules additionally allow a supplied run allowance to resolve covered decisions using the recommendation. No allowance was supplied here; the linked change-kind table does not establish a blanket allowance for editing skill policy.

## Completeness, Reuse and Overhead

- Required whole-file content was received completely after recovery. No missing guideline section remains.
- Reused the already received shared guidelines and Work Planner lines 125-322; the recovery reread only the prefix needed to restore completeness. The recovered prefix included some already visible surrounding material because truncation location was coarse.
- Explicit whole-file guideline requirements brought unrelated edit-family detail into this small task, but this was required context, not a voluntary route expansion. Additional allowance reads were narrow linked definitions relevant to when confirmation is required.
- Observed overhead: one failed sandbox invocation, one escalated retry, one truncated batched result, heading/line-count discovery, and one recovery read. This is observed retrieval behavior, not evidence of token savings or comparative performance.
- No executable source changed, so tests and skill validation commands were not run. Their specifications were read as part of required Revise context, not executed.

## Final Verification

- Final `git rev-parse HEAD` returned `358287d8cc7ede34ed0ce70f330cd2bc758af2d6`.
- Final `git status --porcelain=v1 --untracked-files=all` returned no entries, exit 0.
- Report is outside the checkout at `/tmp/deliver17-20261106/solid-reader-c.md`.

## Uncertainties

- The actual artifact field and proposed conditional sentence were not provided. A concrete placement verdict depends on whether that sentence constrains persisted/returned values or derives a caller action.
- No live policy evidence was supplied. The confirmation rule is established, but no actual policy conflict or policy-changing fix was identified.
