# Fresh-Context Consumer Trial A

- Checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/i17/e02/w01-solid-guidelines-fields-and`.
- Requested and observed HEAD: `16134a257bc32f995c68929dcda335b9868c068b`.
- Initial and subsequent `git status --porcelain=v1 --untracked-files=all`: empty. No source edits, tracker calls, commits, pushes, or child agents. Only this receipt is written outside the checkout.
- Scope: determine the route and review obligations for a small artifact field-contract edit; assess the guideline boundary. No particular artifact, field, or changed value was supplied, so this is a route assessment, not acceptance of an actual change or observed policy outcome.

## Actual Read Receipt

1. `skills/work-planner/SKILL.md`: whole, complete. Selected Revise from Modes; no other mode selected.
2. Root `AGENTS.md`: whole, complete, read with SKILL. Checked for `skills/AGENTS.md` and `skills/work-planner/AGENTS.md`; neither exists. The checkout has no `.project` directory.
3. `skills/work-planner/rules.md`: whole, complete, including Linked Sections, Layers, Execution and Link Roles.
4. `skills/work-planner/conventions.md`: whole, complete.
5. `skills/work-planner/modes/revise-mode.md`: whole, complete, including Procedure, Outcomes, Commands and Fields. Reading the whole mode returned conditional command specs before selecting their conditions; none were executed.
6. `skills/guidelines.md`: whole, all 198 lines. Required by Revise step 1. The initial batch was truncated overall; this document appeared complete, but I reread explicit ranges 1–100 and 101–198 to remove receipt uncertainty.
7. `skills/work-planner/guidelines.md`: whole, all 322 lines. Required by Revise step 1. Initial batch omitted a middle region; recovered with complete ranges 1–170 and 171–322. Relevant sections: SOLID (especially Field Boundaries and Policy Review), Procedure, Prose, Operations, Artifacts, Progressive Disclosure and Changes.
8. `skills/work-planner/rules.json`: targeted search only, not whole. Returned the five `review` registrations for state constraints, callable transformations, boundary review, matched contexts and evidence controls (lines 14–18).

Retrieval observations:

- One batched whole-guidelines read exceeded output capacity. No required text remains missing after bounded recovery. Recovery repeated already-received material; no token-savings claim is supported.
- Whole-file guidelines include guidance specific to modes, protocols, references, entry points and scripts beyond this artifact edit. This is mandated breadth, not an inferred transitive-link dependency.
- Ancestor-instruction discovery listed filenames for unrelated worktrees via `rg --files ... | head -40`; their contents were not read. This discovery was broader than needed.
- An ancestor-instruction shell loop was blocked before execution by the dynamic-shell hook; literal-path checks replaced it. A quoted heredoc receipt write was also blocked because the hook detected Markdown backticks; apply_patch replaced it. Commands emitted stream-fd warnings but returned requested source text.
- Same-revision common context was reused. Links back to Rules, shared Prose, SOLID and procedure guidance did not trigger recursive rereads or execution. I did not open body artifacts, board/graph operations, other modes, or policy implementations without a selected need.

## Instructions and Checks for the Edit

- Follow Revise; read both whole guideline files; clarify the field change; locate its owning artifact, callers/citations, scripts, docstrings and tests stating the contract (Revise steps 1–2).
- Use a dedicated linked worktree on the change branch; preserve root edits and keep open-PR corrections on their branch. Edit the rule's one home; update linked callers in the same change when public shape or home changes (local guidelines 44–49; Revise 3–4).
- Define actual representation, types, members and absent/empty cases. Keep state constraints in Fields, action gates in their performing step, and every existing condition (local 236–239, 257–260).
- Classify Fields by supplied evidence, produced result, owning subject and disposition. Diagnostics are leads; semantic review decides (local 51–58). Relevant rules.json entries say `review`; lint alone cannot settle the boundary.
- Review changed files for layout, terminology, one rule home, stale claims, command-owned I/O, links/anchors, common prerequisites and disclosure boundaries (Revise 5).
- Run Check Skill Files for every affected skill: `python3 skills/scripts/check_skill_files.py skills/work-planner`, using the specified absolute sandbox wrapper. Preserve output, finding count and exit status. Resolve required files, commands and headings (Revise 6).
- Run `python3 -m unittest discover -s test` from `skills/work-planner`, under the wrapper, when an executable script, consumed template or test changes. Shared Changes additionally requires passing skill and affected checker/integration suites; state what actually ran. If moving sections, run Compare Section Bodies for base/head and inspect added, removed or differing sections. Check frontmatter if SKILL.md changes.
- Record disclosure verification for affected consumer routes and required whole files. Changed reading paths require independent fresh-context trials and repetition before claiming consistency. This reader does not dispatch them.
- After actual implementation and verification, commit distinct changes, push and report file changes. Delivery actions are outside this read-only trial.

## Boundary Assessment

- **State constraints:** clear. Fields may contain values, types, permitted states, invariants, conditional constraints and schema examples. A conditional word alone establishes no violation (local 53–58). A conditional invariant therefore needs no extraction solely because it says “if”.
- **Derived decisions:** clear. Evidence gathering, derivation, state/membership selection, execution, refusals, retries and continuation are callable behavior even when declarative (55–56). A nameable derived result owns an artifact and operations even without a persisted document (220–239). Fields owns shape; an operation derives it. A single-reference operation may be inlined under the explicit operation-scope rule while retaining field and command homes (230).
- **Policy interpretation:** clear review guard. Compare identical inputs and entry conditions; retain pinned source, prose, observed outcomes and owning contract; preserve competing interpretations and obtain confirmation before a policy-changing fix (60–65). Actual captured evidence, not keywords or copied strings, distinguishes outcomes. Ordinary definition cycles and bounded retries are named valid controls.
- **Read versus execution:** clear. Only explicit prerequisite edges impose before-use order; field references and retries do not. Only an explicit execution call runs a linked procedure (30–35; Rules/Execution). Reading a field contract does not execute linked artifact operations.

## Limits and Unresolved Questions

- Semantic categories and confirmation boundary are actionable and unambiguous for this bounded task. This trial establishes no actual policy inconsistency or field violation.
- “Classify every Fields section” (58) does not expressly delimit the audit to changed artifact, affected consumers, or entire skill. I would use the changed artifact and affected consumer surface established by Revise 2. A whole-skill audit would need explicit scope. This is a review-scope question, not uncertainty about what belongs in Fields.
- Without a named artifact/change, exact callers, applicable tests, captured policy data and decisions needing confirmation remain unknown. No structural checker or script suite was run; no implementation acceptance is claimed.
