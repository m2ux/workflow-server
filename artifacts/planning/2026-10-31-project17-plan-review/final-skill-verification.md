# Final whole-repository skill verification

User selected A: final verification follows relevant cleanup and every skill must pass.

## Contract

- AC27 requires every repository skill, no exclusions or accepted-failure baseline, a successful exit and no findings.
- Final verification follows all remaining E10 changes. Checker rules, command specifications, instructions and cleanup all contribute to the measured corpus. The direct prerequisite set omits transitive W01 and W04.
- Evidence records the commit, complete skill inventory, command, exit status and output. A later change to measured inputs requires a fresh run.
- Implementation fixes belong to their owning tasks; the final task verifies the combined result.
- Other epics may subsequently change the corpus; this record proves the stated revision, not an indefinite repository-wide pass.

## Identity map

| Former task | Current task | Scope |
| --- | --- | --- |
| W21 | W26 | Final verification |
| W22 | W21 | Canon conventions |
| W23 | W22 | Review Changes prose |
| W24 | W23 | Specification reach |
| W25 | W24 | Draft report |
| W26 | W25 | Throwaway filtering |

GitHub search found one historical E10 mention and no delivery PR identifying these tasks. All six rows were unreserved work-item links. Criterion IDs, coverage and completion states are preserved. Work-item filenames and current README links follow the map; original-issue captures and dated review snapshots preserve historical numbering. The current E10 pair register follows the new identities and removes pairs now related by the final-verification dependencies.

## Verification

- [Dependency result](final-verification-dependencies.txt): no E10 graph problem or unaccounted independent pair. Existing whole-epic edges elsewhere remain findings.
- This is plan reconciliation, not an executed whole-repository pass. AC27 remains unchecked.

- Published E10 body matches fresh readback; every linked planning work-item file exists; issue format passes with no findings.
