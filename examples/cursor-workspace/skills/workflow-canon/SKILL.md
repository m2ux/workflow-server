---
name: workflow-canon
description: "Apply the workflow-server design canon — design principles, the anti-pattern catalog, convention conformance, and the repo guard suite — when authoring or auditing a workflow definition (workflow.yaml, activities/, techniques/, resources/, READMEs). Use for: \"review this workflow\", \"audit workflow X\", \"does this technique comply\", \"check for anti-patterns\", \"is this the right schema construct\", before drafting or editing any definition file, and before committing definition changes. Examples: \"audit workflow-design\", \"review my new activity YAML\", \"why is this rule an anti-pattern?\""
---

# Workflow Canon

Locates the canon homes, enumerates their units, walks them, and reports. Follow each home as its own overview and entries are written. Do not restate them here.

## Homes

**Checkout.** Inside the checkout, `git rev-parse --show-toplevel`. From a cursor workspace (`.mcp.json`, `*.code-workspace`, no `package.json`), the checkout is the `project` folder that workspace names.

**Two roots.** Guards live in the server checkout under `guards/`. The canon, ledgers, and walk artifacts live in the **corpus tree**: a `workflows` worktree at `.worktrees/workflows` unless `WORKFLOWS_DIR` or `--root` names another. Confirm `corpus/canon/resources/` is present — a fresh clone gains it from `npm run worktree:provision`. If it is absent, say so.

**Branches.** A schema-reading guard failing on the corpus branch may be reading a field the code branch has not merged. That clears on the code merge. Establish which before recording a corpus defect.

| Home | Path | Root |
|------|------|------|
| Design Principles | `corpus/canon/resources/design-principles.md` | corpus |
| Anti-Patterns | `corpus/canon/resources/anti-patterns.md` | corpus |
| Convention Conformance | `corpus/canon/resources/convention-conformance.md` | corpus |
| Guard suite | `guards/guards.ts` | server |
| Schema fields | `schemas/README.md` | server |

Cite a principle by the title its file uses. An anchor that embeds the section ordinal breaks when a principle is inserted ahead of it.

Read [references/canon-map.md](references/canon-map.md) before the first fetch. Fetch the section and follow it. Notes taken from a section are not the section.

## Pick the path

| Situation | Path |
|-----------|------|
| Authoring a definition from scratch | **Draft** |
| A specified change — work item, finding, or a defect with a location | **Implement** |
| Reviewing existing definitions | **Audit** |
| One question | Fetch that entry, answer, stop |

Closing a confirmed finding is Implement. Audit reports. Implement writes the Fix the entry states.

## Draft

