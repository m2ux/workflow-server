# Validation Report — pass 1

**Verdict:** passed · **Source coverage:** complete

Every check passes. Seven canonical sections in order; 111 entries in the four-part format with correct
spacing; identifiers unique across REQ-F001–064, REQ-NF001–038 and SUCCESS-001–009; every entry at
`pending` carrying a rationale and a source that resolves to the SRC-DOC001 listing in section 2.5;
markdown balanced; every entry within the per-entry line budget. All 27 normative rows of the analysis
coverage matrix cite requirements present in the specification, and no row is left unmapped.

## Corrections from pass 0

| ID | Resolution |
|----|-----------|
| V1 | REQ-F017 now has the runner compose each brief into a prompt and pass it to the host agent within the declared concurrency limit. The spawning reading is gone and the entry agrees with REQ-F013 and REQ-NF007. |
| V2 | REQ-F040 narrows to no access to definition files, which is the prohibition the source states. Its rationale names the REQ-F036 artifact-writing grant as separate, so the two no longer collide. |
| V3 | REQ-NF016 keeps the runner-to-server permission; REQ-NF037 carries the runner-to-worker obligation. One link and one modal per entry. |
| V4 | REQ-NF011 keeps the runner's prohibition on an embedded key; REQ-NF036 carries the server's basis for acceptance. One component per entry. |
| V5 | REQ-F048 states the delivery plan's position without the hedge, and REQ-NF038 requires the repeat-until continuation-condition question settled before that stage lands. The two now stand in a declared dependency. |

## Notes

REQ-NF036 and REQ-F029 both concern the server arriving independently at a transition. They are distinct
and both are kept: REQ-F029 obliges the server to reproduce every reported transition and refuse what it
cannot reproduce, while REQ-NF036 fixes what acceptance rests on — reproduction rather than proof of
caller identity. Checked and cleared.

Fourteen requirements are absent from the coverage matrix: REQ-F054, REQ-NF009, REQ-NF011, REQ-NF012,
REQ-NF020, REQ-NF021, REQ-NF022, REQ-NF026, REQ-NF028, REQ-NF033, REQ-NF034, REQ-NF036, REQ-NF037 and
REQ-NF038. Each draws on a companion record — `cost-model.md`, `attestation.md`,
`protocol-verification.md`, `investigation.md` or `decisions.md` — and the matrix rows the proposal's own
sections rather than the companions. Every one cites SRC-DOC001 with its companion named, so traceability
holds through the source reference. This is the matrix's scope, not a defect in the specification, and it
is no coverage gap: coverage runs from source statement to requirement, and that direction is complete.

Fifteen requirement statements repeat a modal across two clauses — REQ-F002, F003, F004, F008, F013,
F016, F020, F021, F023, F029, F031, F035, F040, F043 and F044. Each expresses one rule together with its
failure mode or its converse, which is standard for a testable obligation. REQ-F040 belongs on this list
and was omitted from the pass 0 count. Checked and cleared.
