# Candidate dispositions

Every one of the 95 reconciled candidates has an implementation disposition. 93 retained proposals are applied to the corpus; PD-12 and PD-20 were rejected in reconciliation and leave their principles standing. Related proposals share a repair, so a candidate may land in the same commit as its neighbours, and one may span two commits where it touches entries in different slices.

## Commits

Corpus branch `workflow/technique-vocabulary`, from `e70b44778f71d9d699f746f78a16b892531c82d3`.

| Commit | Subject |
| --- | --- |
| `14e34984` | Key the declaration and completion entries on their owning construct |
| `95302811` | Compare rules across the delivered set, and reach every worker that holds one |
| `c598b4b8` | Hold the evidence a verdict rests on, and bind enforcement to it |
| `ad537491` | Carry shared work on the run's binding sites |
| `39427071` | Resolve a contract before judging what reaches its reader |
| `70c09915` | Judge a call, a relocation and an output against evidence that reaches them |
| `fb8ef765` | State the principles as boundaries an observer can decide |
| `7c9f75e9` | Give each catalog defect one entry, and number the catalog by file order |
| `67c48725` | Key the runtime-rule entry on restatement rather than subject matter |

[verify_applied.py](verify_applied.py) holds each retained recommendation to an entry in its scope that differs from the reviewed revision. Its first run found AE-21 unevidenced: `c598b4b8` named it and did not carry it, and `67c48725` applies it. A commit message is a claim; this check is the evidence.

## Shared repairs

- **AS-09, AS-10 and AE-01 and AE-03** all prescribe a `worker-rule-reach` Fix. One Fix carries every part: the contract its reader's delivery includes, the named `workflow.rules.activity` bucket, the derived copy with a recorded source, and the delivered obligation standing until replacement reach is verified. `no-duplicated-guidance` carries the matching carve-out and the condition under which a pointer replaces text.
- **AE-08 and AE-17** both prescribe a `structure-backed-constraints` repair. Its Detect names the requirement owner whose breach invalidates the result; its Fix is the verifier checking named evidence, with `enforce-output-discipline` carrying the same verifier at a workflow boundary.
- **AS-18, AE-26 and PD-07** retire Protocol-to-Protocol work invocation together: `canonical-technique-reference` binds the wrapper at a run binding site, `apply-omits-declared-input` checks required inputs at those sites, `bind-site-is-orchestration-truth` drops its sibling-Apply exception, and `Bind Sibling Techniques as Steps` states the rule.
- **AS-07 and AC-02 and AC-12** divide the input contract: `technique-inputs-declared` owns the effective signature, `bind-protocol-locals` owns the local producer, and `declared-input-never-read` owns semantic use.
- **AS-14 and AE-27** route artifact declarations through the one-filename grammar that `artifact-name-is-filename` owns.
- **AS-03** separates the interim commit from the completion claim; **AE-09** then splits format literacy from the checks a commit records, so `validate-committed-bytes` owns the commit obligation.

## Structural changes

