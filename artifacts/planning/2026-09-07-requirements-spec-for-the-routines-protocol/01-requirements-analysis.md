# Requirements Analysis Report

## Sources
**Analysis Date**: 2026-09-07

- **Source ID**: SRC-DOC001
- **Title**: Routines — proposal
- **Attribution**: Mike Clay
- **Source Path**: `.engineering/artifacts/planning/2026-09-03-routines/README.md`

- **Source ID**: SRC-DOC002
- **Title**: What this folder owes before planning starts
- **Attribution**: Mike Clay
- **Source Path**: `.engineering/artifacts/planning/2026-09-03-routines/gap-review.md`

- **Source ID**: SRC-DOC003
- **Title**: Routines — decision record
- **Attribution**: Mike Clay
- **Source Path**: `.engineering/artifacts/planning/2026-09-03-routines/decisions.md`

## Requirements Changes

### New Requirements

The target does not exist, so every requirement is new and takes status `pending`. Section 4 groups are `P0` except *delivery and tooling*, which is `P1`.

**Section 3 — key success criteria**

| ID | Criterion | Source |
|---|---|---|
| SUCCESS-001 | Two uses of one shared run cannot disagree on their steps — the ten measured differences across four copies have nowhere to live | SRC-DOC001 |
| SUCCESS-002 | A shared run's variables are declared once: 28 declarations of 7 variables collapse to 7 | SRC-DOC001, SRC-DOC003 |
| SUCCESS-003 | A shared run's declared signature is held against what its steps do, and a disagreement is refused at load | SRC-DOC001 |
| SUCCESS-004 | A shared run is checkable with no host workflow in sight | SRC-DOC001 |
| SUCCESS-005 | A shared run's writes are visible to the producer index — 20 parameter bindings today, 7 with no declared write anywhere | SRC-DOC001 |
| SUCCESS-006 | Every option of every gate inside a shared run is exercised once, independently of which hosts a walk reaches | SRC-DOC001 |
| SUCCESS-007 | The 192 lines of byte-identical convergence-loop structure exist once | SRC-DOC001, SRC-DOC002 |

**Section 4 — Functional Requirements**

