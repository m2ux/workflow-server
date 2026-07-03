# Interpretability Probes — Fresh-Agent Comprehension of Technique Content (Phase 2b)

Date: 2026-07-03. Method: six fresh subagents, each given ONLY one technique's content (plus the minimal step context a worker would have) and asked to (a) restate the protocol as a checklist, (b) name required inputs/outputs and their sources, (c) state the first concrete action, (d) list every forced guess. Probes 2/4/6 received the **actual composed `get_technique` payloads** captured in the live walk; probes 1/3/5 (meta techniques not on the walk path) received member file + inherited group/root contract files with the composition rule explained.

| # | Technique | Shape | Payload |
|---|---|---|---|
| 1 | `meta/atlassian-operations/list-confluence-spaces` | short simple (13 ln) | member + group contract (1.8k) |
| 2 | `work-package/create-issue` | long standalone (114 ln) | live payload (6.3k) |
| 3 | `meta/cargo-operations/check` | composed, group-inherited I/O+rules | member+group+root (3.4k) |
| 4 | `work-package/manage-git/create-worktree` | composed 2-level, `{$var}` locals | live payload (5.0k) |
| 5 | `meta/cargo-operations/run-suite` | components-rich envelope (7 fields) | member+group+root (6.8k) |
| 6 | `work-package/review-assumptions/reconcile` | rules-heavy, largest file | live payload (11.2k) |

## Scoring summary

| Probe | Protocol restatement | I/O identification | First action | Notes |
|---|---|---|---|---|
| 1 | accurate (incl. resolve-once-per-session rule application and correct rule-scoping judgments) | correct; correctly flagged missing Outputs section | correct tool call | |
| 2 | accurate incl. all conditionals + both failure branches + platform mapping tables | correct incl. `needs_issue_creation` gating semantics | correct branch logic | Found a genuine scoping contradiction in step 1 and the tool-name inconsistency (`gh_issue_create` vs `gh issue view`). |
| 3 | accurate; correctly derived `--workspace` from activity context + scope rule | correct with per-layer provenance | correct command | **Caught a real content bug:** `nice -n 19 SKIP_WASM_BUILD=1 … cargo check` is invalid shell (env assignment after nice); also flagged `RUST_TEST_THREADS` budget-list mismatch between group rule and member command. |
| 4 | accurate incl. idempotency/conflict/branch-exists branches | correct; `{$var}` define-local semantics correctly inferred without documentation | correct | |
| 5 | accurate incl. concurrency + wait-for-all + fold rules | all 7 envelope components exact; the 3-failures scenario recorded field-by-field correctly | correct | Flagged the concurrency-vs-foreground-rule tension (real; resolvable but undocumented). |
| 6 | accurate 20-item checklist across 5 phases incl. all convergence conditionals | correct 9+1 inputs, 3 outputs + conditional side-output | correct | Correctly mapped rules→protocol-step interactions; flagged "user review" term undefined under no-user-interaction rule. |

**Verdict: protocol structure transmits.** Six of six probes reconstructed execution semantics faithfully across every shape (short, long, composed, components-rich, rules-heavy). Numbered protocols, `### id` I/O sections, `#### component` envelopes, kebab-case rules, and guard sub-bullets all carried their intended weight — including two-level contract inheritance and the undocumented `{$var}` sigil.

## Convergent failure classes (what every probe had to guess)

1. **Inherited required-but-unused inputs** (probes 2, 4, 6): the work-package root contract's 6 inputs (`planning_folder_path`, `requirements`, `problem_statement`, `target_path`, `branch_name`, `pr_number`) arrive marked `required: true` on every composed technique, yet most protocols never reference them. Probes consistently flagged them as contradictions ("pr_number required before issue creation inverts the usual order") and rationalized them as "contract boilerplate". Compounding: `planning_folder_path`'s description claims every technique "writes its own artifact", contradicted by techniques with no artifact output (flagged independently twice).
2. **Input provenance is never stated** (all 6): nothing in a payload says *where* a value comes from (which prior step/variable). All probes inferred "earlier session state" via the name-match convention — exactly the seam the contract-seam check found breaking on orphan inputs and unmapped renames.
3. **Output delivery mechanics unspecified** (probes 1, 3, 4, 6): "set `worktree_created`" / "compose `check_status`" — but by what mechanism (step report? server call? message)? All probes guessed "report as step output".
4. **Referenced-but-absent sub-resources** (1, 5, 6): links to sibling ops, resource templates (`#scorecard`, `#artifact-template`) — by design (progressive disclosure), but probes noted the exact formats are unreconstructible without a fetch; a worker that skips the fetch will improvise formats.
5. **Session envelope fields unexplained** (2, 4): `session_index: QYGNIA` arrives with no instruction; probes correctly ignored it, but nothing says to.

## Genuine content defects surfaced by probes

- `meta/techniques/cargo-operations/check.md` (and the group rule): env-assignments placed after `nice -n 19` — invalid shell as written.
- `cargo-operations` group `resource-budget` rule lists `RUST_TEST_THREADS` in the mandatory budget; `check.md`'s command omits it with no stated carve-out (fmt has an explicit one).
- `create-issue.md` step 1: platform-ambiguity bullet nested under a section whose trigger is "user provides an existing issue key" — contradictory scoping.
- `create-worktree.md`: `create_branch` description begins with a stray "`. `"; `{$name}` defined then referenced without the sigil (consistent but undocumented).
- `run-suite.md`: "concurrently" + group foreground-only rule with no stated reconciliation mechanism.

Full probe responses: preserved in the session transcript; the six answers were captured verbatim and scored against the source files listed above.