`AP-XX` is file order, so the four consolidating candidates landed together in `7c9f75e9` and renumbered the catalog from 161 entries to 159.

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
| AS-01 | Confirmed | correction | P2 | AP-01, AP-17, DP-22 | `14e34984` |
| AS-02 | Confirmed | improvement | P3 | AP-02, AP-118 | `14e34984` |
| AS-03 | Confirmed | correction | P1 | AP-03, AP-07, AP-81, DP-03 | `14e34984` |
| AS-04 | Confirmed | correction | P2 | AP-04, DP-07 | `14e34984` |
| AS-05 | Narrowed | improvement | P2 | AP-09, AP-11, DP-26, DP-31 | `14e34984` |
| AS-06 | Confirmed | correction | P2 | AP-10, AP-104, AP-15 | `14e34984` |
| AS-07 | Narrowed | correction | P2 | AP-148, AP-16, AP-62, DP-13 | `14e34984` |
| AS-08 | Confirmed | correction | P1 | AP-133, AP-20, AP-24, DP-27 | `95302811` |
| AS-09 | Confirmed | correction | P1 | AP-22, AP-23, AP-74, DP-06 | `95302811` |
| AS-10 | Confirmed | correction | P1 | AP-23, AP-30, AP-37, AP-69 | `95302811` |
| AS-11 | Confirmed | improvement | P3 | AP-25, AP-59, AP-60 | `7c9f75e9` |
| AS-12 | Narrowed | improvement | P2 | AP-135, AP-152, AP-26 | `95302811` |
| AS-13 | Confirmed | improvement | P3 | AP-29, DP-08 | `95302811` |
| AS-14 | Confirmed | correction | P1 | AP-130, AP-31, AP-44 | `95302811` |
| AS-15 | Confirmed | correction | P2 | AP-32 | `95302811` |
| AS-16 | Confirmed | correction | P2 | AP-39 | `95302811` |
| AS-17 | Confirmed | improvement | P3 | AP-43, AP-44, AP-66 | `7c9f75e9` |
| AS-18 | Confirmed | correction | P1 | AP-114, AP-157, AP-51, DP-25 | `95302811` |
| AS-19 | Narrowed | improvement | P2 | AP-145, AP-53, DP-36 | `95302811` |
| AS-20 | Confirmed | improvement | P2 | AP-148, AP-55 | `95302811` |
| AS-21 | Narrowed | correction | P2 | AP-108, AP-59, DP-31 | `95302811` |
| AS-22 | Confirmed | correction | P2 | AP-10, AP-68, DP-20 | `95302811` |
| AS-23 | Confirmed | improvement | P2 | AP-04, AP-06, AP-07 | `95302811` |
| AS-24 | Confirmed | improvement | P3 | AP-144, AP-48, AP-54 | `95302811` |
| AE-01 | Confirmed | correction | P1 | AP-23, AP-37, AP-69 | `c598b4b8` |
| AE-02 | Confirmed | correction | P2 | AP-70 | `c598b4b8` |
| AE-03 | Confirmed | correction | P1 | AP-23, AP-74, DP-06 | `c598b4b8` |
| AE-04 | Confirmed | improvement | P3 | AP-72 | `c598b4b8` |
| AE-05 | Narrowed | improvement | P2 | AP-75 | `c598b4b8` |
| AE-06 | Confirmed | correction | P1 | AP-76 | `c598b4b8` |
| AE-07 | Confirmed | improvement | P2 | AP-77, DP-08 | `c598b4b8` |
| AE-08 | Confirmed | correction | P1 | AP-79, DP-09 | `c598b4b8` |
| AE-09 | Confirmed | improvement | P3 | AP-81 | `7c9f75e9` |
| AE-10 | Narrowed | correction | P2 | AP-84, AP-93 | `c598b4b8` |
| AE-11 | Confirmed | correction | P1 | AP-86 | `c598b4b8` |
| AE-12 | Confirmed | improvement | P2 | AP-87 | `c598b4b8` |
| AE-13 | Narrowed | correction | P1 | AP-88, AP-89 | `c598b4b8` |
| AE-14 | Narrowed | improvement | P3 | AP-90 | `c598b4b8` |
| AE-15 | Confirmed | correction | P1 | AP-91 | `c598b4b8` |
| AE-16 | Confirmed | correction | P1 | AP-104, AP-113, AP-68, AP-92 | `c598b4b8`, `ad537491` |
| AE-17 | Confirmed | correction | P1 | AP-79, AP-95 | `c598b4b8` |
| AE-18 | Confirmed | correction | P2 | AP-96 | `c598b4b8` |
| AE-19 | Confirmed | improvement | P3 | AP-97 | `c598b4b8` |
| AE-20 | Confirmed | improvement | P2 | AP-98 | `c598b4b8` |
| AE-21 | Narrowed | improvement | P2 | AP-100 | `67c48725` |
| AE-22 | Narrowed | improvement | P3 | AP-102, AP-105 | `7c9f75e9` |
| AE-23 | Narrowed | improvement | P2 | AP-108, DP-15 | `ad537491` |
| AE-24 | Confirmed | correction | P2 | AP-109, AP-138 | `ad537491` |
| AE-25 | Confirmed | correction | P1 | AP-110, DP-18 | `ad537491` |
| AE-26 | Narrowed | correction | P1 | AP-107, AP-114, AP-141, AP-51, DP-25 | `ad537491` |
| AE-27 | Confirmed | correction | P2 | AP-116, AP-130, DP-28 | `ad537491` |
| AE-28 | Confirmed | correction | P2 | AP-121, AP-143 | `ad537491` |
| AC-01 | Confirmed | correction | P1 | AP-124 | `39427071` |
| AC-02 | Confirmed | correction | P1 | AP-125, AP-140, AP-141 | `39427071` |
| AC-03 | Narrowed | correction | P1 | AP-136, AP-144 | `39427071` |
| AC-04 | Narrowed | improvement | P2 | AP-127 | `39427071` |
| AC-05 | Confirmed | correction | P1 | AP-128 | `39427071` |
| AC-06 | Confirmed | improvement | P3 | AP-131 | `39427071` |
| AC-07 | Narrowed | improvement | P3 | AP-133 | `39427071` |
| AC-08 | Confirmed | correction | P2 | AP-134 | `39427071` |
| AC-09 | Narrowed | correction | P2 | AP-135 | `39427071` |
| AC-10 | Narrowed | correction | P2 | AP-137, AP-158 | `39427071` |
| AC-11 | Narrowed | improvement | P2 | AP-138 | `70c09915` |
| AC-12 | Confirmed | correction | P1 | AP-140 | `39427071` |
| AC-13 | Confirmed | improvement | P2 | AP-143 | `70c09915` |
| AC-14 | Narrowed | improvement | P3 | AP-146 | `70c09915` |
| AC-15 | Narrowed | correction | P1 | AP-148 | `70c09915` |
| AC-16 | Confirmed | improvement | P3 | AP-149 | `70c09915` |
| AC-17 | Confirmed | improvement | P2 | AP-154, AP-155 | `70c09915` |
| AC-18 | Confirmed | correction | P2 | AP-155 | `70c09915` |
| AC-19 | Confirmed | correction | P1 | AP-160 | `70c09915` |
| AC-20 | Confirmed | correction | P1 | AP-161 | `70c09915` |
| AC-21 | Narrowed | improvement | P3 | MR-01 | `70c09915` |
| AC-22 | Confirmed | improvement | P2 | AP-129 | `39427071` |
| AC-23 | Confirmed | correction | P1 | AP-139 | `39427071` |
| PD-01 | Narrowed | improvement | P3 | DP-03 | `fb8ef765` |
| PD-02 | Narrowed | correction | P2 | DP-04 | `fb8ef765` |
| PD-03 | Narrowed | improvement | P2 | DP-06, DP-29, DP-36 | `fb8ef765` |
| PD-04 | Narrowed | improvement | P2 | DP-08, DP-10 | `fb8ef765` |
| PD-05 | Narrowed | improvement | P2 | DP-09 | `fb8ef765` |
| PD-06 | Confirmed | correction | P2 | AP-84, DP-12 | `fb8ef765` |
| PD-07 | Narrowed | correction | P2 | AP-114, AP-51, DP-16, DP-25, DP-42 | `fb8ef765` |
| PD-08 | Confirmed | improvement | P2 | AP-110, DP-18 | `fb8ef765` |
| PD-09 | Narrowed | improvement | P3 | DP-19 | `fb8ef765` |
| PD-10 | Confirmed | correction | P2 | AP-01, DP-22 | `fb8ef765` |
| PD-11 | Narrowed | improvement | P3 | AP-113, DP-24 | `fb8ef765` |
| PD-12 | Rejected | no change | — | AP-158, DP-26, DP-42 | no corpus change |
| PD-13 | Narrowed | improvement | P3 | AP-116, DP-28 | `fb8ef765` |
| PD-14 | Narrowed | correction | P2 | AP-134, DP-32, DP-44 | `fb8ef765` |
| PD-15 | Confirmed | improvement | P3 | DP-35 | `fb8ef765` |
| PD-16 | Confirmed | correction | P3 | DP-39 | `fb8ef765` |
| PD-17 | Narrowed | improvement | P2 | AP-161, DP-41 | `fb8ef765` |
| PD-18 | Narrowed | improvement | P3 | DP-18, DP-43 | `fb8ef765` |
| PD-19 | Narrowed | improvement | P3 | DP-46 | `fb8ef765` |
| PD-20 | Rejected | no change | — | DP-34, DP-47 | no corpus change |