| ID | Group | Requirement | Source |
|---|---|---|---|
| REQ-F001 | Definition | A routine is declared in `routines/<name>.yaml`, one file per routine, with no filename position number | SRC-DOC001, SRC-DOC003 |
| REQ-F002 | Definition | A routine declares `id`, `version`, `name`, `description`, `inputs`, `outputs`, `internals` and `steps` | SRC-DOC001 |
| REQ-F003 | Definition | A routine input is a named parameter with an optional default | SRC-DOC001 |
| REQ-F004 | Definition | A routine output declares an id, a type and a description, and no default, a default being a seed the routine does not own | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-F005 | Definition | A routine internal declares an id and a description and nothing else, and never enters the workflow's variable set | SRC-DOC002, SRC-DOC003 |
| REQ-F006 | Definition | A routine's `steps` admit technique, action, checkpoint, loop and routine steps | SRC-DOC001 |
| REQ-F007 | Definition | A routine has no free variables — every name its body reads or writes is a declared input, output or internal, an artifact filename template excepted — and a body naming anything outside those categories fails the load | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-F008 | Definition | An internal may serve as a loop's item variable and may hold a collection; one nothing writes, and one nothing reads, each fail the load | SRC-DOC002, SRC-DOC003 |
| REQ-F009 | Definition | A routine carries its own version, and changing it leaves every referring activity's version standing still | SRC-DOC001, SRC-DOC003 |
| REQ-F010 | Reference site | A `kind: routine` step names the routine, binds its inputs under `with` and its outputs under `outputs`, and carries the site gates every step kind carries and nothing about routing | SRC-DOC001 |
| REQ-F011 | Reference site | A `with` binding admits the step binding's scalar union — string, number or boolean — a collection argument being a JSON string | SRC-DOC001, SRC-DOC003 |
| REQ-F012 | Reference site | A braced `with` value is a reference and a bare value is a literal | SRC-DOC001, SRC-DOC003 |
| REQ-F013 | Reference site | A `with` binding naming an undeclared input, and an input with no argument and no default, each fail the load | SRC-DOC001 |
| REQ-F014 | Reference site | An output a reference site does not bind is dropped from the materialised bindings, producing no write and contributing no variable | SRC-DOC001, SRC-DOC003 |
| REQ-F015 | Reference site | An output that may be left unbound declares so; leaving an unmarked one unbound fails the load | SRC-DOC001, SRC-DOC003 |
| REQ-F016 | Reference site | A routine name resolves as `[workflow::]name` — qualified in that workflow only, bare against the referring workflow and then the shared home `meta` — and a borrowed activity resolves against its source workflow | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-F017 | Reference site | A routine step is legal inside a routine; a reference cycle fails the load, and depth is bounded by cycle detection rather than by a limit | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-F018 | Materialisation | The loader materialises a referenced routine's steps into the referring activity at load, so everything downstream sees ordinary steps | SRC-DOC001, SRC-DOC003 |
| REQ-F019 | Materialisation | Materialisation runs after identifier resolution and before contract derivation | SRC-DOC001, SRC-DOC003 |
| REQ-F020 | Materialisation | Materialisation substitutes over every body field that can name a variable: site gates, condition blocks, a loop's `continueWhile`, `breakCondition`, collection and item variable, a checkpoint's id template and message, an option's effect names and values, a technique binding's input and output maps, an action's target, message and value, a body step's technique name, and a nested reference's own `with` and `outputs` maps | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-F021 | Materialisation | The substitution is simultaneous, so a binding mapping `a → b` and `b → c` renames each occurrence exactly once | SRC-DOC001, SRC-DOC003 |
| REQ-F022 | Materialisation | Substitution rewrites whole binding values rather than the tokens inside them, and is kind-aware: a reference keeps its braces, a literal contributes its characters, and an absent value omits the binding | SRC-DOC001, SRC-DOC003 |
| REQ-F023 | Materialisation | Every identifier inside a materialised routine is prefixed with the reference step's identifier, full stop separated, and prefixes compose through nesting | SRC-DOC001, SRC-DOC003 |
| REQ-F024 | Materialisation | An internal's materialised name is underscore-joined from the host activity and the reference site | SRC-DOC001, SRC-DOC003 |
| REQ-F025 | Materialisation | A `kind: routine` step exists between parsing and materialisation and nowhere else, and an exhaustiveness assertion over the step kinds fails to compile when a kind is added | SRC-DOC001 |
| REQ-F026 | Materialisation | Load order is identifiers, then shared gate bodies, then routines, then the derivation; identifiers are populated per definition and uniqueness is re-checked in the merged scope | SRC-DOC001, SRC-DOC003 |
| REQ-F027 | Contract | The contract derivation treats a routine reference as a boundary: the declared signature counts and the body is never consulted | SRC-DOC001, SRC-DOC003 |
| REQ-F028 | Contract | A routine's inputs, less those a `with` binding satisfies with a literal, count as the referring activity's reads, and its outputs count as its writes | SRC-DOC001 |
| REQ-F029 | Contract | A routine's declared signature is held against its own body, an output nothing writes and an input nothing reads each failing the load | SRC-DOC001, SRC-DOC002 |
| REQ-F030 | Contract | A routine's contract is derivable in isolation, seeded from its declared inputs | SRC-DOC001 |
| REQ-F031 | Contract | The loader injects a routine's output declarations into the referring activity's `variables.writes`, and only where that activity declares nothing under the bound name | SRC-DOC001, SRC-DOC003 |
| REQ-F032 | Contract | The declaration merge treats an absent default as no opinion, and a declaration carrying one wins | SRC-DOC001, SRC-DOC003 |
| REQ-F033 | Contract | The declared-versus-derived write comparison runs over copied declarations, a disagreement meaning the expansion produced something the signature did not promise | SRC-DOC001, SRC-DOC003 |
| REQ-F034 | Placement | A routine's home is the workflow owning the files referring to it, or the shared home where two or more own them, and placement is computed and guard-enforced rather than author-chosen | SRC-DOC001, SRC-DOC003 |
| REQ-F035 | Placement | A referrer is an activity file or another routine, closed transitively | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-F036 | Placement | A routine with no reference site anywhere fails the load | SRC-DOC001 |
| REQ-F037 | Artifacts | A routine owns no artifact prefix, and artifacts written inside one land under the referring activity's prefix | SRC-DOC001, SRC-DOC003 |
| REQ-F038 | Artifacts | A routine whose body declares an artifact may be referenced at most once per activity, a second reference failing the load, and whether a body declares one is resolved through the same transitive closure as placement | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-F039 | Prohibitions | A routine takes no place in the graph — not a transition destination, never a workflow's first or last node — and declares and returns no outcome | SRC-DOC001, SRC-DOC003 |
| REQ-F040 | Prohibitions | A routine runs inside the referring activity's existing dispatch and costs no hand-off | SRC-DOC001, SRC-DOC003 |
| REQ-F041 | Prohibitions | A routine does not replace a child workflow, which exists to get a separate session | SRC-DOC001 |
| REQ-F042 | Prohibitions | A routine varies its steps only by a declared input; a run needing to differ structurally between two sites is two runs | SRC-DOC001 |
| REQ-F043 | Delivery and tooling | Materialisation is performed on both the parsed object graph and the raw activity YAML text while the server delivers activity text | SRC-DOC001, SRC-DOC003 |
| REQ-F044 | Delivery and tooling | The textual splicer replaces a whole step block, nested steps included, at the right indentation, and emits an explicit prefixed `id:` on every step it splices | SRC-DOC001 |
| REQ-F045 | Delivery and tooling | A differential test runs both paths over every activity in the corpus on every run, comparing parsed objects field for field and comparing as text the fields a worker acts on directly — a checkpoint's `message` and `id`, an option's `label` and `effect`, a step's `when`, and a loop's `over` and `continueWhile` | SRC-DOC001, SRC-DOC003 |
| REQ-F046 | Delivery and tooling | Delivery is byte-identical for every activity that carries no routine | SRC-DOC001, SRC-DOC003 |
| REQ-F047 | Delivery and tooling | The textual implementation is deleted when the runner stops delivering activity text | SRC-DOC001, SRC-DOC003 |
| REQ-F048 | Delivery and tooling | Routines get their own discovery pass, their own generated JSON schema and their own place in `get_workflow`, and the schema generator gains a verifying variant so a forgotten regeneration fails continuous integration | SRC-DOC001, SRC-DOC003 |
| REQ-F049 | Delivery and tooling | A guard reports any run of two or more consecutive steps appearing in two or more activity files with any difference between the copies, matching on step kind and binding, ignoring identifiers and site gates, and recursing into loop bodies | SRC-DOC001 |
| REQ-F050 | Delivery and tooling | A window contained in a longer shared window over the same file set is not reported separately, and the guard runs from a baseline that can only fall | SRC-DOC001 |
| REQ-F051 | Delivery and tooling | The end-to-end walker gains a routine-level entry, walking a routine's steps against a variable set seeded from its declared inputs | SRC-DOC001, SRC-DOC003 |

