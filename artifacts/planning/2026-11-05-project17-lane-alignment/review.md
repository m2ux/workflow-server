# Board Alignment Review

## Scope and Completed Checks

- [x] Read all 12 open board issues: two initiatives and ten epics, across two repositories.
- [x] Fetch linked closed epics and cited issue context without editing those closed bodies.
- [x] Validate all open bodies against current templates; review every criterion for the requirement characteristics.
- [x] Publish nine mechanical table corrections; verify exact issue-body readbacks and all ten open epic headers.
- [x] Check both initiative dependency graphs, joined lanes and every existing registered work item.
- [x] Check recorded delivery, thirteen task PR test plans, repository visibility and available branches.
- [ ] Resolve content findings, revalidate affected plans and resume authorized I17 delivery.

Task tables use `Task | Description | Coverage | Depends on | Joins | Lane | Done`. Each added Lane cell is empty. The preservation assertions compare every other cell exactly. Eleven bodies have no remaining formatter finding; E01 has one content finding. Closed historical issues are outside the board alignment's edit scope.

No acceptance criterion is changed or ticked. Current criteria name inspection, tests, inventories or history as their instruments. Neither initiative marks a References entry as **Source.**; their other references remain background. Existing I16 release and baseline questions remain scheduled before their affected epics start.

## Dependencies and Numbering

**Resolved — confirmed and verified.** Skill Style is I17 E01 (#1616), and Skill Separation is I17 E02 (#1615). E02 W01 names E01 W03–W07. The four affected issue bodies and their titles match the published drafts, and the complete I17 graph reports no problem. Active records, reservation, branches and worktrees carry the confirmed names; the obsolete style base is retired. The evidence below is the captured pre-decision row.

Evidence: m2ux--workflow-server--1615.md:40: | W01 | SOLID guidelines for files and operations | AC1 | [E02](https://github.com/m2ux/workflow-server/issues/1616) | | | |

**Resolved — user confirmed and exact publication readback verified.** I16 E05 W01 and W02 share one pull request. The reciprocal joins remove the internal dependency and preserve E02 W01 and W02 as the unit's prerequisite set. The initiative's E05 row takes the derived E02 gate. Both members remain unlaned, and the full I16 graph has no unaccounted candidate unit. The evidence below is the captured pre-decision finding.

Evidence: `I16-dependencies.txt` names “E05:W01, E05:W02 extend main:guidelines.md”; both registered work-item declarations match, and the pair is absent from the supplied `joins.md`.

The I16 report records 16 cross-epic component pairs, separated by its proposed priority map. Its longest chains are 54 chains of 10 steps. I17 records one historical cross-epic component pair and 15 longest chains of 6 steps. E03's delivered W14 numbering advisory stays historical. No component is available for the twelve unplanned E01/E02 rows; their implementation plans must establish it before parallel dispatch. The full reports retain every pair, level and unchecked row.

## Style Activation

**High — pending design decision before implementation.** E01 W01 declares and enforces the new model, while the document conversions are assigned to its successors. The current model explicitly keeps artifact Commands sections and the live skill has numbered-list procedures, entry-point Rules/Conventions and fenced invocations. The work-item plan must define how the first delivery passes Check Skill Files without accepting obsolete syntax as compatibility or enforcing an unmet model over the still-live documents. Candidate resolution: separate checker capability from its activation and place enforcement acceptance at the conversion boundary. This review does not change criteria or dependencies to assert that design.

Evidence: m2ux--workflow-server--1616.md:50: - [ ] **AC1.** The work-planner guidelines, `structure.json` and `rules.json` declare the new style model, and `check_skill_files.py` enforces each skill’s declared model and the proposed command style while every other skill passes unchanged, as checker acceptance/rejection fixtures and Check Skill Files over `skills/` show.

Current source: workspace 03d353300ca4804194fd50d316d73e3bf1270d1d, `skills/work-planner/structure.json` artifact `keeps_commands: true`; entry point Rules and Conventions; `artifacts/issue-body.md` Commands; `modes/deliver-mode.md` numbered-list procedures.

## References

- The reference check passes for eleven issues.
- E01's old `m2ux/md-composer` URLs resolve to canonical `m2ux/prosiform`. The repository API and pinned file responses confirm public visibility and the same pinned source paths. This is resolved evidence; the checker itself reports the alias as unavailable because it indexes only canonical full names.
- E01 cites the private `shieldedtech/midnight-agent-eng` on a public issue. The user explicitly selected that reference for the preceding issue update. Preserve that confirmed reference and record the visibility finding; no source content is published by this alignment.

## Delivery and Branches

- E03 is closed as completed and confirmed Done. I17 remains In Progress; E01 and E02 are incomplete.
- E01 W01 is reserved at its published record, with an isolated task worktree. No worker has started and no task PR exists. The alignment holds further delivery.
- All thirteen existing I17 task PR test plans already use the current form and need no conversion.
- I16 has no pull requests, including body and Development-linked deliveries. Its only remote branch is engineering; main and config/branches are produced by its cutover work. Its base and integration checks remain unevaluable until that planned prerequisite exists. No branch is guessed or created for I16.
- E02's prerequisite E01 is open, so no E02 base is created. E01's sole base is rooted at current workspace with no task changes; an empty integration PR cannot be opened. No open task PR needs retargeting.

## Result

The Lane schema alignment is published and verified. Full alignment remains pending the content decisions above; delivery remains held. The dependency/order decision is applied and verified. The I16 E05 joined-unit decision is applied. Style activation remains pending before implementation. Align step 6 requires “Decide each non-mechanical finding with the user.”
