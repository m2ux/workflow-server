# W02 implementation plan

- AC2: An explicit alignment script converts an unambiguous checked list and Test/Criteria table. It preserves descriptions, coverage and linked result evidence; checked entries without evidence remain pending and are reported. Ambiguous lists remain unchanged. Fixtures exercise conversion, preservation, refusal and idempotence.
- AC3: Sync distinguishes an unreadable table from a readable row with no observing test. Fixtures cover absent and malformed plans plus the existing empty-Test behavior.
- AC4: Alignment checks References URLs against fetched repository metadata. A public issue citing a private repository is reported; private issues and public references pass. Missing metadata remains an explicit unresolved finding. Fixtures cover visibility and section boundaries.
- Procedures: Align routes to artifact-owned operations and commands. Fresh independent readers test the changed paths; structural checks and live results are recorded separately.
- Validation: full planner fixtures, shared fixtures and skill-file validation before publication. Task PR merges into i11/e11/workspace; epic review #1479 remains subject to human approval on workspace.
