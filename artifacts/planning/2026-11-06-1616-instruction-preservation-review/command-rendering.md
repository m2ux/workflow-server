# Command Redirection Rendering

## Finding and Correction

At `3fcac1cbf60d784983e7c590e4f4de15cc3e7aad`, Fetch Board Items with Status puts output redirection at the start of a continued line. CommonMark interprets the leading `>` as a blockquote, separates it from the invocation paragraph and places the closing HTML tags inside the quote.

`e76308e672cc04d94b47891946bfbdc5331184b3` encodes line-leading redirection as `&gt;` or `&gt;&gt;`. The same correction covers eight invocations in Board, Dispatch Batch, Initiative Issue Body, Issue and Pull Request. Guidelines states the encoding beside the existing terminal-backslash rule. Links, role titles and decoded shell commands are preserved.

## Verification

- Local `markdown_it` CommonMark rendering reproduces a blockquote in each of the eight original invocation blocks; all eight corrected blocks render without a blockquote.
- HTML entity decoding produces identical before/after invocation text for every correction.
- Document tests: 13 passed.
- Checkout-contract tests: 12 passed.
- Command behavior tests: 9 passed.
- Installed skill checker: 58 files, zero findings.
- `git diff --check` passed.
- This changes presentation and its guideline; it does not change reading paths or planner script behavior. Existing source-route/disclosure limits remain as recorded in the preservation review.

A GitHub Markdown preview request was rejected by automatic approval review because it would transmit a local excerpt. No remote preview is claimed; the checks above use the locally available renderer.
