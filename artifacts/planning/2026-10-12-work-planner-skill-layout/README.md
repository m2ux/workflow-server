# Work Planner Skill Layout — October 2026

> Planning record · Created 2026-10-12

## Executive Summary

Work Planner states 79 command specifications in a single 870-line catalog, 30 percent of the skill's markdown, and all ten of its mode files link into that catalog to reach the handful of operations their procedures run. Thirty-one of those specifications have exactly one caller. The sibling skill, workflow-canon, carried out the same restructure in October 2026: specifications moved to the files whose procedures run them, the shared conventions became a file of their own, and the shared guidelines gained the rules that keep the layout in place. This record holds the decisions that apply those lessons to Work Planner, as epic E12 of initiative I11.

It matters because the guidelines now state rules the skill does not follow, and because two of those rules are decidable by a script that already exists. A rule stated in prose and checked by whoever remembers it is the fault I11 was raised to fix. Extending `skills/scripts/check_skill_files.py` with a rule for a misplaced command specification and a rule for a stray top-level section makes the layout measurable across every skill in the repository at once, so the restructure holds after the session that made it.

## Decisions

- **Vehicle: a new epic, not tasks under E10.**
  E10 Conformance Checks already owns AC19, AC21 and AC23 and would have absorbed this work without argument. A separate epic was chosen so the layout change states its own criteria and carries its own breakdown, rather than arriving as rows under an epic scoped to checks.
- **AC19 moves to E12, restated.**
  It read "specified once and reached by its operation name, as the skill's fixture suite checks each mode file's command links", which asserts a single catalog. Localisation keeps "specified once" and retires the catalog reading, so the criterion now names the file whose procedure runs the command, and names the shared check as its instrument. E10's Coverage drops it.
- **The instrument is the shared check, not a work-planner fixture.**
  Both new rules are added to `skills/scripts/check_skill_files.py`, which binds every skill in the repository. workflow-canon already conforms to both, so the cost is bounded, and gitnexus is measured rather than assumed.
- **Scope stops at work-planner and the shared check.**
  Extending the check turns gitnexus red. Those findings are hoisted as their own issue rather than carried by this epic, which would otherwise take on a skill that has had no guideline review at all.
- **REQ-F045 is amended rather than worked around.**
  The marked source required every command to be "specified once in a commands file", with mode files linking to it by name, so a localised specification would have contradicted it and failed the Correct characteristic. Its rationale is about duplication — several places to correct — which localisation does not cause, since a specification moves whole and is never copied. The requirement now states that a specification sits in the file whose procedure runs it where one procedure runs it, and in a commands file where several do. The disclosure work over the sibling skill is listed as SRC-DOC001 and cited from the requirement.
- **A mode file carries five top-level sections.**
  Prerequisites, Procedure, Reference, Rules and Commands, in that order, each optional but for Procedure and Rules. The shared guidelines previously stated that a section the procedure draws on sits beside it under a heading of its own, which is the licence under which eight bespoke sections stand. Reference is named in the set so content a step consults still has a sanctioned home, and a diverse title names a sub-section of a known whole.
- **What the reader does with a heading places it.**
  Reference holds what a step consults or produces — a table, an output shape, a vocabulary. Rules holds what binds the mode whatever step it is on. An alternative way into the mode is a step of the Procedure. A test was chosen over a list of precedents so the next author places a heading without reading the eight that came before. This gives Placements, Brief, Verdicts, Attribution, Findings, Coverage and Branch Coverage to Reference, and Canon Question to Procedure.
- **Workflow Canon is brought to the set in this epic.**
  The rule stands in the shared guidelines and the check is shared, so the moment it lands it fails Canon's audit and review modes, which carry six bespoke sections between them. Holding those findings under an exemption would ship an instrument with a suppression built in, and leaving the check red teaches people to ignore it. W04 brings Canon to the set, against files restructured in the week before.
- **The catalog survives, smaller.**
  Thirty-six specifications have one caller and move; forty-three have several and stay. Work Planner keeps a catalog where workflow-canon dissolved one, because the shared rule holds a catalog to be correct where most of its entries have several callers.
- **The check's own faults are rows of this epic.**
  A review of the epic base over W01, W03 and W04 found four: the caller count drops the file holding the specification, a catalog counts every third-level heading as one, a caller under another root raises rather than reports, and the section rule never checks that Procedure and Rules are present. They are faults in the instrument this epic builds, so they are corrected here under AC8 to AC11 rather than carried to another epic or left as debt. W05 takes the specification rule, W06 the section rule.
- **The one-caller count is the instrument.**
  W02 is scoped against what the check reports over the catalog, not against a figure read off it by hand.

