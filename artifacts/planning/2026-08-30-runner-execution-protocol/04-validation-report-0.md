# Validation Report — pass 0

**Verdict:** correctable · **Source coverage:** complete

Structure, identifiers, status values, and source-reference resolution all pass: seven canonical sections
in order, 108 entries in the four-part format with correct spacing, identifiers unique and contiguous
across REQ-F001–064, REQ-NF001–035 and SUCCESS-001–009, every entry at `pending`, and the single cited
source resolving to the SRC-DOC001 listing in section 2.5. All 27 normative rows of the analysis coverage
matrix cite requirements that are present in the specification, with no requirement left untraced in
either direction.

## Issues

| ID | Check | Category | Detail |
|----|-------|----------|--------|
| V1 | consistency | correctable | REQ-F017 obliges the runner to dispatch the briefs from a `dispatch` reply, which reads as spawning and contradicts REQ-F013 and REQ-NF007. The source elides the host agent in its fan-out diagram and says so; restate REQ-F017 so the runner composes each brief into a prompt and passes it to the host agent, honouring the declared concurrency limit. |
| V2 | consistency | correctable | REQ-F040 obliges the runner to hold "no file access", contradicting REQ-F036, under which the runner writes declared artifacts and gains filesystem access it would otherwise not need. Narrow REQ-F040 to no access to definition files, which is the prohibition the source states. |
| V3 | content | correctable | REQ-NF016 carries two obligations on two different links under two different modals — a permission for the runner-to-server link and an obligation for the runner-to-worker link. Split into one entry per link. |
| V4 | content | correctable | REQ-NF011 carries two obligations on two components: the runner holds no embedded key, and the server accepts on reproduction rather than on caller identity. Split into two entries; both draw on the same attestation reasoning. |
| V5 | content | correctable | REQ-F048 asserts the early-exit field's removal while its own rationale records that an open question proposes repurposing the same field. State the requirement at the delivery plan's position without the hedge, and add a section 7 requirement that the open question is settled before that stage lands. |

## Notes

Nine SUCCESS entries carry no `SHALL`/`SHOULD`/`MAY`. This is not a defect: a success criterion states an
observable outcome rather than an obligation, and the protocol lists it as a distinct entity from a
requirement. No change is required.

Fourteen further requirement statements repeat a modal across two clauses — REQ-F002, F003, F004, F008,
F013, F016, F020, F021, F023, F029, F031, F035, F043 and F044. Each expresses one rule together with its
failure mode or its converse, which is standard for a testable obligation. Checked and cleared.