**Sections 5 to 7 — Non-Functional, Performance, and Project and Process Requirements**

| ID | Section | Requirement | Source |
|---|---|---|---|
| REQ-NF001 | 5 | A guard reads the form it audits: one checking how a definition is written reads files as written and walks `routines/` as a second definition directory, and one checking how a run behaves takes the loader's materialised activities | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-NF002 | 5 | A routine file is its own name scope for `check-variable-model`: a declared output or internal satisfies `setvariable-undeclared` and a workflow variable does not, and its other four rules take the same scope — the two comparing a literal against a target apply where the target is an output and stay silent on an internal, `default-type-mismatch` checks a routine input's default, and `exists-on-defaulted` extends to an `exists` gate on a defaulted input | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-NF003 | 5 | `check-activity-technique-overlap` stays in the authored column and resolves a reference step to the routine's own step bindings, keeping the rule hard-zero | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-NF004 | 5 | `check-loop-shape` walks `routines/`, an unbounded `while` in a shared definition otherwise propagating to every reference site | SRC-DOC001, SRC-DOC002 |
| REQ-NF005 | 5 | Every terminal state of the reference lifecycle but `Checked` fails the load with a message naming the routine, the reference site and the reason; none is a warning | SRC-DOC001 |
| REQ-NF006 | 5 | A worker receives ordinary steps and cannot tell one came from a routine | SRC-DOC001 |
| REQ-NF007 | 5 | A session crossing the migration finds no recorded answer for a renamed gate and asks again; orphaned responses stay as dead data and no key-mapping table is kept | SRC-DOC001, SRC-DOC003 |
| REQ-NF008 | 5 | A variable a routine writes that nothing else declares is simply unseeded, the reachability check already failing a read no path reaches a write for | SRC-DOC003 |
| REQ-NF009 | 5 | The construct carries no compatibility obligation toward the typed definition language, and stays migratable by keeping its signature declared rather than inferred, materialisation free of run-time trace, and nothing about a routine positional | SRC-DOC001 |
| REQ-NF010 | 5 | The fragment mechanism retires entirely with the migration, taking seven guard rules with it, `duplicate-checkpoint` keeping its rule with its remedy naming a routine | SRC-DOC001, SRC-DOC003 |
| REQ-NF011 | 6 | Dispatch cost is unchanged: a routine adds no hand-off, against a measured 23,000 to 42,000 tokens per fresh worker context and re-dispatch at about 31% of a measured 4.1-million-token run | SRC-DOC001, SRC-DOC003 |
| REQ-NF012 | 6 | Materialisation changes the delivered payload by nothing of its own; the measured seven shared gate bodies take 28,154 characters of source to 34,717 delivered, 6,563 more at 23.3% | SRC-DOC001 |
| REQ-NF013 | 6 | Materialised routine steps are eager-bundling candidates counting against the per-activity delivery budget, a routine referenced twice contributing its techniques twice, and the budget is measured before any rule is made | SRC-DOC001, SRC-DOC003 |
| REQ-NF014 | 6 | Generated identifiers are unbounded and measured — a 105-character step id in a loop body and a 124-character worst-case response key against a current maximum of 58 and 76 | SRC-DOC001, SRC-DOC002, SRC-DOC003 |
| REQ-NF015 | 7 | Delivery proceeds in the seven stages 0 to 6, each useful alone and assuming nothing after it, under the stated dependencies | SRC-DOC001 |
| REQ-NF016 | 7 | Each of stages 1 to 6 carries acceptance criteria | SRC-DOC001, SRC-DOC002 |
| REQ-NF017 | 7 | A migration that changes behaviour at a live site is walked before merge, each changed site's observed outcome compared against what its recorded disposition said would happen; a green guard suite is not sufficient | SRC-DOC001, SRC-DOC002 |
| REQ-NF018 | 7 | Stage 2 gives each of the census's ten differences a recorded disposition, names the sites where behaviour changes, and changes no definition | SRC-DOC001, SRC-DOC002 |
| REQ-NF019 | 7 | Stages 5 and 6 each re-record the delivery baseline and review the change in bundled characters at each site against the measured prediction rather than accepting it by regeneration | SRC-DOC001, SRC-DOC002 |
| REQ-NF020 | 7 | Findings B7 and B6 are fixed under issues #638 and #637 before the migration stages | SRC-DOC002 |
| REQ-NF021 | 7 | The two convergence routines are named, and the identifier-length measurements are re-taken against the re-derived signature | SRC-DOC002 |
| REQ-NF022 | 7 | The four guard moves onto the loader are costed, the true loader-consumer set being `check-audience`, `check-stealth-isolation`, `check-activity-variables`, `check-session-contract`, `check-all-refs` and `check-artifact-guides` | SRC-DOC002 |
| REQ-NF023 | 7 | Stages 5 and 6 are sequenced against each other at `07-assumptions-review` and `08-implement`, where the two runs are one contiguous six-step run | SRC-DOC001, SRC-DOC002 |

