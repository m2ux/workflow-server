# Single-Condition Preamble Validation

Source: `d6be48053b4d74333d742a140df5e187e6c344d9`.
Baseline: `c05a6a1818495506695592729273db9d8a14aa19`.

The four command specifications with a single prose detail item place that unchanged text in their opening paragraph, before the invocation and without a bullet. Related sentences remain together. Genuine multi-item command lists retain their existing layout below the invocation. The existing Spec Layout guideline states this distinction.

Affected commands: Board Delivery / Compute Dispatch Status, Dispatch Batch / Check Dispatch Start, Lane / Write Lane Assignments, and Task Body / Sync Task Issue. Every condition and refusal remains present. All 117 HTML invocation blocks, nine literal templates, heading identities and link contents are identical to the baseline. Other Markdown files are byte-identical except the owning guideline.

Installed model: 58 files, zero findings. Existing document tests: 14 passed. Existing documented-command behavior tests: 14 passed. `git diff --check` passes. Runtime scripts and consumed templates have no edits; no new test or full-suite rerun is needed for this prose-only presentation change.

Reading paths retain the same callable headings, links and section boundaries; only a paragraph's position inside its selected command changes. Representative Lane and dispatch command consumers pass. No fresh-context reading-path or live tracker/graph claim is made.

From the product checkout, run the saved verification script through the project sandbox helper with this record's `inventory.json` and the baseline SHA as arguments. It checks all 58 Markdown files, exact preserved content and each single condition's position. Saved logs record the existing model and consumer checks.
