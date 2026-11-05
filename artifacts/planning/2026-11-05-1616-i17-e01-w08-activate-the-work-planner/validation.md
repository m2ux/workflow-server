# W08 Validation

## Source Identity

The starting tree is `dfb00380a58ab3346b77b7780424831b2a12fde2`. The accepted frozen manifest covers 190 tracked skill/checker/support files, SHA256 `4e5f8b9c2cff82b5776495b46dd6bcf751be73d752f2f8dcaf44ae50ec6ce600`. The final literal head is `39248011df2320274c9d8d53078b887716e49fde`, tree `0ef1fe916ec77c29aa6f679757aebf1d242fbc20`, recorded in literal-head.json, which compares every frozen file with both the committed blob and the actual checkout.

## Installed Model Check

The ordinary installed command is `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`. It selects the installed structure.json directly, with no model override or declaration cache: **58 files checked, zero findings**. The complete output is installed-check.log. Other skills and the shared guidelines retain their declarations and content; their findings are outside this unit.

## Work Planner Suite

The complete suite command is `scripts/sbx python3 -m unittest discover -s skills/work-planner/test`. The definitive final-source run is work-planner-tests.log: **933 tests total, 932 pass and one expected skip**, in 125.465 seconds. Its single expected skip is the opt-in live Development-link test: no live issue/draft-pull-request fixture is supplied. The unit has no task issue, and this skill-model change does not edit Development-link behavior.

The source readers retain operation Inputs/Outputs, consecutive heading steps, directed layer calls, direct prerequisites, script/import reach, fetched epic-base evidence, checkout vocabulary, transitive acting-operation detection, checkout propagation and literal exclusion. Three added controls expose missing installed command declarations or literal/unexecuted invocation leakage. Synthetic parser fixtures select their own declared model; actual Work Planner corpus reads select only the installed declaration.

## Shared Checker Suite

`scripts/sbx python3 -m unittest discover -s skills/test` passes **258 tests**. Its complete output is shared-checker-tests.log. Shared support for other declared models remains intact.

## Source and Head Audit

source-audit.json records the five-path scope and nonvacuous corpus measurements: 15 checkout-acting commands, 24 transitive acting operations, 1,508 execution links, 20 directly invoked scripts and 16 Record Epic Delivery calls. Import closure covers the remaining script modules in the Work Planner suite. Nineteen existing callable titles have two words, including Run Tests; their anchors and call sites are preserved.

Only guidelines.md, structure.json, rules.json, test/test_documents.py and test/test_checkouts.py differ from the starting tree. Every other tracked file is byte-identical, including entry frontmatter, execution payloads, prerequisites, templates, Lane placement and ownership. Shared guideline and other-skill files are byte-identical. The exact committed tree and 190-file freeze equality are recorded in literal-head.json. `git diff --check` reports no whitespace errors.

## Required Context and Disclosure

context-trace.md identifies the affected guideline consumers, prerequisite closure, local heading links and Revise's explicit whole-guideline path. The two independent fresh readers use the same neutral bounded request, frozen source and read-only authority. Both recover the complete required guidelines and prepare correct bounded proposals and appropriate unexecuted validation plans. Both also perform broad searches that load unrelated content and truncate; these are **Partial disclosure observations**, with failed exclusion and over-reading. Neither reader executes validation or edits source. Their proposed wording is a test result, remains unapplied, and is not an additional product request.

[Reader 1 account](reader-1-read-account.md), [Reader 1 proposal](reader-1-proposal.md), [Reader 2 account](reader-2-read-account.md), and [Reader 2 proposal](reader-2-proposal.md) preserve their authored reports. Available saved receipts are archived individually. Reader 1 receipts preserve selected exec return objects, including broad-search metadata; reader 2 receipts preserve two source/search excerpts. The first reader has uncaptured initial returns, and neither record supplies a complete inspected session transcript. [Receipt summary](read-receipt-summary.json) counts only saved output fields and reported metadata, not actual complete model context. Repeated reads and incomplete broad-search closure remain explicit. Postwalk source/checkout/head verification finds zero drift across all 190 frozen files.

No token-saving, complete external-workflow or full-session-closure claim is made. Required observations preserve repeated reads, truncation, failures and incomplete closure where observed.

## Earlier Validation Runs

Earlier full-suite logs remain execution history. The first run reports 932 tests and one expected skip; later pre-final runs report 933 tests and one expected skip. Source review edits overlapped those runs, so they are not final-head evidence. Only the accepted unchanged-source run and its literal-head binding establish the final full-suite result.

## Change List

Applied: none.

Held: none.
