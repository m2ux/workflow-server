# Validation Report — pass 0

**Verdict:** correctable · **Source coverage:** incomplete

Structure, identifiers, content, and consistency all pass: the seven canonical sections are present
and correctly ordered, all 81 entries carry the four-part format with correct spacing, every
identifier is unique and in a category the scheme defines, every statement carries a modal keyword,
every entry carries a rationale and at least one source reference resolving to section 2.5, `pending`
is the only status used, markdown is well-formed, and no two requirements contradict one another. The
two findings below are both source coverage.

## Issues

| ID | Check | Category | Detail |
|----|-------|----------|--------|
| V1 | source coverage | correctable | Severity medium, type `content`. No requirement obliges a routine's declared input, output and internal ids to satisfy the corpus symbol-id shape rules. Section 4.1 carries the obligation only inside REQ-F008's *rationale* ("under the ordinary id-shape rules"), where nothing is testable against it, and applies it to internals alone rather than to all three categories. |
| V2 | source coverage | correctable | Severity low, type `content`. No requirement records that a routine inherits no container-contract input/output, which the sources state as a deliberate property of the construct and which REQ-F007's no-free-variables rule does not imply. |

Both are resolved by adding a requirement to section 4.1; neither changes the meaning of an existing
requirement, and neither is blocking.

## Coverage gaps

| Source statement | Why unmapped |
|------------------|--------------|
| `SRC-DOC001` §13.1 (Mike Clay) — a routine's input, output and internal ids are symbol ids, and the variable-name schema enforces the same qualified-noun rule on the YAML side | The analysis matrix maps this section to REQ-NF001 to REQ-NF004, which carry the guard classification the section is mostly about but not the id-shape obligation it also states. The row therefore resolves to requirements that exist while leaving part of the row's obligation uncovered. |
| `SRC-DOC002` §3 and §7, and `SRC-DOC001` §10.1 stage 6 (Mike Clay) — every routine output id conforms to the id-shape rules; two of the superseded conversion artifact's four output ids are shapes the live catalogue names as defects | Same cause: the matrix rows cite REQ-NF021 and REQ-NF001 to REQ-NF004, none of which states the conformance obligation. Re-deriving from the artifact would reintroduce two catalogued anti-patterns, which is what makes this testable rather than editorial. |
| `SRC-DOC002` §7 (Mike Clay) — container-contract inheritance, which a routine deliberately does not have | The matrix marks the row normative and cites the guard requirements; the inheritance property itself reaches no requirement. Corroborated by `SRC-DOC003`, whose rejection of the technique-merge alternative turns on a routine needing an inherited-input opt-out. |

## Note on identifier categories

Sections 6 and 7 carry `REQ-NF###` identifiers, sections 5, 6 and 7 numbering continuously. The
identifier scheme defines no performance or project code, and the scheme is preserved verbatim, so
this is the only conformant assignment available; performance and process constraints are also
non-functional in the ordinary sense. Recorded as conformant rather than as an issue, and left for
confirmation at finalization.