### Updated Requirements

None. The target specification does not exist, so no requirement is being modified.

### Deprecated Requirements

None. No requirement exists to retire.

## Source Coverage Matrix

| Source | Source section | Normative? | Covered by |
|--------|----------------|-----------|------------|
| SRC-DOC001 | §1 — Executive summary | yes | REQ-F001, REQ-F007, REQ-F018, SUCCESS-001, SUCCESS-002, SUCCESS-007 |
| SRC-DOC001 | §2 — The participants | yes | REQ-F027, REQ-F048, REQ-F051, REQ-NF001, REQ-NF006 |
| SRC-DOC001 | §3 — Use cases, §4 — User stories | yes | SUCCESS-001 to SUCCESS-006, REQ-F023, REQ-F031, REQ-NF006 |
| SRC-DOC001 | §5.1 — The construct: the definition | yes | REQ-F001 to REQ-F009 |
| SRC-DOC001 | §5.2 — The construct: the reference site | yes | REQ-F010 to REQ-F016 |
| SRC-DOC001 | §5.3 — The construct: nesting | yes | REQ-F017, REQ-F023 |
| SRC-DOC001 | §6.1 — Architecture: where materialisation sits | yes | REQ-F019 |
| SRC-DOC001 | §6.2 — Architecture: materialisation is a substitution | yes | REQ-F020, REQ-F021, REQ-F022 |
| SRC-DOC001 | §6.3 — Architecture: higher-order parameters | no | out of scope — excluded from the first version, the corpus having no site for it |
| SRC-DOC001 | §6.4 — Architecture: how far the new step kind reaches | yes | REQ-F025 |
| SRC-DOC001 | §6.5 — Architecture: two representations | yes | REQ-F043, REQ-F044, REQ-F047, REQ-NF012 |
| SRC-DOC001 | §6.6 — Architecture: the contract boundary | yes | REQ-F027 to REQ-F029, SUCCESS-002, SUCCESS-003 |
| SRC-DOC001 | §6.7 — Architecture: identifier hygiene | yes | REQ-F023, REQ-F024 |
| SRC-DOC001 | §6.8 — Architecture: where a routine lives | yes | REQ-F034, REQ-F035 |
| SRC-DOC001 | §7.1 — What this buys: enforcement strength and guarantees | yes | SUCCESS-001 to SUCCESS-006, REQ-F013, REQ-F029, REQ-F030, REQ-F036 |
| SRC-DOC001 | §7.2 — What this buys: what it makes cheap | yes | REQ-F037, REQ-F040, REQ-NF010, REQ-NF011 |
| SRC-DOC001 | §8 — Key flows | yes | REQ-F013, REQ-F017, REQ-F023, REQ-F029, REQ-F036, REQ-F051, REQ-NF005 |
| SRC-DOC001 | §9 — What a routine is not allowed to do | yes | REQ-F007, REQ-F017, REQ-F037, REQ-F039 to REQ-F042 |
| SRC-DOC001 | §10 — Delivery stages and acceptance criteria | yes | REQ-F021, REQ-F025, REQ-F044 to REQ-F046, REQ-F048 to REQ-F050, REQ-NF015 to REQ-NF019, REQ-NF023 |
| SRC-DOC001 | §11 — Designed for the typed language | yes | REQ-NF009 |
| SRC-DOC001 | §12 — Future features | no | out of scope — named rather than proposed, and gated on finding B6 |
| SRC-DOC001 | §13.1 — Meeting the system: the guard suite | yes | REQ-NF001 to REQ-NF004 |
| SRC-DOC001 | §13.2 — Meeting the system: the variable declaration | yes | REQ-F004, REQ-F031 to REQ-F033, REQ-NF008 |
| SRC-DOC001 | §13.3 — Meeting the system: discovery and generation | yes | REQ-F001, REQ-F048 |
| SRC-DOC001 | §13.4 to §13.5 — sessions in flight, artifact names | yes | REQ-F037, REQ-F038, REQ-NF007 |
| SRC-DOC001 | §13.6 to §13.7 — delivery budget, load order | yes | REQ-F026, REQ-NF013 |
| SRC-DOC001 | §13.8 to §13.10 — raw text, versioning, the walker | yes | REQ-F009, REQ-F043 to REQ-F047, REQ-F051 |
| SRC-DOC001 | §14 — Decisions, §15 — Companion records, §16 — Provenance | no | out of scope — an index into SRC-DOC003, plus bibliography and issue history |
| SRC-DOC002 | §1 — Gap 1: findings fixed, reversed, open | no | out of scope — evidence-base correction, carrying B3 forward |
| SRC-DOC002 | §2 — Gap 2: B6 assigned to a closed issue | yes | REQ-NF020 |
| SRC-DOC002 | §3 — Gap 3: conversion artifacts descend from a deleted technique | yes | REQ-NF021 |
| SRC-DOC002 | §4 — Gap 4: `breakCondition` survives | yes | REQ-F020 |
| SRC-DOC002 | §5 — Gap 5: the per-item gate has three options | no | out of scope — a work-package content decision, not a routine obligation |
| SRC-DOC002 | §6 — Gap 6: two census rows change behaviour | yes | REQ-NF018, REQ-NF020 |
| SRC-DOC002 | §7 — Gap 7: the guard classification is measured against a smaller suite | yes | REQ-NF001, REQ-NF003, REQ-NF004 |
| SRC-DOC002 | §8 — Gap 8: a hard-zero guard rejects a routine's authored gate | yes | REQ-NF002 |
| SRC-DOC002 | §9 — Gap 9: the loader-consumer set is wrong in both directions | yes | REQ-NF022 |
| SRC-DOC002 | §10 — Gap 10: `internals` has no declaration shape | yes | REQ-F005, REQ-F007, REQ-F008 |
| SRC-DOC002 | §11 — Gap 11: placement and routine-only referrers | yes | REQ-F035, REQ-F038 |
| SRC-DOC002 | §12 — Gap 12: five stages carry no acceptance criteria | yes | REQ-NF016, REQ-NF017, REQ-NF019 |
| SRC-DOC002 | §13 — Two things worth recording that are not gaps | yes | REQ-NF014 |
| SRC-DOC002 | §14 — What this pass corrected, and what is left | yes | REQ-NF017, REQ-NF020, REQ-NF021 |
| SRC-DOC002 | §15 — The second pass | yes | REQ-F017, REQ-F049, REQ-NF003 |
| SRC-DOC002 | §16 — The four questions put to the owner | yes | REQ-F016, REQ-F017, REQ-NF003 |
| SRC-DOC002 | §17 — What is left | yes | REQ-NF020 to REQ-NF023 |
| SRC-DOC003 | §1 — Settled: construct identity, naming and boundaries | yes | REQ-F001, REQ-F039 to REQ-F041 |
| SRC-DOC003 | §2 — Settled: contract, materialisation and substitution | yes | REQ-F018 to REQ-F022, REQ-F027, REQ-F028 |
| SRC-DOC003 | §3 — Settled: outputs, internals and nesting | yes | REQ-F004, REQ-F005, REQ-F008, REQ-F014, REQ-F015, REQ-F017, REQ-F024 |
| SRC-DOC003 | §4 — Settled: free variables, arguments and loop fields | yes | REQ-F007, REQ-F011, REQ-F012, REQ-F020 |
| SRC-DOC003 | §5 — Settled: identifiers, placement, artifacts and outcome | yes | REQ-F023, REQ-F034, REQ-F035, REQ-F037 to REQ-F039 |
| SRC-DOC003 | §6 — Settled: the fragment mechanism and two representations | yes | REQ-F043, REQ-F047, REQ-NF010 |
| SRC-DOC003 | §7 — Settled at the system boundary: guards | yes | REQ-NF001 to REQ-NF004 |
| SRC-DOC003 | §8 — Settled at the system boundary: declarations and the merge | yes | REQ-F004, REQ-F031 to REQ-F033, REQ-NF008 |
| SRC-DOC003 | §9 — Settled at the system boundary: discovery, sessions, budget, load order, versioning, walker | yes | REQ-F009, REQ-F026, REQ-F038, REQ-F048, REQ-F051, REQ-NF007, REQ-NF013 |
| SRC-DOC003 | §10 — Settled about the run itself: log pass, gate options, once per run, announcement | no | out of scope — work-package behaviour decisions belonging to that workflow's owner |
| SRC-DOC003 | §11 — Settled about the run itself: name resolution and the shared home | yes | REQ-F016 |
| SRC-DOC003 | §12 — Still open: the identifier-length item | yes | REQ-NF014, REQ-NF021 |
| SRC-DOC003 | §13 — Still open: the scoped-names item | no | out of scope — recorded as open, the construct not being blocked on it |

