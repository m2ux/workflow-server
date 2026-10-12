# Progressive Disclosure Anti-Patterns

Nine recurring failures observed while qualifying the Workflow Canon audit skill, drawn from seven fresh instruction walks across two independent reviews. Every one is reproduced in this record's evidence; none is hypothetical.

These describe how an agent retrieves skill instructions. They are not corpus canon: the `DA-` namespace is local to this planning record, and an entry here never carries an AP or DP number. The [anti-pattern catalog](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/anti-patterns.md) governs workflow definitions and is a separate subject.

Owner names where a repair could live. `skill` means routing or wording can prevent it; `host` means it originates outside the skill's control; `method` means it constrains what the evidence can prove rather than what an agent did.

## Retrieval Order

### DA-01. range-spans-prerequisite

"One read covers both sections."

An ordered range read returns a gated operation together with, or ahead of, the prerequisite that gates it.

**Detect:** A single range read whose span covers both a prerequisite section and the operation it gates, with no earlier receipt of the prerequisite.

**Do not flag:** A range that returns only the prerequisite, or an operation whose prerequisite was received in an earlier call.

**Fix:** Issue the prerequisite as its own earlier read. Contiguity in the file is not an ordering argument.

**Owner:** skill. **Observed:** three of four selector walks — [Confirmed failures](validation-evidence/selector-cycle/review.md#confirmed-failures).

### DA-02. batch-stands-in-for-order

"Both reads went out together."

Prerequisite and operation are submitted in one batch, and joint receipt is treated as satisfying the order between them.

**Detect:** A prerequisite and the operation it gates appear in one batch, with the ordering claim resting on their both being present.

**Do not flag:** Batched reads of mutually independent sections, where no member gates another.

**Fix:** Complete the prerequisite before requesting the operation. Order is receipt sequence, not set membership.

**Owner:** skill. **Observed:** Audit one — [Confirmed failures](validation-evidence/selector-cycle/review.md#confirmed-failures).

## Selection

### DA-03. named-operation-read-as-selected

"The route lists these commands."

A generic route names several operations, and their specifications are retrieved although the scenario selected a different tool.

**Detect:** A check or command specification is loaded with nothing in the scenario selecting it; a supplied or fixture tool was selected instead.

**Do not flag:** The generic contract that the selected tool itself runs under.

**Fix:** Select the check, then retrieve its specification. A route that names an operation does not select it.

**Owner:** skill. **Observed:** four exposures, 42 lines — [Confirmed unrelated reads](validation-evidence/final-disclosure-review.md#confirmed-unrelated-reads).

### DA-04. condition-resolved-then-ignored

"Worth seeing the other branch."

A conditional body is read although its selecting condition was never established, or was already resolved the other way.

**Detect:** A branch body whose condition the trace shows unresolved, or resolved toward a different branch.

**Do not flag:** A branch whose condition the inspected change does establish.

**Fix:** Resolve the condition, then read the branch it selects.

**Owner:** skill. **Observed:** five bodies, 63 lines, including Workflow Reports after Which Report selected Standalone — [Confirmed unrelated reads](validation-evidence/final-disclosure-review.md#confirmed-unrelated-reads).

### DA-05. whole-file-for-section-work

"It is all one file."

An entire reference is read for work that a section link already bounded.

**Detect:** A whole-file read where every caller link into that file is section-specific.

**Do not flag:** A file the skill names as a required whole document, and context a required section carries incidentally.

**Fix:** Read the linked heading and its subsections, stopping before the next peer or parent heading.

**Owner:** skill. **Observed:** Author2 read all of `canon-context.md` during mapping-only work — [Live Disclosure Limits](documentation-review.md#live-disclosure-limits).

## Context Admission

### DA-06. discovery-hit-licenses-the-neighbourhood

"The search returned it."

A mandatory lookup locates a hit, and the surrounding unrelated task bodies are then read.

**Detect:** Reads of task bodies adjacent to a discovery hit, with no relevance to the task in hand.

**Do not flag:** The narrow discovery return itself, which a mandatory lookup requires.

**Fix:** Treat discovery as locating an address. Reading the body needs its own reason.

**Owner:** host. The instruction originates outside the skill's routing, so skill wording cannot prevent it. **Observed:** three walks, including 13 unrelated lines and historical integration counts — [Confirmed unrelated reads](validation-evidence/final-disclosure-review.md#confirmed-unrelated-reads).

### DA-07. write-without-instruction-receipt

"The root instructions are loaded."

Artifacts are written into a tree whose own owning instructions were never received.

**Detect:** An artifact write to a path whose owning instruction file has no receipt in the trace. Later source identities do not supply it.

**Do not flag:** A tree whose owning instructions the trace does record.

**Fix:** Receive the owning instructions before writing into that tree.

**Owner:** skill. **Observed:** three of seven traces lack the planning owner's `.engineering/AGENTS.md` — [Required context and limits](validation-evidence/final-disclosure-review.md#required-context-and-limits).

## Evidence Integrity

### DA-08. receipt-mistaken-for-delivery

"The hash matches."

A completeness claim rests on a hash computed after reading, or on an artifact-save receipt, rather than on the return itself.

**Detect:** A claim that content reached the agent, supported by a file hash or a persistence receipt.

**Do not flag:** The returned content, which is the evidence.

**Fix:** Cite the return. A hash identifies bytes after reading and saving an object does not prove its body arrived.

**Owner:** method. **Observed:** [Evidence limits](validation-evidence/selector-cycle/review.md#evidence-limits) and [Preserved failures](validation-evidence/final-disclosure-review.md#preserved-failures-and-performance-evidence).

### DA-09. summary-entry-supports-a-blanket-claim

"Bootstrap completed."

A completeness claim spans trace entries stored only as summaries.

**Detect:** A claim over entries whose content was summarised rather than retained.

**Do not flag:** A claim bounded to entries that retain their raw returns.

**Fix:** Keep the claim inside the retained bytes. A summary preserves the observation, not the content.

**Owner:** method. **Observed:** Audit-final's three summary-only bootstrap entries — [Preserved failures](validation-evidence/final-disclosure-review.md#preserved-failures-and-performance-evidence).

## Using These

A repeat walk that exposes excess again is not confirmation; the reviews stopped the cycle rather than retry it, because repetition established recurrence and not compliance. Treat a clean single walk the same way: Author two passed its bounded scenario, and that did not make the set compliant.

An entry that graduates into the catalog travels by its kebab name, and its number is derived at the destination. The catalog is numbered by file order, so retiring or inserting one entry renumbers every entry after it: the same change that produced the merged shape above took the catalog from 166 to 164. A promotion recorded by number goes stale on the next retirement, and anything citing it goes with it.

Severity sits with the acceptance rule, not with line counts. [Revise](https://github.com/m2ux/workflow-server/blob/d36ad4e260bd993f3c9b7f6220bd53e86e615c5a/skills/workflow-canon/references/revise-mode.md) requires disclosure verification to succeed for every affected mode, and the [observed-behavior rule](https://github.com/m2ux/workflow-server/blob/d36ad4e260bd993f3c9b7f6220bd53e86e615c5a/skills/guidelines.md#disclosure-verification) counts a missing prerequisite or unrelated content as failure, so one instance of any entry above keeps a revision unqualified.
