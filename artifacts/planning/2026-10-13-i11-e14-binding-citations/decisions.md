# Decisions

The obligation a citation carries, the scope it may name, and the order the check lands in.

## Targets

Three targets every reading rule in the workspace serves, stated in the shared guide because they bind any skill, not these two.

- **Payload size.**
  The sections a run injects are as few as the work allows. A rule that pulls a file where a section serves spends context the work never uses.
- **Sameness across runs.**
  Two runs of one mode inject the same set. A rule that leaves the reader to decide what a step needs buys variance, which is why the defaults are stated and the read set is derived rather than inferred.
- **A maintainer can read it.**
  The rule and the prose it governs can be reviewed without running either. A form a script decides is worth its constraint only where a human reading the same line reaches the same verdict.

Where one target costs another, the guide states which it buys. The manifest is the case in point: it spends a generated file to make the payload reviewable and the injection set determinate.

## Measurements

Counted over each skill's `SKILL.md`, `references/` and `templates/`, excluding fenced blocks and code spans, on `3c0f1ff5`.

| Skill | Internal citations | Naming a heading | Naming a whole file | In the prerequisite form |
| --- | --- | --- | --- | --- |
| Work Planner | 550 | 431 | 119 | 0 |
| Workflow Canon | 130 | 99 | 31 | 2 |

Of Work Planner's 119 whole-file citations, 42 stand inside a procedure step and name a mode file: 13 Sync, 9 Plan, 6 Advance, 4 Align, 3 Understand, 3 Hoist, 2 Propose and 2 Deliver. The rest are the entry point's mode and template listings, and the short single-subject files a reader takes entire.

## Trace

| Goal clause | Initiative criterion | Epic | Epic criteria |
| --- | --- | --- | --- |
| An author weighing two layouts has the targets to weigh them against | AC32 | E14 | AC1 |
| A reader can tell from the instructions when a citation is loaded | AC32 | E14 | AC2, AC3, AC4 |
| The obligation names the section the reader needs, not the file holding it | AC32 | E14 | AC5, AC6 |
| A whole-file citation says which case calls for it, or calls for every case | AC32 | E14 | AC7, AC8, AC9 |
| A prerequisite is met where the step that needs it stands | AC32 | E14 | AC10, AC11, AC12 |
| A link is what the reader opens | AC32 | E14 | AC13, AC14, AC15 |
| A citation's scope is decided by a check rather than by the author's care | AC32 | E14 | AC16, AC17, AC18 |
| The payload a run injects is derived and reviewed rather than inferred | AC32 | E14 | AC19, AC20, AC21 |
| A check is met as a purpose rather than a path | AC32 | E14 | AC24, AC25, AC26 |
| A bound step is performed with the content its citation names | AC33 | E14 | AC22 |
| The obligation does not cost the reader more retrieval than the layout it replaces | AC30 | E14 | AC23 |

AC32 answers no requirement of the initiative's source specification. It states what this session's measurement found: the specification requires calling prose to link a specification by name, and says nothing about what the reader owes that link.

## The obligation a citation carries

The text preceding a set of citations states when they are loaded. Where it states nothing, a citation inside a procedure step is read before that step runs.

- **Chosen.**
  The form both skills already use is the rule. The entry point states that the selected mode's file is read in full before its links are followed, and a mode file's Prerequisites states that the command conventions are read before its first specification. Stating that form makes the timing an author's statement rather than a reader's inference, and the default covers the step whose prose says nothing.
- **Weighed: a verb set.**
  A citation whose sentence carries a conditioning verb — follows, meets, defines, governs, states — binds, and the rest do not. It fits the prose as written and adds no words, and it makes the obligation turn on a word the author chose for its sense rather than for its force.
- **Weighed: a marker on each binding citation.**
  Every binding citation takes a canonical form, as `Read [Name](target) first.` already does. It is unambiguous and decidable by the check, and it adds words to dense step prose across both skills.
- **Why the preceding statement settles it.**
  A rule that asks the reader to classify each citation leaves the judgment where the gap already is. A statement ahead of a set of citations puts it on the author, once, in the file that carries them, and the default decides the step whose author said nothing.

## The condition a whole-file citation carries

The prose ahead of a citation whose boundary is a whole file states the case in which that file is read. Where it states none, the file is read in every case.

- **Chosen.**
  A whole file is the largest claim a citation can make, so it is the one that owes the reader a condition. The entry point's mode listing states its condition — the selected mode — and its template listing names six whole template files with none, for a reader who takes the one its issue kind calls for.