1. **Read what binds**, per [canon-map](references/canon-map.md#which-units-bind-a-file-kind), and follow it. Schema fields are `schemas/README.md`.
2. **Open a live sibling.** Conformance compares against those files.
3. **Write.**
4. **Self-check, then save.** Re-walk the units from step 1, then § Mechanical checks. A self-check writes no findings register. A change that will commit takes Audit.

## Implement

The surface is the specification, not the diff.

1. **Resolve to files**, then I/O-contract closure and consumers per § Audit → Scope. Confirm the specification still holds against the tree: the construct is where it says, the count is what it says, the absence is an absence. What has moved is reported first. Where nothing remains to change, that is the finding.
2. **Read what binds**, as Draft. When the change answers a finding, follow that entry's Fix and Do not flag.
3. **Name what the entries require the change to preserve.**
4. **Walk the draft, then write.** The prescribing entry, then every unit the destination file kind routes to. On a `## Rules` or I/O heading, apply each binding entry to each constraint before testing the heading whole. Rewrite while an entry still fires. Then § Mechanical checks.
5. **Audit** from the branch point, each touched file whole. A finding here means the draft walk was skipped or the entry was misread.

## Audit

Enumerate, attribute, verify Highs, report. Bringing content into compliance hands each confirmed finding to Implement.

### 1. Scope the surface

Write each list before the first unit. The walk consumes the lists. A count is a summary of one. An existence claim holds over the list it was resolved against.

- **Base ref** — the ref the change is measured against.
- **Surface files** — `workflow.yaml`, `activities/`, `techniques/`, `resources/`, READMEs of the target.
- **Touched** — definition paths whose bytes differ from the base ref, each the whole file. Hunks discover membership.
- **I/O contract** — technique `## Inputs` / `## Outputs`, including nested component and artifact declarations; activity inputs, outputs, and step binds that name those ids; renames, additions, removals, optionality flips, and type or shape changes.
- **Reference** — `techniques[]`, step `technique` / `technique.name`, Protocol `Apply` / `::` / a markdown link to an op, or a resource or README cite that resolves to the op file. Sweep the workflows tree. Resolve each to a file path.
- **Closure** — every activity or technique that references a touched file whose I/O contract changed, in this workflow and others.
- **Change surface** — touched ∪ closure. The header reports the two subsets separately.
- **Consumers** — references other workflows hold into the target. Always computed. A consumer joins the change surface when the file it names is on it. Start from `grep -rn "<target-id>/" corpus/ --include=*.md --include=*.yaml`, then resolve binds and Apply links.
- **Reference workflows** — siblings of similar type, as convention conformance requires.
- **Prior residual** — `unread` paths in the latest findings register under `.engineering/artifacts/planning/`. Re-derive the enumeration at this commit and inherit dispositions by path. A path absent from the tree leaves the worklist. Reading starts at the residual, and the pass hands on a smaller one or records why not.
- **Second entry** — where a graph gives one activity two entry points, both are on the surface. Read each outcome against the state that entry arrives in. Take entries from every graph that includes the activity.

Hunk lines are not the surface. A unit read from a hunk is not `walked`. A referencer stays on the surface when its bind site was not edited.

### 2. Mechanical checks first

§ Mechanical checks. Prefer `npm run check:delta -- --base <ref>`: it attributes this step by diffing a merge-base run against this tree. A failure is `Critical`. Exit 2 is `blocked`.

### 3. Enumerate units

From each home's headings at the commit audited, per [canon-map](references/canon-map.md#unit-inventory). Apply each entry as written.

### 4. Walk

- **Entry-major.** One unit across the surface, paths recorded, then the next. A file-major walk drops later instances of an entry that already fired.
- **Compound headings.** On `## Rules` or an I/O heading, apply each binding entry to each constraint on its own. The entry's Do not flag covers that constraint. A sound first sentence leaves the sibling clause still to test.
- **Reach.** The whole of every change-surface file, and the other surface files so a pre-existing defect stays attributable.
- **Homes.** Take from each home what its overview says to take.
- **Ledger.** `walked`, `not-applicable` (the unit's own wording), or `blocked` (what prevented the walk). Only `blocked` is missing coverage. `walked` where the unit meets the change surface needs field-level evidence on each whole file in that intersection. Evidence at the hit and an assertion over the rest is `blocked` for the remainder, with the path count.
- **Paths.** Each worklist path is `read` (whole file) or `unread`. A search names files; it does not dispose a directory. Reconcile per [reporting](references/reporting.md#file-coverage).

### 5. Attribute

- **`diff`** — a touched file, or a break that exists because an I/O contract on the change surface changed, including a stale bind or Apply in an untouched referencer or consumer.
- **`pre-existing`** — the same construct and evidence at the base ref, independent of an I/O contract change on this surface.
- **`known`** — a prior pass accepted this key. Keep the row. Leave it out of the decision surface.

### 6. Verify Highs

Re-derive each High from the cited file and the entry alone. Withdraw what that re-derivation does not reproduce. Downgrade what supports only a lesser issue. Spot-confirm Mediums: the construct exists and the class is right. Only confirmed findings drive fixes.

### 7. Report

[references/reporting.md](references/reporting.md). A standalone header states files `read` and `unread`, the `blocked` unit count, and the change-surface counts as whole files: touched, closure, consumers. Inside workflow-authoring or workflow-design, that run's guides own the layout.

### 8. File a mechanised Detect

A Detect applied by pattern is a guard candidate. Name what it keys on and file it against the registry. The threshold is the second occurrence: twice in one walk, or once in each of two consecutive walks.

## Mechanical checks

`AGENTS.md` owns the commands, the worktree the run measures, and binding-fidelity triage.

| Check | Command | Covers |
|---|---|---|
| Guard suite | `npm run check:all`, or `--only <id>,<id>` | The registry, or a named subset |
| Option coverage | `npm run test:coverage-walk` | Whether a walk still reaches every option and exit |

- Take the verdict at the branch point, and hold that checkout still for the run.
- `npm run test:ci` skips the coverage walk. Run it when the change touches a step list, exit, gate, or graph. Baseline it once per branch, before editing.
- Read the check's own exit code. A pipe reports the filter's. Write the output to a file, or read the code before filtering.
- `walks/option-coverage.json` groups unreachable options under a stated reason. Match the reason, or record a finding.
- Binding-fidelity exits `OK` while carrying triaged debt, stamped with the corpus commit. On drift, a clean result means the verdicts are old: record `blocked`, and re-affirm entries whose cited file changed since the stamp.
- A suppression matches a normalised key. Its reason and its line sit outside the comparison, and the key drops the line number, so one line can earn two entries. Count the findings at the site before calling an entry redundant.
- A clean structural run leaves what the canon requires of a change, and option coverage, still to show.
- Prove a new guard against the corpus at the commit before the fix it was written for. A carve-out that follows from the entry belongs in the guard's condition. Take a file's kind from its declaration, and name in the check the kinds it admits.
- A definition change owes the code branch its pointer, walk baseline, stamp, and every triage entry it settled, in the order `AGENTS.md` states. The suppression of a binding finding it closed is the entry that goes stale on that commit.

## Walk rules

These govern the pass. The criterion applied on a hit is the entry's.

- A finding quotes or names the construct the entry's Detect keys on. Where that construct is the harness tool surface or a bootstrap resource, read that surface.
- Take an identifier at full length from its authority: `git rev-parse`, the registry, the resolved path.
- A candidate that falls is an edit, in the same pass, to the entry's Do not flag or the guard's exemption surface.
- A search hit is a site. Read the construct around it, and cite that construct. An empty search leaves open a construct the pattern did not name.
- Read a probe's field, label, id, and anchor back from the schema, the registry, or the catalog before reading the result.
- A claim about what consumes a construct is settled at that consumer: the guard, the loader, or the call sites.
- Where an entry keys on a form, sweep the reference workflows before recording. Convention conformance decides a form the siblings carry.
- An empty hand-check is `blocked` until it has reported a case already in the corpus. Take a set the entry names from that entry's wording.
- `unread` paths are outside the remediation scope, or the pass reads them and says which.
- Every file a fix touched is read whole before the pass closes, under the entries that bind the destination. A `## Rules` or I/O heading in that set is split before the leftover test.
- Follow the entry's Fix through to the consumer it names.
- Edit the lines a ledger, fixture, or snapshot needs. The diff's size is the check.

## References

- [references/canon-map.md](references/canon-map.md) — how a home is enumerated and fetched, and where a judgement already made is recorded.
- [references/reporting.md](references/reporting.md) — bands, row shapes, report templates.
