# W06 Verification Preparation

## Criterion Instrument

`/tmp/i17-e01-w06/verify-w06.py` verifies one clean checkout. Its default checkout is the process working directory; `--checkout` selects an explicit repository root. Every criterion invocation requires the full expected commit SHA, full tree SHA and SHA256 content hash through `--expected-head`, `--expected-tree` and `--expected-content-sha256`. The baseline defaults to the supplied W06 base, fb9a834c940cbed9742709d7e03594900e31d22f. A baseline override also requires a full literal commit SHA.

The content hash covers every tracked path under `skills/` and tracked `scripts/sbx`: sorted path bytes, a NUL separator and each file's raw SHA256 digest feed one SHA256. `identity(checkout)` computes this only for a clean repository root. Final expected values are recorded after actual composition and the source commit, not derived from the current dirty branch as an acceptance result.

The instrument refuses dirty tracked or untracked state, a non-root checkout, an expected-identity mismatch, an unavailable exact baseline or identity changes during checking. It compiles the supplied checkout's actual checker source into a fresh module, with separate fresh state for strict and installed checks. It injects only W06's exact-file strict declarations and the proven mode declaration into a process-local cache. Installed files stay intact. The known installed Revise Fields mismatch is reported separately; other installed findings fail the criterion.

Preservation reads the exact baseline from the supplied repository and uses the checker's lexical spans and headings. Command bytes and order, literal specimens and Prerequisites are compared without another Markdown lexer. Semantic review, full suites and six independent disclosure walks remain separate evidence. The instrument reports no final acceptance for the currently dirty W06 checkout.

## Neutral Reader

`neutral-read.py` is a byte-identical copy of `/tmp/i17-e01-w07/composed-v4/neutral-read.py`, SHA256 d6cf2bffa1b59a4bc1e70d019dec64387b88f22b19104fe835b479156f572202. It imports `parse()` from sibling `source/skills/scripts/check_skill_files.py`; the final composition supplies that captured source directory. No final source or input snapshot is prepared here.

The helper preserves raw UTF-8 bytes and line endings while selecting headings from the shared lexical parser. It excludes fenced and HTML payload headings from boundary selection. Existing disclosure-v2/read.py is historical and contains the raw-heading defect: its real Architecture Overview Template read returns 27 bytes, while the complete section contains 1,712 bytes. Use the corrected helper for final walks.

## Controls

`/tmp/i17-e01-w06/verification-preparation-controls.py` reports 19 passing preparation controls in `verification-preparation-controls.json` and `.log`. Disposable synthetic Git revisions test default-cwd and explicit-checkout selection, exact commit/tree/hash mismatch refusals, tracked/untracked dirt refusal, command-byte mutation failure and execution of the actual supplied checker. Read-only actual-source controls establish dirty-branch refusal and correct shared-span extraction of all 58 baseline payloads and Prerequisites.

Reader controls cover Unicode and CRLF bytes, nested fences, HTML payload headings, whole-file output, complete actual Architecture Overview, Planning Record and Work Item templates, ambiguous real headings and literal-only headings. They also reproduce the historical reader defect. The final control verifies identical bytes and Git status for all sixteen owned product paths.

Only private preparation and controls run. Product files, engineering records and historical snapshots remain untouched. Actual W07 integration, full actual suites, fresh captured inputs/final freeze and root-scheduled disclosure walks remain pending.
