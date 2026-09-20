# Dispatch Scanners

> Part of [techniques](../README.md)

Shared contract for the CI/CD audit's sub-agent dispatch surface — the domain shapes its worker briefs and gathered results take, the persistence check over the output files, and the….

The shared contract every operation here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`collect-results`](collect-results.md) | Gathered worker output and the scanner roster projected into the CI/CD dispatch shape — per-scanner structured output, summary counts, and a submodule-aware manifest |
| [`compose-gap-briefs`](compose-gap-briefs.md) | Targeted re-dispatch briefs, one for each coverage gap the verification report names, and an empty set where it names none |
| [`compose-merge-brief`](compose-merge-brief.md) | The merge (M) sub-agent's brief, as a single-element brief set |
| [`compose-verification-brief`](compose-verification-brief.md) | The verification (V) sub-agent's brief, as a single-element brief set |
| [`verify-dispatch-completeness`](verify-dispatch-completeness.md) | Confirm every assigned scanner was gathered with a non-empty return, using meta gather completeness plus the domain roster |
| [`verify-output-files`](verify-output-files.md) | Confirm every dispatched scanner's output file exists in the planning folder, re-dispatching any scanner whose file is missing |
| [`verify-reconciliation`](verify-reconciliation.md) | Confirm the merge sub-agent's reconciliation table shows zero unaccounted findings for every scanner, re-dispatching the merge sub-agent otherwise |
