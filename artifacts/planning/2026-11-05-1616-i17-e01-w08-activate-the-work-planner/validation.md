# W08 Validation

## Source Identity

The starting tree is `dfb00380a58ab3346b77b7780424831b2a12fde2`. The accepted frozen manifest covers 190 tracked skill/checker/support files, SHA256 `4e5f8b9c2cff82b5776495b46dd6bcf751be73d752f2f8dcaf44ae50ec6ce600`. The complete-suite and independent-walk head is `39248011df2320274c9d8d53078b887716e49fde`, tree `0ef1fe916ec77c29aa6f679757aebf1d242fbc20`, recorded in literal-head.json. The final head is `2c6ab442d61877dd23bb0692812b120b4c09fba8`, tree `126194e3308cc164a88a30e5a30c2858a5755a28`, recorded in final-head-audit.json. Its only delta from the complete-suite snapshot is the two-paragraph guideline consolidation in final-rule-home-patch.json. The final-source-manifest.json verifies 190 committed files against the actual checkout; its SHA256 is `e34be674fa1b60b63824cb9c57627b48bf4cdcc2edfef066c097773e72095420`.

## Installed Model Check

The ordinary installed command is `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`. It selects the installed structure.json directly, with no model override or declaration cache: **58 files checked, zero findings**. The final-head output is final-installed-check.log; installed-check.log preserves the earlier complete-suite snapshot result. Other skills and the shared guidelines retain their declarations and content; their findings are outside this unit.

## Work Planner Suite

The complete suite command is `scripts/sbx python3 -m unittest discover -s skills/work-planner/test`. The definitive complete-suite run at `39248011df2320274c9d8d53078b887716e49fde` is work-planner-tests.log: **933 tests total, 932 pass and one expected skip**, in 125.465 seconds. Its single expected skip is the opt-in live Development-link test: no live issue/draft-pull-request fixture is supplied. The unit has no task issue, and this skill-model change does not edit Development-link behavior.

At final head `2c6ab442d61877dd23bb0692812b120b4c09fba8`, the ordinary checker passes and the 13 document-reader plus 11 checkout-reader tests pass. Their complete outputs are final-document-reader-tests.log and final-checkout-reader-tests.log. The final change consolidates two guideline bodies onto their existing rule links; executable code, declarations, tests, headings and link targets equal the complete-suite snapshot. No second complete-suite run or current-head 933-test claim is made for that documentation-only delta.

The source readers retain operation Inputs/Outputs, consecutive heading steps, directed layer calls, direct prerequisites, script/import reach, fetched epic-base evidence, checkout vocabulary, transitive acting-operation detection, checkout propagation and literal exclusion. Three added controls expose missing installed command declarations or literal/unexecuted invocation leakage. Synthetic parser fixtures select their own declared model; actual Work Planner corpus reads select only the installed declaration.

## Shared Checker Suite

`scripts/sbx python3 -m unittest discover -s skills/test` passes **258 tests** at the complete-suite snapshot `39248011df2320274c9d8d53078b887716e49fde`. Its complete output is shared-checker-tests.log. The final documentation consolidation changes none of the shared checker or test source. Shared support for other declared models remains intact.

## Source and Head Audit

source-audit.json records the five-path scope and nonvacuous corpus measurements: 15 checkout-acting commands, 24 transitive acting operations, 1,508 execution links, 20 directly invoked scripts and 16 Record Epic Delivery calls. Import closure covers the remaining script modules in the Work Planner suite. Nineteen existing callable titles have two words, including Run Tests; their anchors and call sites are preserved.

Only guidelines.md, structure.json, rules.json, test/test_documents.py and test/test_checkouts.py differ from the starting tree. Every other tracked file is byte-identical, including entry frontmatter, execution payloads, prerequisites, templates, Lane placement and ownership. Shared guideline and other-skill files are byte-identical. literal-head.json records the complete-suite snapshot equality. final-head-audit.json records final commit/live equality over 190 files and the single guideline-file delta from that snapshot; every heading and link target is identical. `git diff --check` reports no whitespace errors.

## Required Context and Disclosure

context-trace.md identifies the affected guideline consumers, prerequisite closure, local heading links and Revise's explicit whole-guideline path. The two independent fresh readers use the same neutral bounded request, frozen source and read-only authority. Both recover the complete required guidelines and prepare correct bounded proposals and appropriate unexecuted validation plans. Both also perform broad searches that load unrelated content and truncate; these are **Partial disclosure observations**, with failed exclusion and over-reading. Neither reader executes validation or edits source. Their proposed wording is a test result, remains unapplied, and is not an additional product request.

[Reader 1 account](reader-1-read-account.md), [Reader 1 proposal](reader-1-proposal.md), [Reader 2 account](reader-2-read-account.md), and [Reader 2 proposal](reader-2-proposal.md) preserve their authored reports. Available saved receipts are archived individually. Reader 1 receipts preserve selected exec return objects, including broad-search metadata; reader 2 receipts preserve two source/search excerpts. The first reader has uncaptured initial returns, and neither record supplies a complete inspected session transcript. [Receipt summary](read-receipt-summary.json) counts only saved output fields and reported metadata, not actual complete model context. Repeated reads and incomplete broad-search closure remain explicit. Postwalk source/checkout/head verification at `39248011df2320274c9d8d53078b887716e49fde` finds zero drift across all 190 frozen files. The walks bind that exact pre-consolidation snapshot, not the final head. The final two-paragraph consolidation retains all headings and link targets, as final-head-audit.json verifies; required reading routes stay identical. No fresh walk or current-head full-protocol pass is claimed.

No token-saving, complete external-workflow or full-session-closure claim is made. Required observations preserve repeated reads, truncation, failures and incomplete closure where observed.

## Earlier Validation Runs

Earlier full-suite logs remain execution history. The first run reports 932 tests and one expected skip; later pre-final runs report 933 tests and one expected skip. Source review edits overlapped those runs, so they are not final-head evidence. Only the accepted unchanged-source run and its literal-head binding establish the complete-suite snapshot result; final-head affected checks and the exact documentation delta are stated separately.

## Merged Revision

Task PR #1652 merges as `633d0db9012e662f0234a433f2f406f551f26811`, tree `126194e3308cc164a88a30e5a30c2858a5755a28`. merged-source-audit.json verifies all 190 final-source hashes against that merge and confirms the unit checkout is clean. The fresh installed checker executes after the merge on the identical unit tree and reports 58 files checked, zero findings in merged-installed-check.log.

Only W08 Done and AC8 are ticked in the epic update. Draft #1641 includes its task reference and model activation; the final sync reports only the unmerged base/draft integration. The exact board item reads In Progress. handoff.md supplies the coordinator's Task Merge step 4 continuation; no integration readiness, closure or successor is claimed.

## Change List

Applied: none.

Held: none.
