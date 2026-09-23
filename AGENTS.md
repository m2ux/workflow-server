# Workspace Instructions

- **Here:** how work is conducted, how prose is written, and the local code index.
- **Repo:** whatever survives a fresh clone on any machine — setup, boundaries, testing and PR mechanics.
- A rule that names a path on this machine, or a tool not in `package.json`, belongs here rather than the repo.
- **Edits to *this* file shall be succinct.** State the rule, not the reasoning behind it. Keep an example only where it makes the rule followable.
- *Always* follow the [Project Instructions](/components/main/PROJECT.md)


## Design principles

- No backward compatibility. Remove obsolete paths rather than adding compatibility layers, fallbacks, or migrations.
- Simplest implementation that fully meets requirements — no speculative abstraction, configuration, or indirection.
- Grow in layers: smallest version that works end to end, then build on a product that already works.
- Never trade working for unfinished.
- Modular components, separated concerns (see SOLID)
- Prefer established libraries to reimplementing. Check a library's docs and types before assuming it lacks a capability.
- Exhaust existing dependencies before adding a package.
- Decide for the long term. No stopgap meant to be replaced later.
- Obey SOLID principles (Single responsibility, Open–closed, Liskov substitution, Interface segregation, Dependency inversion) when making changes to both source and documentation.



## Code and Documentation

- Follow existing patterns
- Clear, professional language
- No process attribution in comments (“Added by agent”).
- **Describe the design, not the change to it.** Definitions, code and doc comments, and **commit subjects** state the system as it is, present tense, without naming what they replaced (eg write `account for token usage per dispatch`, not `move usage accounting off the transition and onto the dispatch`). For an absent value, say what holds when it is missing. Cut “instead of”, “no longer”, “previously”, “unchanged behaviour”. Canon: [Document in Positive Present](/home/mike1/projects/dev/workflow-server/workflows/workflow-design/resources/design-principles.md#17-document-in-positive-present).
  - A live hazard survives, stated as an invariant: *a marker is unreadable to a context that never received the bytes* — not *this is why the old rule forbade it*.
  - Exceptions: issue and PR bodies, and commit bodies. A reviewer needs the before-state; nothing that persists past merge does.
  - After a behaviour change, grep out surviving descriptions of the old one — doc comments, tool descriptions, technique `## Rules`, resource prose, READMEs. A stale claim reads as current fact.
- **Prefer removing the thing that needs a prohibition.** Prose warning "do not also use X" usually means two paths now do one job. Retire one and the warning goes, along with the validation that policed the overlap.



## Issues and PRs

Reference example: [#395](https://github.com/m2ux/workflow-server/issues/395). [#394](https://github.com/m2ux/workflow-server/issues/394) is the same material after conversion. Write to this mandate directly — do not draft in shorthand and translate after.

- **Explain the situation before naming it.** Ordinary sentences first, then the concept's name. Never open with a term of art the reader hasn't been handed.
- **Title:** `Name: plain description`**.** No conventional-commit prefixes, no abbreviations ("references", not "refs"), no anti-pattern numbers, no code tokens unless the token is the subject.
- **No file:line citations in the body.** Evidence reads as prose. Citations, traces and surveys go to `.engineering/artifacts/planning/`, linked once under **Investigation detail**.
- **Spell out jargon.** "Phase 0/1/2" becomes named stages; shorthand like fold-by-reference gets a sentence or a definition on first use. Reference an anti-pattern by name with its meaning stated, so the reference corroborates rather than being required reading.
- **One paragraph per stage, and no section that restates another.** Where a "what was verified" section states what was proved, an acceptance-criteria list repeats it. Cut the prose around the counts, never the counts.
- **Shape:** Summary → what happens today → the fix (named stages) → scope → what was verified → non-goals. Add "why now is cheap", acceptance criteria or investigation detail only where each carries something no other section does.
- **These bodies narrate against what preceded them.** They are the one sanctioned home for before/after; everything persisting past merge stays in positive present tense.
- Prefer replacement over accretion. When updating PR bodies. Don't narrate history. Don't add changes as comments. Replace the body with the version correct today.



## User Interaction

- Words cost tokens! Be as succinct as possible *without* compromising fidelity.
- First and foremost your job is to *maximise* fidelity while *minimising* cognitive load
- Reponses should use plain language and be as succinct as possible
- Prefer bullet points instead of large blocks of prose when responding to the user
- For responses that concern system design should split by area of concern in the system eg corpus, guards, tests, source. 
- Each area of conern should be titled and sub-divided into a bulletted list of problem/solution pairs with one plain-language paragraph for each of the problem solution. Jargon should be disambiguated. Use two space seperators between title items.
- When user input is required to reconcile outstanding issues or design choices, present the user a sequence of questions, one-at-a-time, interview-style. Each question should have multiple choice answers with a recommended option. Each question should be preceded by a plain-language paragraph worded to aid the decision kaing process.
- Always treat user requests at the start of a new chat as an incomplete specification. Use the interview style to illicit further information fromf the user until you are confident you have sufficient understanding to properly proceed.



## Commits and pushes

- **A fix belongs in the pull request whose code it fixes.** A defect found while reviewing a branch is corrected on that branch, not carried onto a later one in a stack. Amend, rebase or force-push as needed to put it there — a branch with no other contributors is yours to rewrite.
- **Commit incrementally while building.** Distinct work lands as its own commit, so the branch records how it was built. That is about not collapsing unrelated changes into one commit; it is never a reason to leave a fix in the wrong place.
- **Push with plain** `git push`**.** When a push will not fast-forward on a branch someone else may hold, stop and ask rather than rewriting.



## Task management

- Complete **one** task at a time unless the user asks for multiple.
- For multi-step work, use todos and mark them complete as you finish; only one todo in progress at a time.
- Request permission before starting a new task or making changes outside the current request.
- *ALWAYS* use a local work-tree when working on a branch