# Write-time canon enforcement

Planning record for an initiative that makes a definition change comply with the canon when it is written, so an audit that fixes its own findings finishes in one pass. Evidence is in [inventory.md](inventory.md).

## Problem

Canon audits loop: fixes are written without the canon in view, so each fix round introduces findings the next audit must catch.

- **Fix rounds repeat.**
  The #970 corpus audit ran four walk rounds over six lanes, and its surface list grew from 57 to 90 lines as fixes landed.
- **The write-time walk costs as much as an audit.**
  The canon holds 221 units in about 25,000 words. A fixer that must walk every unit binding a file kind before writing skips it, and applies only the entry its finding names.
- **Guards run only when invoked.**
  50 corpus guards run in 6.4 s, yet a guard-detectable defect written mid-pass survives until the next audit runs them.
- **Applicability is implicit.**
  A unit binds until its own prose excludes the file kind, so nothing lists which units apply to a given construct.

## Goal

A definition change complies with the canon when it is written, so an audit that fixes its own findings finishes in one pass.

- **G1  Fix rounds end.**
  An audit pass that fixes its findings reports no finding its own fixes introduced, and needs no follow-up round for them.
- **G2  Guard defects surface at the edit.**
  An agent that writes a guard-detectable defect into a corpus definition is told at that edit, before it moves on.
- **G3  Relevant units are listable.**
  Before writing, an agent can list the canon units that apply to the construct it writes, without reading the whole canon.
- **G4  Every unit declares its reach.**
  Every canon unit states the constructs it applies to, as ids a guard checks against the schemas; a missing, unknown or stale id fails.
- **G5  The write-time walk uses the list.**
  The Author walk loads only the units listed for the constructs a draft writes, and a full Audit still walks every unit.

The user confirmed G1–G5 on 2026-09-30.

## Design

| Epic | Delivers | Goal |
| --- | --- | --- |
| E00 Fix Convergence | Author checks only the lines a pass wrote, closes `fix` findings in the pass, stops on oscillation | G1 |
| E01 Edit-time Guard Hook | A PostToolUse hook runs the corpus guards on each corpus definition edit, failing on branch-introduced failures | G2 |
| E02 Fires-on Ids | The id scheme in the anti-patterns Creation Rules, and a guard failing on missing, unknown or stale ids | G4 |
| E03 Anti-pattern Declarations | A Fires-on line in each anti-pattern entry | G4 |
| E04 Principle Declarations | A Fires-on line in each principle and the conventions section | G4 |
| E05 Construct Index | A command listing units per construct; canon-map File kinds and Author steps 5–6 use it | G3, G5 |

- **Prerequisite outside the initiative.**  #1017 restructured workflow-canon into Author, Audit and Revise modes, with commands.md and walk-rules.md. E00 and E05 edit files it created.
- **Order.**  E00 is delivered. E01 is independent. E02 precedes E03 and E04, which run in parallel. E05 follows both.

## Decisions

| ID | Decision | Alternatives rejected |
| --- | --- | --- |
| D1 | Fix-introduced findings close within the Author pass, checked over the lines the pass wrote | Whole-file re-audit after every fix batch |
| D2 | Each unit declares the constructs it fires on, in its own text | A construct-to-family table in the skill, a second home for applicability |
| D3 | Fires-on ids are generated-schema property paths (`<schema>.<path>`, as `enforcement.json` keys them), a bare schema name for a whole kind, `resource`, `readme`, and `*` | A vocabulary invented by the canon; `schema-construct-inventory.md`, which maps prose patterns to constructs and names no text sites |
| D4 | The index is generated on demand from the declarations, never stored | A committed index file, a copy that drifts |
| D5 | The hook matches `Edit\|Write\|MultiEdit` and exits unless the path is a corpus definition file | Firing on every tool call |
| D6 | The hook fails only on guard failures the branch introduced, as `check:delta` measures | Failing on any corpus failure, which blocks unrelated edits on a branch with a pre-existing failure |
| D7 | The hook and the index are one initiative, as separate epics | Two initiatives for one goal |
| D8 | workflow-canon's frontmatter declares the hook, so it runs from the skill's first invocation to the end of the session; the skill guidelines admit `hooks` | Workspace settings, with or without a Cursor registration |
| D9 | The hook runs every corpus guard; selecting guards by file kind is a non-goal | An epic in which each guard declares the kinds it admits |