- **The default is the strongest reading.**
  An omitted condition means always, not sometimes. The cost of leaving it out falls on the author who left it out, so the pressure runs toward stating the condition or narrowing the scope, never toward a reader guessing which case applies.
- **Weighed: an omitted condition meaning the reader decides.**
  It keeps the prose as written and returns the judgment to the reader, which is the gap this epic closes.
- **Weighed: forbidding a whole-file citation outright.**
  Short single-subject files, templates and mode files are read entire, so a prohibition would be worked around with a title anchor that says less than a stated condition does.

## The scope a citation may name

Every internal citation names a heading. A document read entire is cited by its own title heading.

- **Chosen.**
  No file declares how it is read. A citation that names no heading is removed or retargeted to the section the reader needs, and the structure carries the scope.
- **The title anchor is the whole-document form.**
  The Linked sections rule already resolves a heading citation to that heading's section and its subsections, so a citation of a file's title heading is that whole file, bounded by a rule both skills already state. The entry point's mode listing and its template listing take that form.
- **Weighed: a declaration in the cited file.**
  A line under the title stating that the file is read whole. One statement per file and visible to the reader who opens it, and it adds a second way to say what the title anchor already says.
- **Weighed: a list in the shared guidelines.**
  One place to audit, a second home for a fact about each file, and it grows with every skill.
- **Why the structure settles it.**
  Under a binding default, scope is what the obligation costs. A citation that names a whole file where a section was meant charges the reader for the rest of it, and the skill that wrote the citation is the one that can name the section.

## The order the check lands in

The shared skill-file check gains the heading rule after both skills comply.

- 150 citations across the two skills name no heading, so a check that reports them lands red on the branch it grades.
- The rule is stated first, both skills are brought to it, and the check is the last task, so no branch carries a failing gate.

## Where a prerequisite stands

A Prerequisites section carries what every step needs, or what its first step needs. A prerequisite one later step needs is cited in that step.

- **Chosen.**
  The guidelines already call a citation pointing further down its own file a defect, because a sequential reader meets it after the point it was meant to serve. The same reasoning runs backwards: a prerequisite stated eight steps before its use is held across work that does not need it, and the rule reusing content already read at the same revision tells the reader not to load it again where it is needed. Stating it at the step closes both.
- **A link is not content.**
  Re-citing at the point of use does not refresh what was read; it re-presents the pointer. The gain is that the reader meets the obligation where the work is. Placement is what makes that gain reliable, which is why the rule moves the prerequisite rather than qualifying the reuse.
- **Weighed: a point-of-use citation overriding reuse.**
  Simple to state, and it pays the retrieval cost twice on every long procedure.
- **Weighed: a freshness qualifier on reuse.**
  Reuse holds within a stated distance and a citation beyond it reloads. Precise, and it adds a measure every author must judge.
- **The canonical form is the spelling at the step.**
  `Read [Name](target) first.` stays. Preceding text governs a set of citations; this form governs one, where it stands, and it is the only citation obligation the shared check can decide.
- **The instances.**
  Three in Work Planner state a condition and sit far from their use: Delivery State in `plan-mode.md` and `work-breakdown.md`, and Graph Conventions in `understand-mode.md`. The command-conventions line every Prerequisites section carries holds, since every step's commands need it.

## The default outside a procedure

A citation in a Rules or Reference section is read when the reader reaches a case the rule carrying it governs. Where its prose states no case, it is read in every case.

- **Chosen.**
  The binding sections of both skills are Rules sections, so leaving them unbound would leave the gap this epic closes in the place it matters most. Tying the read to the rule's own trigger costs nothing on entry.
- **Weighed: the step default applied everywhere.**
  One rule and no section test, and a Rules section carrying ten citations would load ten files on entry.
- **Weighed: no obligation outside a Procedure.**
  The smallest change, and it exempts exactly the citations that carry the skill's binding rules.

## What the epic must evidence

Each efficacy scenario puts the content that decides its outcome outside the files a broad read loads, so the result shows whether the citation was honoured.

- **Chosen.**
  The guidelines state that retrieval order measures file layout wherever the reader loads the file whole, so a walk shows a citation failing and never shows one working. A target broad reading does not reach is the only design that can show one working.