## Document Updates Required

- **Section 2.5 Reference Documents** — add one reference per source, each `SRC-DOC###` credited to its author: `**SRC-DOC001**: [Routines — proposal](../2026-09-03-routines/README.md) — Mike Clay`, `**SRC-DOC002**: [What this folder owes before planning starts](../2026-09-03-routines/gap-review.md) — Mike Clay`, `**SRC-DOC003**: [Routines — decision record](../2026-09-03-routines/decisions.md) — Mike Clay`.
- **Section 2.2 Meeting Transcripts** — no additions; the source set carries no meeting.
- **Sections 1, 2.1 to 2.4, 3 to 7** — created in full, the specification not existing yet, with section 4 carrying the seven domain subsections above and sections 2.1 and 2.3 present but empty.

## Quality Issues Identified

- **The identifier scheme offers no code for performance or project requirements.** Sections 6 and 7 hold requirements and the scheme names only `REQ-F###` and `REQ-NF###`. This analysis assigns `REQ-NF###` across sections 5, 6 and 7, numbering continuously. Confirm that reading, or add codes for the two sections.
- **Higher-order technique parameters are settled twice, in opposite scopes.** SRC-DOC001 §6.3 and SRC-DOC003 record the feature as designed; SRC-DOC002 §3 and SRC-DOC003's 2026-09-07 scope correction put it out of the first version, the re-derived signature having no site for it. Carried as out of scope, its reasoning surviving for whenever a site arrives.
- **The `breakCondition` disposition reverses between documents.** SRC-DOC001's stage-0 row and SRC-DOC003's original entry record it deleted; SRC-DOC002 §4 and SRC-DOC003's landed marker record it kept with a rule. The kept reading is current, and REQ-F020 carries the consequence.
- **SRC-DOC003 records the per-item gate at two options and then at three.** The entry is marked overtaken, the corpus having settled three. A work-package content decision rather than a routine obligation, so out of scope either way.
- **Two named routines and one artifact set are unsettled.** `challenge-concerns` and `converge-assumptions` are proposed rather than settled, and the `conversion/` artifacts descend from a deleted technique. REQ-NF021 carries both; no requirement here depends on either name.
- **Two obligations state a measurement rather than a threshold, deliberately.** REQ-NF013 and REQ-NF014 follow the sources' "measured before it is ruled on" for the delivery budget and the identifier bound. The scoped-names item stays out of scope, the sources stating the construct is not blocked on it.

## Implementation Notes

- The specification is created from scratch, instantiating all seven protocol sections. Every requirement takes status `pending`, and no status advances without explicit confirmation at requirements review.
- The three sources agree except at the four points above. Where SRC-DOC002 or a dated marker in SRC-DOC003 supersedes SRC-DOC001, the later reading is carried and SRC-DOC001 stays cited alongside it, the obligation originating there.
- Section 4 is grouped by the sources' own architecture — definition, reference site, materialisation, contract, placement, artifacts, prohibitions, delivery and tooling — rather than as one flat list.
- Numbering is contiguous within each category as assigned here; a gap opened by later revision is not a defect.
