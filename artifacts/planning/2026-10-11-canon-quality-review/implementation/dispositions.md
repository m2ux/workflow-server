# Candidate dispositions

Every one of the 95 reconciled candidates has an implementation disposition. 93 retained proposals are applied to the corpus; PD-12 and PD-20 were rejected in reconciliation and leave their principles standing. Related proposals share a repair, so a candidate may land in the same commit as its neighbours, and one may span two commits where it touches entries in different slices.

## Commits

Corpus branch `workflow/technique-vocabulary`, from `e70b44778f71d9d699f746f78a16b892531c82d3`.

| Commit | Subject |
| --- | --- |
| `19b2ee0a` | Key the declaration and completion entries on their owning construct |
| `787f82e2` | Compare rules across the delivered set, and reach every worker that holds one |
| `9ea3be34` | Hold the evidence a verdict rests on, and bind enforcement to it |
| `8a19f735` | Carry shared work on the run's binding sites |
| `df2643ef` | Resolve a contract before judging what reaches its reader |
| `7f005bb5` | Judge a call, a relocation and an output against evidence that reaches them |
| `5a73004a` | State the principles as boundaries an observer can decide |
| `4d333ca0` | Give each catalog defect one entry, and number the catalog by file order |
| `65be29e4` | Key the runtime-rule entry on restatement rather than subject matter |

[verify_applied.py](verify_applied.py) holds each retained recommendation to an entry in its scope that differs from the reviewed revision. Its first run found AE-21 unevidenced: `9ea3be34` named it and did not carry it, and `65be29e4` applies it. A commit message is a claim; this check is the evidence.

## Shared repairs

- **AS-09, AS-10 and AE-01 and AE-03** all prescribe a `worker-rule-reach` Fix. One Fix carries every part: the contract its reader's delivery includes, the named `workflow.rules.activity` bucket, the derived copy with a recorded source, and the delivered obligation standing until replacement reach is verified. `no-duplicated-guidance` carries the matching carve-out and the condition under which a pointer replaces text.
- **AE-08 and AE-17** both prescribe a `structure-backed-constraints` repair. Its Detect names the requirement owner whose breach invalidates the result; its Fix is the verifier checking named evidence, with `enforce-output-discipline` carrying the same verifier at a workflow boundary.
- **AS-18, AE-26 and PD-07** retire Protocol-to-Protocol work invocation together: `canonical-technique-reference` binds the wrapper at a run binding site, `apply-omits-declared-input` checks required inputs at those sites, `bind-site-is-orchestration-truth` drops its sibling-Apply exception, and `Bind Sibling Techniques as Steps` states the rule.
- **AS-07 and AC-02 and AC-12** divide the input contract: `technique-inputs-declared` owns the effective signature, `bind-protocol-locals` owns the local producer, and `declared-input-never-read` owns semantic use.
- **AS-14 and AE-27** route artifact declarations through the one-filename grammar that `artifact-name-is-filename` owns.
- **AS-03** separates the interim commit from the completion claim; **AE-09** then splits format literacy from the checks a commit records, so `validate-committed-bytes` owns the commit obligation.

## Structural changes

`AP-XX` is file order, so the four consolidating candidates landed together in `4d333ca0` and renumbered the catalog from 161 entries to 159.

| Candidate | Change |
| --- | --- |
| AS-11 | `local-rule-as-note` retired; `no-one-step-rules` owns a Rules entry scoped to one Protocol instruction, and `constraint-as-blockquote` owns the note form. |
| AS-17 | `artifact-name-in-io` retired; `canonical-artifact-ids` owns Protocol artifact references, `io-id-shape` owns identifier shape. The filename-declaration exception and the opaque-collection distinction are preserved. |
| AE-22 | `no-shadow-audit-pass` retired into `no-technique-resource-dual-home`, which keeps the carve-out for several passes applying one authoritative home. |
| AE-09 | `verify-format-literacy` split, adding `validate-committed-bytes`. |

Citations are by kebab name, so no citation of a surviving entry changed. The 29 anchors in `schema-construct-inventory.md` and the one in `reconcile-design-assumptions.md` were repointed by [renumber.py](renumber.py), which keys on the stable entry name rather than the old number.

## Rejected

| Candidate | Entries | Outcome |
| --- | --- | --- |
| PD-12 | DP-26, DP-42, AP-158 | `A Technique Is a Reading` stands. Its concrete qualitative contributions are already observable; the metaphor does not make them otherwise. |
| PD-20 | DP-34, DP-47 | `A Calibrated Surface Extends by Wrapping` stands. It concerns consumer extensions, so a defective shared-owner example demonstrates no conflict. |

## Every candidate

