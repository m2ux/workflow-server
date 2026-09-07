# Validation Report — pass 2

**Verdict:** correctable · **Source coverage:** complete

Pass 1's V3 and V4 are resolved, neither requirement's statement changing. REQ-F052's rationale now
puts the enforcement path for a routine's ids on the variable-name schema, naming the
identifier-qualification guard only to establish that the qualified-noun rule already exists, which
is what `SRC-DOC001` §13.1 states. REQ-F053's rationale now says the container-contract inheritance
guard finds nothing to read in a routine, matching `SRC-DOC002` §7's own wording.

Structure, identifiers, consistency and markdown pass, re-checked over the whole document: the seven
canonical sections present and correctly ordered with subsections 2.1 to 2.5 intact; all 83 entries in
the four-part format with correct spacing; every identifier unique and in a defined category (53
`REQ-F###`, 23 `REQ-NF###`, 7 `SUCCESS-###`, contiguous within each); a modal keyword on every
statement; a rationale and at least one section 2.5 source reference on every entry; `pending` the
only status used; fences and emphasis markers balanced, no ragged table, and all three section 2.5
links resolving on disk.

Source coverage is complete: all 51 normative rows of the analysis matrix map to requirements present
in the specification, and no row cites an identifier the specification lacks. The measured figures the
requirements carry were checked individually against the sources — the delivery measurement, the
context and re-dispatch costs, the multi-site variable count, the shared-window count, the step-kind
comparison census, the multi-graph and borrowed activity counts, the duplicated line count, the
generated identifier lengths, and the re-derived signature — and each matches. Where the sources
disagree on the convergence variant's length (75 lines against 80), SUCCESS-007 carries neither figure.

The one finding below is a duplicated obligation between two sections, found by comparing every pair
of requirement statements rather than only the region pass 1 changed.

## Issues

| ID | Check | Category | Detail |
|----|-------|----------|--------|
| V5 | consistency | correctable | Severity low, type `content`. REQ-F040's second clause, "SHALL cost no additional hand-off", is REQ-NF011's whole obligation, "SHALL add no dispatch hand-off". One obligation therefore stands at two identifiers in two sections, and REQ-F040 is not atomic. The clause is removable without loss: running inside the referring activity's existing dispatch already forbids the extra hand-off structurally, and section 6 owns the cost property with the measured figures behind it. The sources state the property in two places for two purposes, so nothing here is wrong against them — the defect is that the specification carries the second statement as an obligation rather than as REQ-F040's rationale. Resolved by narrowing REQ-F040 to the execution-locus obligation, which changes no requirement's meaning, adds or removes no requirement, and affects no source coverage. |

## Notes recorded as conformant

Carried forward unchanged from passes 0 and 1: sections 6 and 7 carry `REQ-NF###` identifiers,
sections 5, 6 and 7 numbering continuously. The identifier scheme defines no performance or project
code and is preserved verbatim, so this is the only conformant assignment available, and it is left
for confirmation at finalization.

REQ-F052 and REQ-F053 postdate the analysis's source-coverage matrix and are cited by no row.
Coverage is judged by whether each normative row maps to a requirement present in the specification,
which holds for every row, so this is a stale reference column rather than a specification defect.
