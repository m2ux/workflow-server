# Canon Map

How to address each authority. Paths are in SKILL.md § Homes. What a home requires is in that home.

## Unit inventory

Read the enumeration from the home at the commit audited.

| Home | Unit | Read by |
|------|------|---------|
| Anti-Patterns | One `##` family; each `###` entry inside it | `grep -n "^## "`, then `grep -n "^### "` |
| Design Principles | One `##` | `grep -n "^## "` |
| Convention Conformance | One `##` | `grep -n "^## "` |
| Guards | One registry entry | `guards/guards.ts` |

- Read the catalog through its last family. Appended entries share that family, so its title is not the end of the list.
- The catalog's first family binds when the change edits `anti-patterns.md`. Otherwise it is `not-applicable`, with that reason.

## Authorities beyond the prose homes

An entry can fire against an instance a surface has already judged. Read that surface before hand-walking an entry whose registry line claims the check.

| Authority | Where | Records |
|-----------|-------|---------|
| A guard's exemption surface | In the guard or a module it shares — `EXEMPT_DATA_IDS` in `src/schema/identifiers.ts`; the kind and pipeline sets in `guards/check-prism-lens-reachability.ts` | Instances the check excuses, each with a reason |
| Triage ledgers | `ledgers/binding-fidelity-triage.json` and `ledgers/section-framing-triage.json` on the corpus tree | A verdict and a rationale per finding. Binding-fidelity stamps the corpus commit |
| Reasoned exemption lists | `walks/option-coverage.json` on the corpus tree | Options a walk need not reach, under the reason that covers them |

`EXEMPT_DATA_IDS` is compiled into the Zod variable schema and the published JSON schemas.

## Fetching

- **On disk** — `grep -n "^## "` for the range, then Read it. For one entry, `grep -n "^### "` and read that block.
- **In a workflow session** — `get_resource` with `canon/<home>#<heading>`.

## Which units bind a file kind

Every unit binds until its own text excludes the file kind. `not-applicable` records that wording.

## What to take

Each home's overview states what an audit takes from it. Follow the overview. Where a principle names a covering entry, follow that entry for the spellings its Detect reaches, and follow the principle where it reaches a spelling the Detect does not.