- **The exclusion is narrowed to a procedure's citation.**
  W05 stopped the check reporting a specification its own file cites. A catalog holds no procedure, so a cross-reference between two of its specifications now excludes one: eleven entries of `commands.md` fall out of the report, each cited by a sibling specification and by one procedure elsewhere. W07 counts the holding file only where one of its procedures cites the specification, and classifies the nine in `canon-context.md` and `change-surface.md` the same way. W08 is scoped against what the narrowed rule reports.
- **The free rows are numbered after the delivered ones.**
  W07, W08 and W09 start after W05 and W06, which a merged pull request names and renumbering cannot touch, so the free numbers begin above them.

- **The caller test is settled by semantics, not by cases.**
  Three corrections to one rule, each written against the cases in hand and each undone by the next piece of work. The reading that holds is the one the shared guidelines state: a file is a caller where one of its procedures runs the command, applied to every citing file alike, with a procedure recognised by carrying a numbered step rather than by a heading spelled Procedure. W09 landed it. W10 settles the one case it leaves: whether a route written as a sentence runs the commands it names.
- **The move finishes on its own branch.**
  The symmetric rule uncovers ten further specifications in the catalog, each masked before by a citation that names a command without running it. They are the move's remainder under the criterion the move already carries, so they land in its pull request rather than in a row beside it.

- **A step is what calls a command.**
  The guidelines already said it, and the epic assumed the opposite: that a route written as a sentence runs the commands it names. Four passages of Workflow Canon settle it. Two of the same shape divide on mood, two that open alike divide on order, and two more divide on count, so every feature that separates one pair joins another. A test over prose would be a conjunction fitted to the sentences in hand, which is what each earlier correction was and why the work after it undid each one. Enumeration is the one mark an author, a reader and the check read alike.
- **Canon's routes are restated, not excused.**
  The twelve specifications the rule leaves silent measure a skill that writes its routes as prose. W12 states those routes as steps, which makes the call visible to the reader and countable in the same edit, and W13 then moves whatever that leaves with one caller.

## Joins

[Check Dependencies](https://github.com/m2ux/workflow-server/blob/fae97e9e/skills/work-planner/references/commands.md#check-dependencies) prints twenty-nine eligible pairs in E12. Two share a pull request and twenty-seven do not.

- **W03 and W04 share one.**
  They are the same change in two skills: the canonical section set applied to Work Planner's mode files and to Workflow Canon's. Landing them apart leaves the shared check red against one skill for as long as the gap lasts, and the reviewer reads the rule's effect once rather than twice.
- **W05 and W06 share one.**
  Both correct a rule the check already carries, in the same two files, against specimens built the same way. One review reads the check's behaviour whole rather than meeting it twice a fortnight apart.
- **The rule corrections join neither the moves nor the renames.**
  W05, W06, W07, W09 and W10 change the instrument; W03, W04, W08 and W12 change the files it measures. A pull request carrying both would move the measure and the measured together, and a finding that appeared or vanished could not be read back to either.
- **Each correction joins none of the others.**
  W07, W09 and W10 each answer a case the reading before it had not been asked about, and each is found by the work that follows it rather than by its own tests. A correction is reviewed against the findings it restores, which the correction before it has to have landed to produce.
- **W08 joins no other row.**
  W08 redistributes 870 lines across seventeen files, and its review is a comparison of every moved specification against its original. The Workflow Canon restructure corrupted four specifications in exactly this move, and the damage was found only by reading the files, after a link check, 71 tests and a structural check had all passed over it. That diff is read on its own.
- **W08 and W12 do not share one.**
  Each moves the specifications of one skill, and the move is the change whose review is that comparison. One diff of that kind is read at a time, and the second move starts against a reviewed first.
- **W11 joins no other row.**
  W11 records a measurement over each mode's retrieval and changes no rule and no mode file. Joining a walk's evidence to a rename or a rule correction would put two unrelated kinds of change under one review.

## Artifacts

| Artifact | What it holds |
| --- | --- |
| [e12.md](e12.md) | The drafted epic body, the source for every later edit to the issue |

## Links

| Resource | Link |
| --- | --- |
| I11 Work Planner | https://github.com/m2ux/workflow-server/issues/1166 |
| I11:E12 Skill Layout | https://github.com/m2ux/workflow-server/issues/1319 |
| Planning board | https://github.com/users/m2ux/projects/17 |
| I11:E10 Conformance Checks | https://github.com/m2ux/workflow-server/issues/1181 |
| Workflow Canon command localisation | https://github.com/m2ux/workflow-server/pull/1296 |
| Canon audit matrices record | https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-11-canon-audit-matrices |
