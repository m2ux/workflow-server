---
name: workflow-canon
description: "Apply the workflow-server design canon — design principles, the anti-pattern catalog, the schema construct inventory, convention conformance, and the repo guard suite — when authoring or auditing a workflow definition (workflow.yaml, activities/, techniques/, resources/, READMEs). Use for: \"review this workflow\", \"audit workflow X\", \"does this technique comply\", \"check for anti-patterns\", \"is this the right schema construct\", before drafting or editing any definition file, and before committing definition changes. Examples: \"audit workflow-design\", \"review my new activity YAML\", \"why is this rule an anti-pattern?\""
---

# Workflow Canon

The canon is a set of criteria homes plus a guard suite, all on disk in this repo and enumerated below.

**Read the canon forward.** The inventory maps an informal pattern to the construct that carries it, the principles state a stance to author toward, conformance names a sibling to match, and a catalog entry's **Do not flag** and **Fix** describe the shape compliant content takes. Load what binds before writing and the content lands compliant. **Detect** is the fallback for content that already exists — reaching for it first turns every change into a fix-and-recheck loop that ends when someone gets tired.

**This skill holds no criteria of its own.** It locates the homes, enumerates their units, walks them, and reports. Copying Detect or stance text into this file would create a second home that drifts from the first — the defect the catalog itself names as `canon-layer-cites-not-restates` and `no-duplicated-guidance`. Cite entries by their kebab-case **name**; never by a bare `AP-XX` number and never by any count of the catalog's entries.

## Homes

**Locate the checkout first.** Every path below is relative to the workflow-server repo root. When the cwd is inside the checkout, `git rev-parse --show-toplevel` gives it. When the session is rooted in a cursor workspace instead — a directory holding `.mcp.json` and a `*.code-workspace` but no `workflows/` — the checkout is the `project` folder that `*.code-workspace` names, and it is an additional working directory of the session.

Confirm the resolved root holds `workflows/workflow-design/resources/` before reading anything. `workflows/` is a git submodule, so a shallow checkout may not have it; if the canon files are absent, say so rather than auditing from memory.

**Definitions and code sit on different branches.** A schema-reading guard failing on the corpus branch may be reading a field the code branch has not merged; that clears on the code merge and is not a corpus defect. Establish which before recording one.

| Home | Path | Owns |
|------|------|------|
| Design Principles | `workflows/workflow-design/resources/design-principles.md` | *Prefer / before / only after* stance |
| Anti-Patterns | `workflows/workflow-design/resources/anti-patterns.md` | Specific smells as **Detect / Do not flag / Fix**. Exceeds the eager-delivery cap — fetch by anchor |
| Schema Construct Inventory | `workflows/workflow-design/resources/schema-construct-inventory.md` | Informal-prose → formal-construct mappings |
| Convention Conformance | `workflows/workflow-design/resources/convention-conformance.md` | Comparison against sibling workflows |
| Guard suite | `scripts/guards.ts` (registry) | Mechanical checks. The registry is the enumeration — never maintain a parallel list |

Anchors on the principles home embed the section ordinal (`#13-separate-contract-from-procedure`), so an anchor breaks when the canon gains a principle ahead of it while the heading survives. Cite by **title**; where an anchor fails to resolve, re-read the heading rather than guessing.

Read [references/canon-map.md](references/canon-map.md) before the first fetch: it names where each home's unit enumeration is read from, the fetch-by-section mechanics, what must *not* be taken from each home, and the authorities beyond these four — guard exemption surfaces, triage ledgers, reasoned exemption lists — that record whether an instance has already been judged.

## Pick the path

| Situation | Path |
|-----------|------|
| Authoring a definition file from scratch | **Draft** below |
| Carrying out a change that is already specified — a work item, a finding to fix, a defect with a location | **Implement** below |
| Reviewing or auditing existing definitions | **Audit** below |
| One narrow question ("is X an anti-pattern?", "which construct for Y?") | Fetch that single entry or inventory row, answer, stop. No walk, no report. |

## Draft

For content that does not exist yet.

