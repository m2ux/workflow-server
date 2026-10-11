# Audit Finalize

> Part of [techniques](../README.md)

Assembles the three security-audit deliverables — a summary report, a detailed-findings document, and a design trade-off analysis — from the analysis runs' contract artifacts, and….

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`apply-formatting-rules`](apply-formatting-rules.md) | Links the summary report to the detailed findings, which can only be done once both documents exist |
| [`create-detailed-findings`](create-detailed-findings.md) | Create the detailed-findings document from prism's DEFINITIVE-FINDINGS.md contract: an expanded write-up for every finding, organised by severity and grouped within each severity under… |
| [`create-trade-off-analysis`](create-trade-off-analysis.md) | Distils the conservation laws the analysis recorded into a design trade-off analysis: a trade-off catalogue, a cross-domain interaction map, and a design decision register |
| [`split-report`](split-report.md) | Transform prism's report(s) into a summary-focused audit report: retain every section except the inline detailed findings, replace those with a reference line to the detailed-findings… |
| [`verify-audit-consistency`](verify-audit-consistency.md) | Verify the three audit deliverables exist and are internally consistent — confirming that every cross-document hyperlink resolves to an actual heading |
