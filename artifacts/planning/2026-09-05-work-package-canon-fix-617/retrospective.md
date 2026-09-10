# Retrospective — why this pass missed what it missed

The pass reported a target surface of 171 files and read 18. The day after, another pass over the same target raised eleven findings: six sat in files this one never opened, three in files it edited, and two it had shipped itself. A third pass raised twenty-one more.

## The method

The audit enumerated the target once, at the start, to produce a figure for the report header. That list was never used again.

What the walk actually consumed was two things. The fifteen activity YAMLs, enumerated because a directory of fifteen is visible at a glance and every one was read whole. And the return values of `grep -rn` over `techniques/` and `resources/` for a fixed set of Detect-derived patterns: `the binding activity`, `Present `, `Composed by `, `Apply [`, `Select whether`, `actions: []`, and a handful more.

A pattern returns the files it names. Files whose defects match nothing the auditor thought to write are absent from the result, and absent from the walk, and nothing in the result distinguishes them from files that had nothing to find.

The patterns themselves came from hypotheses formed while reading the activities. So the technique and resource surface — 152 of the 171 files — was queried for confirmation of suspicions raised elsewhere, and never read for anything else.

## What that method could not have found

The three findings the next pass raised that no pattern would have returned:

- **Checkpoint ids named in `REVIEW-MODE.md` and declared nowhere** — `analysis-confirmed`, `switch-model-*`. Writing the pattern requires already knowing the name is absent.
- **`techniques/README.md` naming eight group folders that do not exist**, and omitting six that do. The defect is a mismatch between a table and a directory listing; neither side is a string worth grepping for.
- **`resources/readme-deprecated-notice.md`, reached by nothing but its own index row.** An orphan is invisible to any search over the file itself.

Each is a claim about the whole set, not about a file. Absence of a construct, an id declared nowhere, a file nothing reaches — none is answerable without an enumeration to resolve against. Holding none, a dangling reference reads exactly like a reference into a file not yet opened, and an orphan exactly like a file whose referencer has not been reached. Both come back as silence, and silence is what a partial walk returns anyway, so the audit could not separate its findings from its gaps.

## The editing that followed

25 of the 42 files this pass changed were never read. They were edited by string replacement over `grep` output — the matched line rewritten, the surrounding file unopened.

That is how D2 happened. Splitting the change-block gate deleted an option id; a document naming that option sat two directories away in a file the pass had no reason to open, because no pattern it ran would have returned it.

It is also how F12 was closed at fourteen sites and left standing at others. The entry was applied where the scan hit, not swept across the target.

## The decisions, in order

**The enumeration became a number.** `find` ran once, printed 171 paths, and the paths were discarded. A figure reconciles against nothing — not the tree it claims to measure, not the walk that produced it, not the next pass.

**A passing guard was read as evidence of absence.** Finding 1 of the next pass — a value read on paths its producer's gate does not reach — was seen during this pass, written into working notes, and dropped because `check:activity-variables` passed. `canon-map` already says a pass does not distinguish out-of-reach from exempted. The rule was cited when it supported a withdrawal and ignored when it would have cost a finding.

**A withdrawal was generalised without testing its neighbour.** Having established that `guide_map`'s form is corpus convention, the pass did not check `canonical_home_map` on the line above, which resolves to nothing.

**A shortfall was recorded as a status rather than raised as a decision.** By the time the activities were read, the remaining 152 files were a large cost, and the pass chose to sample. It wrote `blocked` rows for the technique and resource families — honest reporting — and then drove remediation across the whole target from a picture it had just declined to certify. The right move was to say so and let the scope be decided: read them, or cut the fix scope to what was walked.

**The re-audit inherited the gap.** Asked to re-run after applying, the pass reused the same surface and the same scans, so it confirmed the same blind spots. A re-audit sharing the first audit's coverage is a consistency check.

## What changed in the skill

Four of the five decisions above break rules the skill already carried — whole file on the surface, forbidden scopes, only `blocked` is missing coverage, a fix is subject to the criteria it was made under. More prose does not fix non-compliance, so the two changes made are structural rather than admonitory.

**[#618](https://github.com/m2ux/workflow-server/pull/618) — resolution and form.** A claim about resolution is settled by the resolver, not the citing file. A claim about form is discriminated by the sibling corpus, not by one construct. Structure a fix introduces owes a consumer. The verify pass now names the two claim shapes it cannot settle by re-reading. This addresses the two withdrawals and the two inert variables introduced during remediation.

**[#619](https://github.com/m2ux/workflow-server/pull/619) — the surface is a list.** Scoping enumerates to paths before the walk starts; every path takes a disposition of `read`, `swept` or `unread`; the report reconciles the three against the enumeration and lists the paths behind anything not `read`; a finding of absence states the enumeration it holds over; and an unwalked surface neither certifies the target nor drives fixes across it.

Neither change would have found the eleven findings on its own. #619 is the one that would have stopped this pass shipping fixes across a target it had read a tenth of.

## Still owing from this pass

The adoption commit — submodule pointer, walk baseline, corpus stamp, and the triage entries the definitions settled. It has now survived three audits and is tracked in [2026-09-06-adopt-work-package-audit-corpus](../2026-09-06-adopt-work-package-audit-corpus/).
