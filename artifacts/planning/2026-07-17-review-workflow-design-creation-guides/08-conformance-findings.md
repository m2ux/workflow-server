# Conformance Findings: workflow-design (update pass)

**Target:** `workflow-design` · **Scope:** 7 drafted technique files (scope-manifest) · **Mode:** update

| # | File | Diverging construct | Reference convention | Disposition |
|---|------|----------------------|-----------------------|--------------|
| 1 | `techniques/persist-design-specification.md:8` | Capability cites `../resources/design-specification.md` (bare, no anchor) | Every other cite of this guide in the same file (Protocol steps, `#template`) and all six sibling files drafted in this batch use the `#template` anchor | Bring into conformance |
| 2 | `techniques/review-draft-yaml.md:28` | `draft_attestation` Output description cites `../resources/draft-attestation.md` (bare, no anchor) | The `reviewed_blocks` Output and the persist Protocol step in the same file, and all sibling files in this batch, use `#template` | Bring into conformance |

**conformance_finding_count:** 2 (at audit) · **after fix-all:** 0

## Fixes applied

| # | File | Change | Result |
|---|------|--------|--------|
| 1 | `techniques/persist-design-specification.md:8` | Capability cite → `#template` | Applied |
| 2 | `techniques/review-draft-yaml.md:28` | `draft_attestation` Output cite → `#template` | Applied |

Re-audit: no remaining bare `.md` guide cites in the seven scoped technique files.