- **Scenario design.**
  A scenario names a task whose correct outcome follows from a rule held in a section no step of the selected mode file loads by itself, and whose incorrect outcome is what an agent produces from the mode file alone. The record names each scenario, its target, the outcome that distinguishes them, and the result.
- **Weighed: the retrieval record alone.**
  A retrieval record measures cost; only a passing comparison under the pinned baseline contract satisfies the initiative retrieval criterion. Neither proves citation obedience, which requires the efficacy scenarios.
- **Weighed: a scored eval suite.**
  The strongest ongoing signal and an epic's worth of work on its own.

## How the read set is made determinate

The shared script derives each mode's read set from its own citations and writes it as a manifest beside the skill. The check reports a manifest that disagrees with the prose it came from.

- **Chosen.**
  The prose stays the single home of every citation, so nothing drifts; the manifest is what a maintainer reads to see what a run costs; and a reader with a derived set no longer infers one. It serves all three targets at the price of a generated file.
- **Weighed: a hand-written read set per mode.**
  Visible in the file itself and determinate, and it duplicates every citation, so the prose and the list disagree the first time either is edited.
- **Weighed: per-step citations alone.**
  Lowest cost and no new surface, and it leaves two conformant runs free to inject different sets, which is the variance the fidelity target exists to remove.
- **Every skill.**
  The manifest is generated for each skill directory in the repository, not for these two, since the rule it derives from binds the workspace.
- **Validation only.**
  Nothing in a run reads it. It detects a prose edit that moves the payload and it shows a maintainer what a mode costs; it does not enforce the set a run injects, and two runs can still differ.
- **Weighed: the run reading its step's row.**
  It would remove the last inference, and it puts a generated file in every run's context and lets a stale manifest change behaviour rather than fail a check.
- **Weighed: the manifest as the authority.**
  Maximum determinism, and an author editing prose would no longer be editing behaviour, which inverts the rule that the prose is a citation's single home.

## Where a check is defined

The shared guide defines each check the workspace runs — what it decides, which skills it binds, how it is run, where its tests live — and prose names a check by linking to that entry.

- **Chosen.**
  The guide names `skills/scripts/check_skill_files.py` as a bare code span and states the folder layout without saying what any check decides, so a reader meets a path and no purpose. A defined entry gives a check the same treatment a command specification already gets.
- **Same defect class as the rest of the epic.**
  A bare path is a citation naming no target and carrying no obligation. The Links rule reaches markdown files only, which is why scripts fell outside it.
- **A gap it exposes.**
  Workflow Canon carries ten scripts and no test folder. The entry for each of its checks has to say what keeps it, which is where that gap becomes visible rather than inferred.

## What the sample settled

[Plan mode rewritten under every rule](sample-plan-mode.md) is the shape the user approved on 2026-10-14, and the reference every citation task follows. Two findings came out of writing it.

- **A body template carries no heading of its own.**
  The six templates open at `## Overview`, and an `# H1` would land inside every issue body written from them. The heading rule therefore binds a citation only where its target carries a heading; a template is cited whole, with its case stated.
- **A per-file lead-in costs more than it buys.**
  A first draft opened the Procedure with a line citing the shared Links rule. Ten mode files each citing the shared guide means ten runs opening a file they otherwise would not, against a target the rule is meant to serve. The obligation stands once in the entry point every mode already opens.

## Chains

Final evidence follows citation changes: W10 depends on W06, W07 and W09; W09 depends on W08, which depends on W05. W11 follows W10. W05 is therefore a transitive prerequisite of both final evidence tasks. Task identities remain stable; their numbers do not imply dispatch order.

Final manifests and final efficacy/retrieval walks identify the settled corpus revision. Later input changes require regeneration of affected evidence. Generator implementation and its documentation are included before the final walks.

## Joins

E14:W03 and E14:W04 share one pull request: the same section-citation rule applied across Work Planner and Workflow Canon, with both skills supplying its evidence.

Every eligible separate pair is recorded in [current E14 pair decisions](../2026-10-31-project17-plan-review/joins/E14-pairs.md). Dependency edges order the check definitions, final manifests and final walks; these are not independent pairs.

## Final retrieval verdict

E14 W11 owns I11 AC30 through E14 AC23. E10 W23 supplies measurements; E10 W26 completes verification of its contributing changes. The [pinned comparison contract](../2026-10-31-project17-plan-review/retrieval-baseline.md) defines baseline, scenarios, metric and pass conditions. E12 records remain historical measurements, not proof of this final verdict.