1. **Fix the construct before the prose.** Fetch the construct-inventory section for the kind you are authoring (activity / workflow / technique / condition) and pick the most specific formal construct it offers. Prose that an inventory row maps to a construct is a defect the moment it is written, not at audit time.
2. **Load what binds this file kind.** Every unit binds until its own text excludes the kind you are authoring, so read the homes and let each unit's wording settle its own reach — see [references/canon-map.md](references/canon-map.md#which-units-bind-a-file-kind). Read the sections, not a summary of them.
3. **Read a live sibling.** Convention conformance is defined relative to existing workflows; the reference files are the baseline, and this skill does not substitute for opening them.
4. **Write.**
5. **Self-check before saving.** Re-walk only the units step 2 routed you to, against the file you just wrote, then run § Mechanical checks. Schema validity, reference resolution and binding fidelity are cheaper to settle mechanically than by reading.

A draft self-check is not an audit and produces no findings register. If the change is going to commit, run the Audit path.

## Implement

Applied when the change is already specified. The surface comes from the specification, not from a diff.

1. **Resolve the specification to files.** Resolve every construct it names to a concrete path, then take the I/O-contract closure and consumer surface over that set per § Audit → Scope the surface. A specification naming one technique still reaches its referencers.
   - **A specification describes the corpus at the moment it was written; you are changing the corpus now.** Confirm what it asserts still holds before building to it — the construct is where it says, the count is what it says, the thing it calls absent is absent. What it got right is the surface; what has moved since is the first thing to report, and where nothing is left to change the finding is that, not a change made anyway.
2. **Fix the construct before the prose**, as Draft step 1. A specification says what to change, not which construct to change it into.
3. **Load what binds**, as Draft step 2 — plus, where the change answers a finding, that entry's **Fix** and **Do not flag**. Together they are the shape the replacement takes, read as its specification rather than as a test applied afterwards.
4. **Name what the change preserves**, per the non-negotiable below.
5. **Write into that shape**, then run § Mechanical checks.
6. **Audit** with the base ref set to the branch point. Finding nothing is the expected result of steps 3 and 5; finding something means the shape was read wrong, not that the audit earned its keep.

## Audit

### 1. Scope the surface

Name, before reading criteria. Build the **change surface** first; the walk is against that set (and the wider target surface for pre-existing attribution), never against a hunk list.

- **Base ref** — the ref the change is measured against.
- **Surface files** — every definition file of the target: `workflow.yaml`, `activities/`, `techniques/`, `resources/`, and the READMEs.
- **Touched files** — every path under the target (and any other definition path in the diff) that differs from the base ref. A path is in or out as a **whole file**. Diff hunks only discover membership; they never bound what Detect may inspect inside that file.
- **I/O-contract closure** — when any touched technique or activity changes its **I/O contract**, every other activity or technique that references that file is also in the change surface, whether or not its bytes differ from the base ref.
  - **I/O contract** means: technique `## Inputs` / `## Outputs` (including nested component / artifact declarations); activity-declared inputs/outputs and step binds that name technique input or output ids; renames, additions, removals, optionality flips, and type/shape changes of those ids.
  - **Reference** means any of: activity `techniques[]` or step `technique` / `technique.name` binds; technique Protocol `Apply` / `::` / markdown links to a sibling or cross-workflow op; resource or README cites that resolve to the op file. Resolve each reference to a concrete definition file path.
  - Sweep the whole workflows tree (same target and other workflows). A referencer outside the original target still joins the change surface.
- **Change surface** — the union of **touched files** and **I/O-contract closure**, each entry the full file. Report the two subsets separately in the audit header so a reader can see what git touched versus what contract reach pulled in.
- **Consumer surface** — the references other workflows hold *into* the target, each resolved to the file it names. Always computed; when a resolved target file is on the change surface (touched or pulled in by I/O-contract closure), that consumer file is on the change surface too. `grep -rn "<target-id>/" workflows/ --include=*.md --include=*.yaml` finds the cross-workflow refs; expand with bind and Apply resolution, not path string match alone.
- **Reference workflows** — the siblings of similar type whose conventions the target is compared against.

