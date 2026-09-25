# Resolve Findings

> Part of [techniques](../README.md)

Carries each evaluation finding from a criticism to a decided change: what it would take to answer, what the user chose, and what the target ends up saying.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`apply-changes`](apply-changes.md) | Makes the planned changes to the target, each one checked against the text it expects to find and the text it leaves behind |
| [`compile-plan`](compile-plan.md) | Compile the collected per-finding decisions into the mitigation plan and verify every finding has a corresponding plan entry |
| [`load-and-classify`](load-and-classify.md) | Turns the report's findings into a worklist: each one located in the target, sized by what answering it would take, and put in the order they are worked through |
| [`propose-mitigation-by-tier`](propose-mitigation-by-tier.md) | Propose a tier-appropriate mitigation for a single finding — a correction, a reframing, a novel mechanism, or an acknowledgement — preserving the author's intent |
| [`record-finding-decision`](record-finding-decision.md) | Record one finding's disposition alongside the mitigation text it applies to, so the compiled plan carries what was decided and the wording it was decided on |
