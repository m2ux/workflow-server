# Decisions

The obligation a citation carries, the scope it may name, and the order the check lands in.

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
| A reader can tell from the instructions that a citation must be read | AC32 | E14 | AC1, AC2 |
| The obligation names the section the reader needs, not the file holding it | AC32 | E14 | AC3, AC4 |
| A citation's scope is decided by a check rather than by the author's care | AC32 | E14 | AC5, AC6 |
| The obligation does not cost the reader more retrieval than the layout it replaces | AC30 | E14 | AC7 |

AC32 answers no requirement of the initiative's source specification. It states what this session's measurement found: the specification requires calling prose to link a specification by name, and says nothing about what the reader owes that link.

## The obligation a citation carries

A citation inside a procedure step is read before that step runs. A citation the reader may decline says so in its own prose.

- **Chosen.**
  The obligation is the default and the exception is marked. The reader needs no rule-by-rule judgment, and an author who wants a citation left optional says which one.
- **Weighed: a verb set.**
  A citation whose sentence carries a conditioning verb — follows, meets, defines, governs, states — binds, and the rest do not. It fits the prose as written and adds no words, and it makes the obligation turn on a word the author chose for its sense rather than for its force.
- **Weighed: a marker on each binding citation.**
  Every binding citation takes a canonical form, as `Read [Name](target) first.` already does. It is unambiguous and decidable by the check, and it adds words to dense step prose across both skills.
- **Why the default settles it.**
  The reader's judgment is what the current wording leaves exposed, and a rule that still asks the reader to classify each citation leaves it exposed. Marking the exceptions puts the judgment on the author, once, in the file that carries the citation.

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

## Chains

Four longest chains, each of three steps, with W01 on every one: W01 to W02 or W03, then to W04 or W05. No whole-epic edge binds the epic.

## Joins

W02 and W03 share one pull request: one rule applied across two skills, where the second skill's citations are the evidence that the rule reads the same in a file the first skill never had. No other eligible pair shares a pull request.

- **W04 and W05.**
  W04 is the check and its specimen suite; W05 is a retrieval record over the live skills. Neither reads the other's output.
