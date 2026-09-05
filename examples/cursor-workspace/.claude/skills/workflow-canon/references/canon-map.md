# Canon Map

Where every authority a walk consults lives, and how to address it. No criteria text, no reproduced
enumeration and no copied exemption — each authority owns its own contents. SKILL.md § Homes carries
the canon paths; what follows is how to read what sits at them.

## Unit inventory

Every home states its own units in its own headings, so the enumeration a walk covers is read from
the home at read time. Take it there; a list reproduced here is a second home that agrees with the
first only until the canon next moves.

| Home | Unit grain | Read the enumeration by |
|------|-----------|-------------------------|
| Anti-Patterns | One unit per `##` family section; entries are `###` within a family | `grep -n "^## "` for the families, `grep -n "^### "` for the entries |
| Design Principles | One unit per `##` section | `grep -n "^## "` |
| Schema Construct Inventory | One unit per `##` section | `grep -n "^## "` |
| Convention Conformance | One unit per `##` section | `grep -n "^## "` |
| Guards | One unit per registry entry, each carrying a one-line `proves` | Read the registry |

Two properties of the catalog do not follow from its headings, and are judgement rather than
enumeration:

- **The last family is where new entries land.** It holds guidance entries alongside the catalog's
  most recently appended anti-patterns, so its title does not describe its contents. Read it to its
  end; the final entry is not signposted by a new `##`.
- **The catalog's first family governs authoring the catalog itself.** It reaches the surface only
  when the audited change edits `anti-patterns.md`; otherwise it is `not-applicable`, with that as
  the recorded reason.

## Authorities beyond the prose homes

A criteria entry states when something is a defect. Whether a particular instance has already been
judged is recorded elsewhere, in surfaces no canon home names — so an entry can fire against content
somebody already excused, with the reason sitting in a file the walk never opened.

Each row is a place and what it records. None of their contents belong here: an exemption copied into
this file is a second home for a judgement, and the copy goes stale the moment the original moves.

| Authority | Where | Records |
|-----------|-------|---------|
| A guard's own exemption surface | Inside the guard or a module it shares — e.g. `EXEMPT_DATA_IDS` in `src/schema/identifiers.ts`, the kind and pipeline sets in `scripts/check-prism-lens-reachability.ts` | Which instances the check excuses, each against a stated reason |
| Triage ledgers | `scripts/binding-fidelity-triage.json`, `workflows/section-framing-triage.json` | A verdict per finding and a named rationale per verdict. The binding-fidelity ledger also stamps the corpus commit its verdicts were made against, so a clean result on a drifted corpus says the verdicts are old rather than that nothing is wrong |
| Reasoned exemption lists | `tests/e2e/option-coverage.json` | Which options a walk is not required to reach, grouped under the reason that covers them |

**A guard's silence has two causes, and they point opposite ways.** Out of reach means the entry is
the sole detector for that spelling and the finding stands. Exempted means the judgement is already
recorded, and the finding is then against that exemption's stated reason — a different and usually
weaker claim than one against the construct. A pass does not say which; only the surface does.

An exemption also travels further than the guard that holds it. `EXEMPT_DATA_IDS` is compiled into
the Zod variable schema and into the published JSON schemas, so a name on it is legal by contract
rather than by oversight.

## Change-surface scope (audit and implement)

SKILL.md § Audit → Scope the surface owns the composition of the change surface and the forbidden
scopes. Two consequences bear on reading criteria rather than on building the surface:

- A unit's own reach chooses which criteria fire against a file. It does not shrink a touched file to
  its hunks, and does not drop a referencer pulled in by contract reach.
- On the **Implement** path the surface starts from the constructs the specification names, resolved
  to files; the closure and consumer rules then apply to that set unchanged.

## Fetching

The catalog is fetched by section in every mode, for the reason SKILL.md § Homes gives:

- **On disk** — `grep -n "^## "` to get the section line numbers, then Read the one range you need.
  For a single entry, `grep -n "^### "` and read that block.
- **In an active workflow session** — `get_resource` with a cross-workflow ref and anchor:
  `workflow-design/anti-patterns#coupling-anti-patterns`, `workflow-design/design-principles`,
  `workflow-design/schema-construct-inventory`, `workflow-design/convention-conformance`.

Do not summarise a section into working notes and then audit against the notes. Detect wording
carries the carve-outs; a paraphrase loses them and manufactures false positives.

## Which units bind a file kind

Every unit binds every file kind until its own text excludes one. A unit whose criteria cannot reach
the surface is `not-applicable`, and the reason recorded is that unit's own wording.

Reach is a property each unit states for itself, so it is read from the unit at walk time. A mapping
from file kinds to unit titles held here would be the one fact in this file that no home states,
carrying no way to detect its own drift as the canon grows.

## Per-home boundaries

The homes overlap by design; taking the wrong thing from one double-counts a single defect or loses a
carve-out.

| Home | Take | Do not take |
|------|------|-------------|
| Anti-Patterns | **Before writing:** Fix and Do-not-flag, as the shape the content takes. **On existing content:** Detect, honouring the carve-outs | The *prefer X before Y* stance — that is the principles' home |
| Design Principles | Whether authored content honours the stance. Detect **only** where no catalog entry's Detect reaches the shape — the principles home states that it covers failures not yet catalogued, and that class has no other detector | Detect for a shape a catalog entry already keys on. Scoring a principle is not a second finding for a defect an entry already named |
| Construct Inventory | The informal→formal mapping, as Detect for prose that substitutes for a construct | Field-level schema truth; `schemas/*.schema.json` and `schemas/README.md` are that home |
| Convention Conformance | The concerns to compare, and the justified-vs-conform disposition | The conventions themselves — the live sibling files are the baseline |
| Guards | Verdicts and findings as evidence | A restated roster; read `scripts/guards.ts` |

Where a principle and a catalog entry share a concern, the entry carries the operative criterion and
the principle carries the framing: report the entry, cite the principle.

A principle names its covering entry where one exists, and that name settles the pairing **only for
the shapes the entry's Detect reaches**. A stance spans every spelling of its defect; an entry keys
on the spellings it names. So read the entry's Detect against the construct in hand before deferring
to it: where the stance reaches a spelling the Detect does not, the principle is the sole detector
for that spelling, and the distance between them is itself a finding against
`operative-criteria-need-a-home`.
