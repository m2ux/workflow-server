# Strategic Review

> Part of [techniques](../README.md)

Scope-disciplined strategic review of the implementation — findings, changes-folder hygiene, and cleanup of investigation artifacts.

The shared contract every technique here inherits is in [`TECHNIQUE.md`](TECHNIQUE.md); what each one contributes is below.

| Technique | Contributes |
|---|---|
| [`apply-cleanup`](apply-cleanup.md) | Approved cleanup on source, with changes-folder fragment committed on the feature branch |
| [`changes-folder`](changes-folder.md) | Target repository `changes/` changelog fragment for this work package when the repo uses that convention |
| [`document-findings`](document-findings.md) | Strategic review document with findings typed from the review-scope pass, or a clean-review result |
| [`recommend-cleanup`](recommend-cleanup.md) | Review-mode cleanup recommendations in the strategic review document — advisory only |
| [`resign-commits`](resign-commits.md) | Feature-branch commits re-signed so every commit carries a valid GPG signature |
| [`review-scope`](review-scope.md) | Scope-discipline and artifact-hygiene findings across the feature-branch diff for the strategic review document |
| [`verify-fragment`](verify-fragment.md) | Whether the work-package change fragment under the target path references the issue |