## Cross-initiative overlap

| I07 issue | Holds | Overlap with this plan |
| --- | --- | --- |
| [E02](https://github.com/m2ux/workflow-server/issues/940) W03 | Construct tags on every principle and anti-pattern, and a generated construct index (AC4) | The same work as E02–E05's declarations and index |
| [E02](https://github.com/m2ux/workflow-server/issues/940) W05 | A guard failing on a construct tag naming no construct (AC5) | The same guard as E02's completeness guard |
| [E00](https://github.com/m2ux/workflow-server/issues/943) W07 | The canon moves unchanged to the `language` branch | E03 and E04 edit the canon files that move |
| [E01](https://github.com/m2ux/workflow-server/issues/937) | The formal specification, the source I07 names for constructs | D3 names generated-schema paths as the ids |
| [E05](https://github.com/m2ux/workflow-server/issues/938) W06 | The `workflow-canon` skill retired, or narrowed to what the workflow-design skill does not hold | E00 and E05 change `workflow-canon` |
| [E04](https://github.com/m2ux/workflow-server/issues/941) | Draft verification, run by corpus CI before merge | Complementary to E01, which runs at each edit |

The user approved narrowing I07 E02 (D10).

| ID | Decision | Alternatives rejected |
| --- | --- | --- |
| D10 | This initiative owns the construct tags, index and their guard; I07 E02 drops its tag task and tag clauses, and I07 E05 routes through this initiative's index | I07 owning them, with G3–G5 waiting on its chain; folding this initiative into I07 |
| D11 | The hook runs the guards in the `.project/main` of the workspace holding its script, with `--root` naming the edited file's corpus tree; the corpus trees are separate clones, so git links neither to a server checkout | A server path rendered into settings by the deploy script; searching upward for `guards/check-all.ts` with a fallback |
| D12 | The Fires-on line sits directly under a unit's title, before an anti-pattern's two intro lines | After the Fix block, leaving the Entry intro rule unchanged |
| D13 | Only leaf units declare: each `### AP-XX` entry, `##` principle and `##` convention section; a family heading and a Creation Rule carry none | Creation Rules declaring too; every heading, families included |
| D14 | An id covers the field it names and every field beneath it, so E05 matches by prefix | Each id naming one field exactly |
| D15 | Ids name the authored kinds alone, `workflow`, `activity`, `technique`, `routine`, as bare names and path roots | Every generated schema, `condition` and `session-file` included |
| D16 | I09's pull requests target the integration branches `i09/main`, `i09/workflows` and `i09/workspace`, which merge into their long-lived branches once I09 closes | Each epic landing on the long-lived branches as it is delivered |
| D17 | The edit-time hook's branch point is the nearest of the merge-bases with `origin/workflows` and each `origin/iNN/workflows`, so an initiative's corpus branch measures against its integration branch | Always `origin/workflows`, which counts earlier epics' failures as introduced; the branch's upstream, which feature branches here do not set |
| D18 | The hook's path filter includes `routines/` with the other definition directories | Activities, techniques and resources alone, leaving routine edits to the next guard run |
| D19 | The two guard defects that make the hook report unchanged trees as failing land as a fix on `main`: the `refs` message naming whichever file the walk meets first, and corpus walks entering nested `.worktrees/`. `main` then merges into `i09/main` | A W00 on `i09/main`; a workaround in the hook |

## Issues

| Level | Issue |
| --- | --- |
| I09 | [#1023](https://github.com/m2ux/workflow-server/issues/1023) |
| E00 Fix Convergence | [#1024](https://github.com/m2ux/workflow-server/issues/1024) |
| E01 Edit-time Guards | [#1025](https://github.com/m2ux/workflow-server/issues/1025) |
| E02 Fires-on Ids | [#1026](https://github.com/m2ux/workflow-server/issues/1026) |
| E03 Anti-pattern Declarations | [#1027](https://github.com/m2ux/workflow-server/issues/1027) |
| E04 Principle Declarations | [#1028](https://github.com/m2ux/workflow-server/issues/1028) |
| E05 Construct Index | [#1029](https://github.com/m2ux/workflow-server/issues/1029) |
| E06 Integration Evidence | [#1080](https://github.com/m2ux/workflow-server/issues/1080) |

I07 edits, approved by the user:

- **#940 (E02).**  W03 and its criterion removed; AC5 renumbered AC4 without its tag clause; W05 no longer depends on W03; the Proposal names I09 as owner of the tags and index.
- **#938 (E05).**  W04 depends on I09 E05 W01 in place of I07 E02 W03; the Proposal and References route through I09 E05.
- **#936 (I07).**  E05's Depends on is E04 alone, as Check dependencies derives; the Proposal drops "index it by construct"; References add I09.

Each I09 issue's planning-record link points at this record on `engineering`. I09 and its epics are on the Canon board.

## Delivery notes

- **E00.**  #1019 merged into its stacked base after that base had merged; #1021 carried it into `workspace` and delivers E00 W01–W03.
- **E02.**  #1034 (W01, into `i09/workflows`), #1035 (W02, into `i09/main`), and #1036 (the canon map's Creation Rules binding, into `i09/workspace`). Implemented, tested and reviewed by separate agents over two review passes; D12–D15 came from those passes. The work-planner skill and the workspace instructions state D16's rule for every initiative (#1037, into `workspace`), and the server's instructions keep only which branch holds code and which holds definitions (#1039).
- **E03–E05 after E02.**  Folded D13–D15 in, with the user's approval:
  - #1027 W01 starts at the Structural family, since Creation Rules carry no line.
  - #1028 AC3 lets a broader id cover a covering entry's ids.
  - #1029 matches by prefix (AC2, AC3), reads through the guard's exported declaration reader, and adds AC6: exactly one line per unit, directly under its title, delivered by W02.
  - Check format reports no problem on any of them.
- **E06.**  The Fires-on rule on `i09/workflows` and the hook declaration on `i09/workspace` are cited in [e06-rule-and-hook.md](e06-rule-and-hook.md). The edit-guard fixture suite on `i09/workspace` passes, recorded in [e06-edit-guard-fixtures.md](e06-edit-guard-fixtures.md). No principle names a covering entry, recorded in [e06-covering-principles.md](e06-covering-principles.md). The guard and listing fixtures on `i09/main` pass, recorded in [e06-guard-fixtures.md](e06-guard-fixtures.md). The paired guard is clean, recorded in [e06-paired-guard.md](e06-paired-guard.md). The listing command over the canon homes is recorded in [e06-listing.md](e06-listing.md).

## Reviews

### Goal pass, drafts, 2026-09-30

| Goal | Initiative criteria | Epics | Epic criteria |
| --- | --- | --- | --- |
| G1 | AC1 | E00 | AC1–AC4 |
| G2 | AC2 | E01 | AC2, AC4–AC6, AC8; AC1 and AC7 enable the declaration |
| G3 | AC5 | E05 | AC2, AC3 |
| G4 | AC3, AC4 | E02, E03, E04, E05 | E02 AC1–AC4; E03 AC1, AC2; E04 AC1–AC3; E05 AC1 |
| G5 | AC6, AC7 | E05 | AC4, AC5 |

| Finding | Severity | Resolution |
| --- | --- | --- |
| An initiative criterion on hook scope traced to no clause | Medium | Left to E01 AC3; removed from the initiative |
| AC1 named a pull request number | Low | Cites the dated audit record as its baseline |
| The listing criterion restated E05's | Low | Raised to G3's outcome |
| A guard run that cannot measure would pass the hook silently | High | E01 AC8, delivered by W03, and a fixture case in AC6 |
| I07 E00 moves the canon to the `language` branch while E03 and E04 edit it | Medium | In-flight threat: each declaration task rebases onto wherever the canon lives when it starts; the move carries content unchanged |
| E04 AC3 reads E03's ids | Medium | E04 depends on E03 |

Check dependencies over the drafts: no problems, no advisory. Longest chains run six steps, from E02 W01 through E02 W02, an E03 task and an E04 task to E05 W02 and W03.
