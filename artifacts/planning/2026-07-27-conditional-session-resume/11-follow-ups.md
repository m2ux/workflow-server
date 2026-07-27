# Follow-Ups

> Design session · `meta` · updated 2026-07-27

| ID | Surfaced at | Item | Owner / next step | Status |
|----|-------------|------|-------------------|--------|
| F-1 | scope-and-draft | Two `check-binding-fidelity` entries are needed for `detect-resume-intent` — a `dead-output` for `resume_intent_requested` and an `orphan-input` for `user_request` — neither a defect ([why](09-file-review-note.md#binding-fidelity-findings--both-expected-neither-a-defect)) | Both entries added to `scripts/binding-fidelity-baseline.json` at validate-and-commit; the guard now reports 0 NEW. The file lives on the server repo's `main`, outside this session's worktree and PR, so the edit is uncommitted — it needs its own `main`-based branch and commit | open |
