# Canon Audit — work-package report guides

**Base ref:** `i10/workflows` @ `fc5cf13a` · **Coverage:** the report-guide property (code named in words, link in the prose) × 5 of 5 guides · **Change surface:** the five guides that emit a review report · **Guards:** not the instrument; this row is the guide reading

**Verdict:** no open finding. Each guide names the code in words and carries the site as an inline link in the prose.

## Change surface

| Path | How it joined |
|------|----------------|
| `corpus/work-package/resources/findings-report.md` | shared shape every findings report follows |
| `corpus/work-package/resources/rust-substrate-code-review.md` | code-review report |
| `corpus/work-package/resources/test-suite-review.md` | test-suite report |
| `corpus/work-package/resources/strategic-review.md` | strategic-review report |
| `corpus/work-package/resources/manual-diff-review.md` | manual-diff report section and block index |

## Findings

None.

## Coverage

Read whole. Each guide's finding body opens on the named thing as an inline link:

- `findings-report.md` — `Description` opens with an inline link; the site is that link, and a `Location:` field beside it is refused.
- `rust-substrate-code-review.md`, `test-suite-review.md`, `strategic-review.md` — each template's `Description` opens with an inline link to the named thing. The code-review `Code Example` is an optional extension for a fix that reads more clearly shown, after the six fields, and is not the citation.
- `manual-diff-review.md` — each block title names the change in words and links to its line; the issue line opens with the changed code named in words and linked.

No guide template carries a `Location:` field or a trailing source table.

## File coverage

read 5 · unread 0.
