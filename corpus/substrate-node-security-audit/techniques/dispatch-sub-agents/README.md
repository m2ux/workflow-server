# Dispatch Sub Agents

> Part of [techniques](../README.md)

Shared contract for the audit's sub-agent dispatch surface — the crate-to-agent assignment, the routing of reconnaissance leads, the domain shapes its worker briefs and gathered results….

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`assign-roster`](assign-roster.md) | Assign each in-scope crate to a sub-agent group and identify the cross-crate supplementary files each agent needs, forming the agent roster |
| [`collect-results`](collect-results.md) | The agent branches' containers and the agent roster projected into the audit dispatch shape — per-agent structured output, summary counts, and a crate-aware manifest |
| [`compose-roster-briefs`](compose-roster-briefs.md) | One sub-agent brief per roster agent, each carrying workflow-server bootstrap instructions, its context variables and supplementary files, the output-schema requirement, and the calibration… |
| [`route-leads`](route-leads.md) | Route every reconnaissance lead to a specific agent designator in the roster, producing a lead-to-agent routing table |
