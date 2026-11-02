# Confirmed Goal

The goal I16's criteria answer to. The user confirmed these clauses on 2026-11-02 and waived the Propose Mode run Plan Mode's first step would otherwise take, so no proposal issue stands behind this initiative.

## Clauses

- **G1.** Every Work Planner mode compiles under prosiform (`pf`) within its default output budget with no warnings.
- **G2.** Work Planner is used through `pf`: SKILL.md bootstraps by running `pf` and following it; sub-agent hand-offs use the dispatch operators (⇉, ⫽) and material read only in some cases uses deferral (¬); a link appears only where the reader must have its content, and prose that merely names another mode uses plain text; links name a section wherever the target has a heading.
- **G3.** The shared skill guidelines (skills/guidelines.md) and the shared check (skills/scripts/check_skill_files.py, with its tests) state and enforce those prosiform rules. The guidelines bind every skill; the check runs over the skills named to it, which in this initiative is Work Planner only. skills/gitnexus, skills/workflow-canon and skills/server-in-the-loop are never edited.
- **G4.** The shared guide defines each check the workspace runs (what it decides, which skills it binds, how it is run, where its tests live) and prose names a check by linking to that definition rather than by bare path.

## Scope Decisions

- **Theme.**  `theme:planning`, board 17 "Process: How Work Is Planned and Delivered".
- **Title form.**  `[I16] Name: Subtitle`.
- **Epics, in order.**  E00 Shared prosiform rules; E01 Checks defined where named (#1427 W08, its AC23 to AC25); E02 Work Planner links (#1427 W03, W06, and W04 with conditional whole-file citations becoming deferrals); E03 Use through pf, with a per-mode bundle-size comparison against a baseline revision in place of #1427's retrieval and efficacy walks.
- **Superseded plan.**  #1427 closes after I16 is published. Its W01, W02, W05, W09 and the efficacy walks are superseded, because prosiform bundles linked content at compile time.