**Forbidden scopes.** Do not treat "the lines the diff shows" as the audit surface. Do not mark a unit `walked` on a touched file after reading only the hunk. Do not omit a silent referencer because the bind site was not edited.

### 2. Run the mechanical checks first

Per § Mechanical checks. Here prefer `npx tsx scripts/check-delta.ts --base <ref>` over `check:all`: the delta runner materialises the merge-base in a throwaway worktree and diffs the two runs, which does step 5's attribution mechanically and exactly.

Findings are evidence, not judgment — they settle the schema-invalid, unresolved-reference and binding-drift classes before any reading starts, and a failure is `Critical` on sight. Exit 2 means a check could not measure: `blocked` coverage, never a pass.

### 3. Enumerate the criteria units

Read each home's units from its own headings, per [references/canon-map.md](references/canon-map.md#unit-inventory) — that file names where the enumeration is read from and the judgement each home needs on top of it. **Enumerate against the home at the commit audited.** A list held anywhere else agrees with the canon only until the canon next moves, and a walk measured against the stale copy reports a clean sweep having never reached the units the copy omits.

Two properties of the catalog do not follow from a heading scan, and canon-map states both: its last family absorbs newly appended entries, so read it to its end; and its first family binds only when the change edits the catalog.

Do not restate, summarise, or renumber the entries a unit contains. Follow each as written.

### 4. Walk every unit against the surface

- Apply each entry's **Detect** to the **entire contents** of every file on the **change surface** (touched ∪ I/O-contract closure ∪ consumers of those files). Honour **Do not flag** carve-outs; record **Fix** verbatim in intent when it fires.
- Also apply Detect to the rest of **surface files** so pre-existing defects remain attributable; those findings are not excused by sitting outside the hunk list.
- **Detect comes from the anti-pattern and inventory homes only.** From the principles home take only whether the authored content honours the stance — so one violation is not counted twice under two homes.
- Compare against the reference workflows wherever a unit states its criteria relative to sibling convention.
- Record every unit's disposition into the coverage ledger as you go — `walked`, `not-applicable` with the reason it does not reach this surface, or `blocked` with what prevented the walk. Only `blocked` is missing coverage; `not-applicable` is an evidenced negative.
- Status `walked` on a unit that intersects the change surface requires field-level evidence on **each whole file** in that intersection the unit can reach — not on the diff hunks alone. A narrative "walked the change" without whole-file evidence is `blocked`.

### 5. Attribute and exclude

Attribute each finding against the base ref:

- **Origin `diff`** — the violation is in a **touched** file (path bytes differ from base), **or** it is a break that only exists because an I/O contract on the change surface changed (including a stale bind or Apply in an untouched referencer or consumer). Contract-closure membership alone is enough for `diff` when the defect is contract-drift at the reference site.
- **Origin `pre-existing`** — the same construct and evidence were already present at the base ref on that path, and the finding does not depend on an I/O contract change in this change surface.

Mark findings whose key a prior pass already accepted as **known** and keep them out of the decision surface — recorded, not deleted, so a later pass can ask whether the acceptance still holds.

### 6. Verify High findings adversarially

**Refute by default.** For each High, re-derive it from the cited file and construct alone, without re-reading the pass that produced it. A High survives only if the re-derivation independently reproduces it; withdraw the ones it does not, and downgrade any whose evidence supports only a lesser issue. Spot-confirm surviving Mediums — the cited construct exists and the finding class is right — without full re-derivation.

Only confirmed findings are eligible to drive fixes.

### 7. Report

Per [references/reporting.md](references/reporting.md): the finding row shape, the coverage ledger, the severity scale, and which report shape applies. The standalone header **must** state change-surface counts: touched (whole files), I/O-contract closure, and consumers pulled in — never "N hunks" or "diff lines only". Inside a workflow-authoring or workflow-design run, that run's creation guides own the layout and this skill defers to them.

## Mechanical checks

