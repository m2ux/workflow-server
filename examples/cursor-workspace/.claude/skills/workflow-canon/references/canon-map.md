# Canon Map

Where the criteria live and how to read them. No criteria text and no reproduced enumeration — the
homes own both.

## Unit inventory

Every home states its own units in its own headings, so the enumeration a walk covers is read from
the home at read time. Take it there; a list reproduced here is a second home that agrees with the
first only until the canon next moves.

| Home | Path | Unit grain | Read the enumeration by |
|------|------|-----------|-------------------------|
| Anti-Patterns | `workflows/workflow-design/resources/anti-patterns.md` | One unit per `##` family section; entries are `###` within a family | `grep -n "^## "` for the families, `grep -n "^### "` for the entries |
| Design Principles | `workflows/workflow-design/resources/design-principles.md` | One unit per `##` section | `grep -n "^## "` |
| Schema Construct Inventory | `workflows/workflow-design/resources/schema-construct-inventory.md` | One unit per `##` section | `grep -n "^## "` |
| Convention Conformance | `workflows/workflow-design/resources/convention-conformance.md` | One unit per `##` section | `grep -n "^## "` |
| Guards | `scripts/guards.ts` | One unit per registry entry, each carrying a one-line `proves` | Read the registry |

Two properties of the catalog do not follow from its headings, and are judgement rather than
enumeration:

- **The last family is where new entries land.** It holds guidance entries alongside the catalog's
  most recently appended anti-patterns, so its title does not describe its contents. Read it to its
  end; the final entry is not signposted by a new `##`.
- **The catalog's first family governs authoring the catalog itself.** It reaches the surface only
  when the audited change edits `anti-patterns.md`; otherwise it is `not-applicable`, with that as
  the recorded reason.

Anchors on the principles home embed the section ordinal, so an anchor breaks when the canon gains a
principle while the title survives — see SKILL.md § Homes for the citation rule that follows from
this.

## Change-surface scope (audit and implement)

SKILL.md § Audit → Scope the surface owns the composition of the change surface and the forbidden
scopes. Two consequences bear on reading criteria rather than on building the surface:

- A unit's own reach chooses which criteria fire against a file. It does not shrink a touched file to
  its hunks, and does not drop a referencer pulled in by contract reach.
- On the **Implement** path the surface starts from the constructs the specification names, resolved
  to files; the closure and consumer rules then apply to that set unchanged.

## Fetching

`anti-patterns.md` exceeds the per-resource eager-delivery cap, so it is never bundled whole. Fetch by
section in every mode:

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
the principle carries the framing: report the entry, cite the principle. A principle names its
covering entry where one exists, so the pairing is read from the principle rather than listed here.
Where a principle names none, establish whether an entry's Detect reaches the shape before treating
the principle as the sole detector — the principle's own text is what fires when none does.
