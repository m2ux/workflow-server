# File Review Note — Requirements-Refinement Canon Conformance

**Mode:** update · **Target:** `requirements-refinement`

Every removal below is inventoried in [impact §3](05-impact-analysis.md#3-removals-inventory) rows 1–9. Rows 10–15 are unapplied, so `has_unflagged_removals` is false. Both repo validators pass on the drafted tree.

| File | Status | Delta / attestation | Removals (update) |
|------|--------|---------------------|-------------------|
| `workflow.yaml` | drafted | Variable set reduced to 13; version 1.2.0 | listed; flagged (row 1) |
| `activities/01-intake-and-analyze.yaml` | drafted | Four prose fields restated as linked declaratives; routing untouched | none |
| `activities/03-update-specification.yaml` | drafted | Announcement links the working specification | none |
| `activities/04-validate-specification.yaml` | drafted | Announcement added; the cap literal is now the only home | none |
| `activities/05-finalize-specification.yaml` | drafted | Announcement and gate link both staged artifacts | none |
| `activities/06-report-failure.yaml` | drafted | Announcement and gate become linked statements | none |
| `techniques/TECHNIQUE.md` | drafted | Shared input set reduced to four | listed; flagged (row 2) |
| `techniques/intake-sources.md` | drafted | `intake_record_path` declared and captured | none |
| `techniques/analyze-source.md` | drafted | `requirements_analysis_path` declared and captured | none |
| `techniques/update-specification.md` | drafted | Counter is a declared output; Protocol is four work phases; `## Rules` added | listed; flagged (row 9) |
| `techniques/validate-specification.md` | drafted | Verdict descriptions state meaning; path declared | none |
| `techniques/finalize-specification.md` | drafted | Two paths declared; presentation phase gone | listed; flagged (row 7) |
| `techniques/report-failure.md` | drafted | Path declared; presentation phase and removed-variable read gone | listed; flagged (rows 3, 8) |
| `techniques/README.md` | drafted | Inherited-input list corrected | listed; flagged (row 4) |
| `README.md` | drafted | Cap as literal; artifact-location claim gone; banner v1.2.0 | listed; flagged (rows 5, 6) |
| `activities/README.md` | drafted | Produces column names artifacts by identifier | none |

## Deliberate non-changes

Four gate options stay effect-less and `01`'s transition arm stays at baseline — each is governed by an open assumption and an unapplied removal row, recorded as [follow-ups](03-follow-ups.md) F-3 and F-5. Two drafting judgements are recorded there as well: F-2 (container-hoisted inputs not redeclared) and F-4 (Protocol 5 overlap left standing rather than removed without approval).