Shared by all three paths. **`AGENTS.md` owns how they run** — the guard commands, the worktree provisioning that makes them measure the checkout you edited, and the triage contract a binding-fidelity finding is classified under. What follows is only what an audit needs on top.

| Check | Command | Covers |
|---|---|---|
| Guard suite | `npm run check:all`, or `--only <id>,<id>` for a subset | The whole registry, or a named subset |
| Option coverage | `npm run test:coverage-walk` | Whether a walk still reaches every option and exit |

**Before running**

- **Take the verdict at the branch point.** A corpus moves under you, and a check failing on definitions you did not write reads as your defect.
- **Hold the checkout still for the run.** A walk reads the corpus for its whole duration, so switching the checkout it reads mid-run invalidates the result and disguises the cause. Work a corpus branch in its own worktree and leave the shared checkout on the integration branch.
- **The walk is opt-in — `npm run test:ci` skips it.** Run it whenever the change touches a step list, exit, gate or graph. A definition that reduces coverage passes every other check and fails later on the code branch's main line. It runs in tens of minutes, so baseline it once per branch and start it before editing rather than waiting on it after.

**Reading a result**

- **A pipe reports the filter's exit code, not the check's.** `check | tail` exits as `tail` did, so a failing run reads as a pass. Write the check's output to a file and read the file, or read the exit code before anything filters it.
- **The walk ratchets over a reasoned exemption list.** `tests/e2e/option-coverage.json` groups options under stated reasons. An unreachable option is either made reachable or placed in the group whose reason covers it — matching the reason is the work. Where no reason fits, it is a finding, not an entry.
- **A triaged binding-fidelity finding is not `Critical` on sight**, since that guard exits `OK` carrying accepted debt. Its verdicts also carry the corpus commit they were made against; on a large drift a clean result says the verdicts are old, and the walk records `blocked`. Re-affirming them is bounded by the drift rather than by the ledger: the entries at risk are the ones whose cited file changed since the stamp, which is a diff away and is usually a small fraction of the whole.
- **A ledger states its judgement in fields no check reads.** A suppression entry is matched on a normalised key, so the reason it cites and the line it points at sit outside what the guard compares, and either can be wrong while the guard reports clean. Two entries sharing a key are not evidence of one: the key drops the line number, so a designator read twice on one line yields two findings and earns two entries. Count the findings at the site before calling an entry redundant.
- **A clean run is not a clean change.** These read structure, not whether the workflow still does what it did. The preservation the canon requires, and the option-coverage walk, carry that.

**Adding a check**

- **A guard that lands green proves nothing.** The corpus fix that motivated it merges first, so the tree it runs against has no defect left and a passing run is indistinguishable from a pattern that matches nothing. Run it against the corpus at the commit before that fix — what it names there is what it detects, and what it stays silent on there bounds its reach.
- **Prefer a carve-out the guard settles to one a ledger records.** A ledger buys judgement about specific content, and costs a file, a staleness check, and a re-affirmation every time the corpus moves. An exemption that follows from the entry's own terms is structure: it belongs in the condition, where it needs no upkeep and cannot go stale.
- **A check that reads a construct's kind from its location has made that location single-kind.** Where every file under a path is taken to be one kind, the next file that belongs there and is not that kind fails as a malformed instance of it, and the only way past is a declaration chosen to clear the check rather than to describe the file — which leaves the content lying to whoever reads it next. Take the kind from what the file declares, and name in the check the kinds it admits, so a new kind is an edit to the check rather than a tag that buys silence.

**After merge**

- **A definition change owes the code branch an adoption commit.** The pointer, the walk baseline, the stamp and every triage entry the change settled move together — `AGENTS.md` owns the sequence and why it admits no ordering. A change that closes a binding finding is the case to watch for, since the entry suppressing it goes stale on the same commit that adopts it.

## Non-negotiables

**Surface**