| Candidate | Disposition | Kind | Priority | Reviewed entries | Landed in |
| --- | --- | --- | --- | --- | --- |
| AS-01 | Confirmed | correction | P2 | AP-01, AP-17, DP-22 | `19b2ee0a` |
| AS-02 | Confirmed | improvement | P3 | AP-02, AP-118 | `19b2ee0a` |
| AS-03 | Confirmed | correction | P1 | AP-03, AP-07, AP-81, DP-03 | `19b2ee0a` |
| AS-04 | Confirmed | correction | P2 | AP-04, DP-07 | `19b2ee0a` |
| AS-05 | Narrowed | improvement | P2 | AP-09, AP-11, DP-26, DP-31 | `19b2ee0a` |
| AS-06 | Confirmed | correction | P2 | AP-10, AP-104, AP-15 | `19b2ee0a` |
| AS-07 | Narrowed | correction | P2 | AP-148, AP-16, AP-62, DP-13 | `19b2ee0a` |
| AS-08 | Confirmed | correction | P1 | AP-133, AP-20, AP-24, DP-27 | `787f82e2` |
| AS-09 | Confirmed | correction | P1 | AP-22, AP-23, AP-74, DP-06 | `787f82e2` |
| AS-10 | Confirmed | correction | P1 | AP-23, AP-30, AP-37, AP-69 | `787f82e2` |
| AS-11 | Confirmed | improvement | P3 | AP-25, AP-59, AP-60 | `4d333ca0` |
| AS-12 | Narrowed | improvement | P2 | AP-135, AP-152, AP-26 | `787f82e2` |
| AS-13 | Confirmed | improvement | P3 | AP-29, DP-08 | `787f82e2` |
| AS-14 | Confirmed | correction | P1 | AP-130, AP-31, AP-44 | `787f82e2` |
| AS-15 | Confirmed | correction | P2 | AP-32 | `787f82e2` |
| AS-16 | Confirmed | correction | P2 | AP-39 | `787f82e2` |
| AS-17 | Confirmed | improvement | P3 | AP-43, AP-44, AP-66 | `4d333ca0` |
| AS-18 | Confirmed | correction | P1 | AP-114, AP-157, AP-51, DP-25 | `787f82e2` |
| AS-19 | Narrowed | improvement | P2 | AP-145, AP-53, DP-36 | `787f82e2` |
| AS-20 | Confirmed | improvement | P2 | AP-148, AP-55 | `787f82e2` |
| AS-21 | Narrowed | correction | P2 | AP-108, AP-59, DP-31 | `787f82e2` |
| AS-22 | Confirmed | correction | P2 | AP-10, AP-68, DP-20 | `787f82e2` |
| AS-23 | Confirmed | improvement | P2 | AP-04, AP-06, AP-07 | `787f82e2` |
| AS-24 | Confirmed | improvement | P3 | AP-144, AP-48, AP-54 | `787f82e2` |
| AE-01 | Confirmed | correction | P1 | AP-23, AP-37, AP-69 | `9ea3be34` |
| AE-02 | Confirmed | correction | P2 | AP-70 | `9ea3be34` |
| AE-03 | Confirmed | correction | P1 | AP-23, AP-74, DP-06 | `9ea3be34` |
| AE-04 | Confirmed | improvement | P3 | AP-72 | `9ea3be34` |
| AE-05 | Narrowed | improvement | P2 | AP-75 | `9ea3be34` |
| AE-06 | Confirmed | correction | P1 | AP-76 | `9ea3be34` |
| AE-07 | Confirmed | improvement | P2 | AP-77, DP-08 | `9ea3be34` |
| AE-08 | Confirmed | correction | P1 | AP-79, DP-09 | `9ea3be34` |
| AE-09 | Confirmed | improvement | P3 | AP-81 | `4d333ca0` |
| AE-10 | Narrowed | correction | P2 | AP-84, AP-93 | `9ea3be34` |
| AE-11 | Confirmed | correction | P1 | AP-86 | `9ea3be34` |
| AE-12 | Confirmed | improvement | P2 | AP-87 | `9ea3be34` |
| AE-13 | Narrowed | correction | P1 | AP-88, AP-89 | `9ea3be34` |
| AE-14 | Narrowed | improvement | P3 | AP-90 | `9ea3be34` |
| AE-15 | Confirmed | correction | P1 | AP-91 | `9ea3be34` |
| AE-16 | Confirmed | correction | P1 | AP-104, AP-113, AP-68, AP-92 | `9ea3be34`, `8a19f735` |
| AE-17 | Confirmed | correction | P1 | AP-79, AP-95 | `9ea3be34` |
| AE-18 | Confirmed | correction | P2 | AP-96 | `9ea3be34` |
| AE-19 | Confirmed | improvement | P3 | AP-97 | `9ea3be34` |
| AE-20 | Confirmed | improvement | P2 | AP-98 | `9ea3be34` |
| AE-21 | Narrowed | improvement | P2 | AP-100 | `65be29e4` |
| AE-22 | Narrowed | improvement | P3 | AP-102, AP-105 | `4d333ca0` |
| AE-23 | Narrowed | improvement | P2 | AP-108, DP-15 | `8a19f735` |
| AE-24 | Confirmed | correction | P2 | AP-109, AP-138 | `8a19f735` |
| AE-25 | Confirmed | correction | P1 | AP-110, DP-18 | `8a19f735` |
| AE-26 | Narrowed | correction | P1 | AP-107, AP-114, AP-141, AP-51, DP-25 | `8a19f735` |
| AE-27 | Confirmed | correction | P2 | AP-116, AP-130, DP-28 | `8a19f735` |
| AE-28 | Confirmed | correction | P2 | AP-121, AP-143 | `8a19f735` |
| AC-01 | Confirmed | correction | P1 | AP-124 | `df2643ef` |
| AC-02 | Confirmed | correction | P1 | AP-125, AP-140, AP-141 | `df2643ef` |
| AC-03 | Narrowed | correction | P1 | AP-136, AP-144 | `df2643ef` |
| AC-04 | Narrowed | improvement | P2 | AP-127 | `df2643ef` |
| AC-05 | Confirmed | correction | P1 | AP-128 | `df2643ef` |
| AC-06 | Confirmed | improvement | P3 | AP-131 | `df2643ef` |
| AC-07 | Narrowed | improvement | P3 | AP-133 | `df2643ef` |
| AC-08 | Confirmed | correction | P2 | AP-134 | `df2643ef` |
| AC-09 | Narrowed | correction | P2 | AP-135 | `df2643ef` |
| AC-10 | Narrowed | correction | P2 | AP-137, AP-158 | `df2643ef` |
| AC-11 | Narrowed | improvement | P2 | AP-138 | `7f005bb5` |
| AC-12 | Confirmed | correction | P1 | AP-140 | `df2643ef` |
| AC-13 | Confirmed | improvement | P2 | AP-143 | `7f005bb5` |
| AC-14 | Narrowed | improvement | P3 | AP-146 | `7f005bb5` |
| AC-15 | Narrowed | correction | P1 | AP-148 | `7f005bb5` |
| AC-16 | Confirmed | improvement | P3 | AP-149 | `7f005bb5` |
| AC-17 | Confirmed | improvement | P2 | AP-154, AP-155 | `7f005bb5` |
| AC-18 | Confirmed | correction | P2 | AP-155 | `7f005bb5` |
| AC-19 | Confirmed | correction | P1 | AP-160 | `7f005bb5` |
| AC-20 | Confirmed | correction | P1 | AP-161 | `7f005bb5` |
| AC-21 | Narrowed | improvement | P3 | MR-01 | `7f005bb5` |
| AC-22 | Confirmed | improvement | P2 | AP-129 | `df2643ef` |
| AC-23 | Confirmed | correction | P1 | AP-139 | `df2643ef` |
| PD-01 | Narrowed | improvement | P3 | DP-03 | `5a73004a` |
| PD-02 | Narrowed | correction | P2 | DP-04 | `5a73004a` |
| PD-03 | Narrowed | improvement | P2 | DP-06, DP-29, DP-36 | `5a73004a` |
| PD-04 | Narrowed | improvement | P2 | DP-08, DP-10 | `5a73004a` |
| PD-05 | Narrowed | improvement | P2 | DP-09 | `5a73004a` |
| PD-06 | Confirmed | correction | P2 | AP-84, DP-12 | `5a73004a` |
| PD-07 | Narrowed | correction | P2 | AP-114, AP-51, DP-16, DP-25, DP-42 | `5a73004a` |
| PD-08 | Confirmed | improvement | P2 | AP-110, DP-18 | `5a73004a` |
| PD-09 | Narrowed | improvement | P3 | DP-19 | `5a73004a` |
| PD-10 | Confirmed | correction | P2 | AP-01, DP-22 | `5a73004a` |
| PD-11 | Narrowed | improvement | P3 | AP-113, DP-24 | `5a73004a` |
| PD-12 | Rejected | no change | — | AP-158, DP-26, DP-42 | no corpus change |
| PD-13 | Narrowed | improvement | P3 | AP-116, DP-28 | `5a73004a` |
| PD-14 | Narrowed | correction | P2 | AP-134, DP-32, DP-44 | `5a73004a` |
| PD-15 | Confirmed | improvement | P3 | DP-35 | `5a73004a` |
| PD-16 | Confirmed | correction | P3 | DP-39 | `5a73004a` |
| PD-17 | Narrowed | improvement | P2 | AP-161, DP-41 | `5a73004a` |
| PD-18 | Narrowed | improvement | P3 | DP-18, DP-43 | `5a73004a` |
| PD-19 | Narrowed | improvement | P3 | DP-46 | `5a73004a` |
| PD-20 | Rejected | no change | — | DP-34, DP-47 | no corpus change |
