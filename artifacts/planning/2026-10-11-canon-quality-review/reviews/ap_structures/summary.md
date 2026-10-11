# AP-01–AP-68 quality review

Reviewed all 68 assigned anti-patterns against the complete captured catalog and all 47 principles at `e70b44778f71d9d699f746f78a16b892531c82d3`. This is a review of the canon's criteria, not a conformance audit of workflow definitions. No corpus files were edited.

- Dispositions: **37 clear**, **20 with findings**, **11 with optional improvements**. Every primary entry has six reasoned checks in the [ledger batches](coverage.json).
- Read coverage: **176,058 unique source bytes**, both complete captured files, in **9 bounded reads**. Hashes match the inventory. [Read log](read-log.jsonl); [coverage, elapsed time, limits, and batch identities](coverage.json); [preliminary reads and truncation recovery](preliminary-read-log.md).
- Records: **3 high**, **13 medium**, **8 low**. Each record supplies exact source lines and quotes, a witness, replacement wording or a structural edit, and positive/negative observing examples.

## First repairs to reconcile

- [AS-09](findings-03.json): worker-rule copies are required for reach by AP-23 and removed as duplicates by AP-74. Establish one authoring home and verify delivery before deleting copies.
- [AS-14](findings-04.json): AP-31's conditional artifact-note repair conflicts with AP-130's one-filename contract. Use the filename grammar owned by AP-130.
- [AS-18](findings-05.json): AP-51's wrapper-call repair introduces an invocation AP-114 forbids. Put shared work in activity/routine binds and pass its product to local work.

Other defects concern completion versus interim commits; naming-search Boolean logic; human, local, and graph decision scopes; misplaced criteria repair; effective inherited rule sets; inconsistent declaration language; universal versus near-universal strategies; and stage-position exceptions. These are kept distinct from mere overlap and optional policy choices.

## Useful structural improvements

- Consolidate AP-25/AP-60 and the literal-filename portion of AP-43/AP-44. Duplicate findings are overlap, not contradiction.
- Give conduct criteria a required evidence surface and an explicit unevidenced outcome. A definition snapshot cannot prove whether clarification or approval occurred.
- State the effective input/rule contract used by a static review, including inherited and ambient values. Do not guess dynamic delivery.
- Use semantic applicability instead of 'nearly every', and make any small-leaf exception's precedence explicit. Qualitative evidence is sufficient where it identifies the subject, trigger, and consequence.

## Record index

| Record | Kind | Priority | Primary entries with this disposition |
| --- | --- | --- | --- |
| [AS-01](findings-01.json) | scope-ambiguity | medium | AP-01 |
| [AS-02](findings-01.json) | optional-scope-improvement | low | AP-02 |
| [AS-03](findings-01.json) | overbroad-completion-scope | medium | AP-03, AP-07 |
| [AS-04](findings-01.json) | detect-fix-mismatch | medium | AP-04 |
| [AS-05](findings-01.json) | decision-scope-ambiguity | medium | AP-09, AP-11 |
| [AS-06](findings-02.json) | repair-conflict | medium | AP-15 |
| [AS-07](findings-02.json) | contract-representation-ambiguity | medium | AP-16, AP-62 |
| [AS-08](findings-02.json) | effective-scope-gap | medium | AP-20, AP-24 |
| [AS-09](findings-03.json) | same-scope-repair-conflict | high | AP-22, AP-23 |
| [AS-10](findings-03.json) | rule-placement-repair-conflict | medium | AP-23, AP-30 |
| [AS-11](findings-03.json) | consolidation-opportunity | low | AP-25, AP-60 |
| [AS-12](findings-04.json) | operative-explanation-boundary | low | AP-26 |
| [AS-13](findings-04.json) | optional-authorization-boundary | low | AP-29 |
| [AS-14](findings-04.json) | same-scope-repair-conflict | high | AP-31 |
| [AS-15](findings-04.json) | ambiguous-test-polarity | medium | AP-32 |
| [AS-16](findings-04.json) | detect-exception-collision | medium | AP-39 |
| [AS-17](findings-05.json) | consolidation-opportunity | low | AP-43, AP-44 |
| [AS-18](findings-05.json) | same-scope-repair-conflict | high | AP-51 |
| [AS-19](findings-05.json) | address-versus-delivery-ambiguity | medium | AP-53 |
| [AS-20](findings-06.json) | optional-quantifier-clarification | low | AP-55 |
| [AS-21](findings-06.json) | conditional-note-scope-ambiguity | medium | AP-59 |
| [AS-22](findings-06.json) | internal-exception-mismatch | medium | AP-68 |
| [AS-23](findings-06.json) | evidence-surface-addition | low | AP-04, AP-06, AP-07 |
| [AS-24](findings-07.json) | optional-reference-economy | low | AP-48 |

## Validation and limits

The builder validates all 68 primary ids exactly once, every evidence range within its named entry, verbatim captured quotes, complete source-line coverage, all finding references, and JSON batches of at most eight records and 16,000 UTF-8 bytes. The [builder](build_review.py) and [bounded reader](read_source.py) preserve the procedure. The reported wall interval begins at the first instrumented source read; preliminary setup time is excluded.

Root review should independently confirm the three high-priority repair conflicts, reconcile cross-slice observations, and decide the optional authorization and reference-style policies. Ambient-input and dotted-address replacements require checking the corresponding implementation contract before editing canon. No global consistency proof or live behavior verification is claimed.