- **Whole file on the change surface.** Every touched path is audited as a complete definition file. Diff hunks discover which paths joined the surface; they do not limit Detect.
- **I/O contract pulls referencers.** A modified Inputs/Outputs (or activity bind contract) expands the change surface to every activity and technique that references that file, in-tree and cross-workflow.
- **A second entry pulls the exits.** An activity's outcomes are correct relative to where the graph enters it. Where a graph gives one activity two entry points, the surface includes both, and each outcome is read against the state each entry arrives in — an outcome sound for the first entry can route the second into work already done. Compute the entries the same way as the closure: from every graph that includes the activity, not from the file itself.

**Evidence**

- **Structural evidence or it is not a finding.** A finding names the field, shape, or phrase its entry's Detect keys on. Inferred intent is never that evidence. Where an entry keys on the harness tool surface or an authoritative bootstrap resource, the evidence is that surface read directly — not the authored claim about it.
- **Cite by name.** Kebab-case entry name and principle title. No bare `AP-XX`, no entry counts — both drift.
- **Read an identifier at full length from its authority.** A shortened commit hash, an elided path and a truncated symbol are display conveniences; the value is what the authority holds, so take it from there — `git rev-parse`, the registry, the resolved path — and never complete an abbreviation by inference. A plausible identifier reads as correct through review and fails later in whatever is keyed on it, where a wrong sentence is caught on sight.
- **One violation, one home.** Do not report the same bad sentence under a principle and its covering anti-pattern.
- **A search locates; it does not conclude.** A hit names a candidate site, and the finding comes from reading the construct enclosing it — a declared output says nothing about who reads it, and a value set under a gate says nothing about what the loop around that gate guarantees. A search that returns nothing is weaker still: the constraint may be met by a construct the pattern never named. Cite the construct read, never the pattern run.
- **A probe's own names come from the authority before its result is read.** An empty result bounds absence only where every field, label, id and anchor the probe named is one the schema, registry or inventory actually defines — a name the authority does not carry returns the same empty set as a real absence. Read the names back from that authority, then record the negative. A negative recorded from an unchecked probe becomes a premise, and a premise costs more to withdraw than a finding.
- **An empty hand-check proves nothing until it has found something.** Most entries have no guard behind them, so Detect is applied by hand or by an ad-hoc scan. Before trusting an empty result, confirm the check reports a case already in the corpus; a fixture composed for the occasion shows only that the check fires on the shape its author pictured. Where Detect names a set — audiences, markers, suffixes, operators, tool names — take the check's terms from that wording rather than from memory, because a set short by one member returns the same empty result as a clean walk. An untested scan that finds nothing is `blocked`, not a clean walk — and a scan worth keeping belongs in the guard registry, not in a report.

**Changing content**

- **A restructuring owes a preservation statement, and a collapse owes a reach statement.** Both are the canon's — Non-Destructive Updates states what a change still has to hold, and the construct inventory states the reach each rule construct carries. The audit's job is to require them as evidence and refuse a finding that asserts either without naming it.
- **Fix, do not merely file.** When the request is to bring content into compliance, apply the Fix each entry prescribes rather than handing back the register. Enumerate findings before proposing to accept any of them.
- **A fix is subject to the criteria it was made under.** Replacement text is walked by the entry that prescribed it and by every unit its file kind routes to; prose moved between constructs lands on whatever criteria own the destination. An application that leaves new findings behind has moved the defect, not closed it.
- **Edit the field, not the file.** A ledger, fixture or snapshot read whole, changed in memory and written back returns in the writer's conventions — escaped non-ASCII, reordered keys, its own indentation — so removing three entries arrives as a whole-file rewrite. The surplus lines are semantically identical, which is what carries them through review unread, and every later diff of that file is measured against the rewrite. Change the lines the change needs and read the diff's size as the check.
- **Never edit the schema to make content validate.** That is `schema-is-constraint`; content conforms to the schema.

## References

- [references/canon-map.md](references/canon-map.md) — where each home's units are read from, fetch mechanics, unit reach, per-home boundaries, and the authorities beyond the prose homes that record what is already judged.
- [references/reporting.md](references/reporting.md) — severity scale, finding and coverage row shapes, report templates.
