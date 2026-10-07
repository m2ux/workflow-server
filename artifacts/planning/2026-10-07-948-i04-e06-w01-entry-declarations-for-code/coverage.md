# Coverage — AC1, AC2 and AC3

The three criteria W01's Coverage names, the test that observes each, the runs that show it, and the places a declaration rests on something no test reaches.

## The specified set

| Criterion | Statement | Observed by |
| --- | --- | --- |
| **AC1** | Every list-returning code-graph operation with a fixed entry shape declares its entry fields. | `tests/gitnexus-entry-declarations.test.ts` — the roster runs: the scan's operation set against the roster, entry fields found on every operation the roster says declares them, and none on one it settled out. Partial: see [what the runs do not reach](#what-the-runs-do-not-reach). |
| **AC2** | Every declared entry field is one the operation's response from an indexed graph carries. | `tests/gitnexus-entry-declarations.test.ts` — one case per settled operation, parsing the response recorded in `tests/fixtures/gitnexus-entry-shapes.json` and holding the technique's declared fields to the keys one entry of it carries. Partial: see below. |
| **AC3** | The binding check reports no step read of a list entry field its declaration lacks. | `tests/gitnexus-entry-declarations.test.ts` — `collectViolations()` over the corpus, filtered to the `entry-field-undeclared` family and asserted empty. |

## What the runs show

**The suite observes the change rather than passing either way.** Pointed at a corpus worktree carrying the declarations it reports `16 passed`; pointed at the unedited integration branch it reports `5 failed | 11 passed`, the failures naming `read-cluster`, `rename`, `heading-search` and `route-map` as operations declaring no entry fields:

```text
WORKFLOWS_DIR=<edited corpus>  npx vitest run tests/gitnexus-entry-declarations.test.ts
→ Test Files 1 passed (1) · Tests 16 passed (16)

WORKFLOWS_DIR=<i04/workflows 860e107b>  npx vitest run tests/gitnexus-entry-declarations.test.ts
→ Test Files 1 failed (1) · Tests 5 failed | 11 passed (16)
```

The eleven that pass against the base are the three operations that already declared their entries, the settled-out set, the roster scan, and the fixture's own runs — each of which is a claim the declarations do not change.

**AC2 is settled against a parsed response, not a transcription.** Each case reads the entry keys out of the recorded answer — `JSON.parse` for a tool result, the YAML parser for a resource read, the header row for a table-shaped answer — and asserts the declared set is a subset of them. A fixture whose response rotted into something with no entry in it fails the first describe block rather than passing the second vacuously.

**AC3's instrument is the binding check.** `collectViolations()` over the corpus reports no `entry-field-undeclared` finding, before this change and after it. The family was empty before because four of the operations declared nothing for it to measure; it is empty after because the fields now declared are the ones the corpus's loops read. What the declarations change is the check's reach, not its count, and the family's fixture cases in `tests/binding-fidelity.test.ts` are what show it still fires.

**No guard was turned red.** `check:all` over the unedited base and over the edited corpus report the same `58 guard(s) — 53 pass, 5 fail, 0 unmeasured`, the five failures identical in both and each the subject of other work. `check-binding-fidelity` reports the same `59 violation(s) — 56 harmless, 0 fix-later, 0 live bug(s), 3 untriaged, 1 stale` either way, so the eight edited definitions add no violation in any family. `npm run typecheck` is clean.

**The whole suite.** `vitest run` against the edited corpus reports `8 failed | 2403 passed`; against the unedited base, `13 failed | 2398 passed`. The difference is this task's five runs turning over, and the eight that remain in both are snapshots the corpus branch and the server tree disagree on until they merge.

**The engine half is red until the corpus half merges.** Five of the sixteen runs assert what the declarations say, so against `i04/main` alone — whose corpus checkout is the unedited integration branch — they fail. They are not weakened to pass: the pull requests state the merge order, corpus first, and `WORKFLOWS_DIR` points the suite at a corpus worktree to verify ahead of it.

## What the runs do not reach

A passing suite is evidence for AC1 and AC2 only as far as the instrument reaches, and these are the places where a declaration rests on something else. They are named here rather than left for the green run to stand for.

- **One declared entry is settled against a composition, not a response.**
  `list-group-members` declares `name`, `tree_path` and `is_home` on `group_members`, and no response carries an entry with those three keys: `name` is a key of the `repos` mapping `gitnexus_group_list` answers, `tree_path` is the `path` of the matching `gitnexus_list_repos` entry, and `is_home` is the technique's own comparison against its `{home_repo}` input. The roster run holds it to declaring entry fields; nothing holds those three names to an answer, because the entry is the technique's construction. It is the one place AC2 is met by reading the protocol rather than by parsing a response.
- **One entry's fields could not be settled at all.**
  `tool-map` answers `{ "tools": [], "total": 0, "message": … }` from every one of the eighteen indexed graphs reachable here. The report's shape is declared and settled; what one tool entry carries is not, and the component declares no entry fields — [unmeasured rather than wrong](https://github.com/m2ux/workflow-server/blob/1caa9ff5/guards/check-binding-fidelity.ts#L1189-L1191). A graph holding a tool node would settle it; none of the eighteen does.
- **A response is a sample of one graph, not of every graph.**
  Each field was read off one answer from one indexed graph. A key a different graph's answer omits — a `method` a route without one carries as null, a `module` a symbol outside any area has no value for — is absent from the sample and would still satisfy the declaration. The declarations state what an entry can carry; the responses show that it did, once.
- **Only the first entry of each response is read.**
  The runs take `Object.keys` of entry zero. An answer whose entries differ in shape — a definitions list where a file entry carries three keys and a symbol entry six — would be measured against the first alone. None of the six settled here is such a list, and `query`'s `definitions`, which is, declares its union and sits outside this subject.
- **"Which operations return a list" is a judgement the roster records, not one the scan derives.**
  The scan finds every technique whose protocol reaches the graph; which of them answer with a collection rather than a report is read off the Outputs section by hand and written into the roster. The run holds the roster exhaustive over the scan — a technique added later fails it until it is classified — but it cannot catch a technique classified into the wrong bucket.
- **An authored entry is outside the subject.**
  `extract-boundary-symbols`, `judge-group-reach`, `select-affected-clusters` and `select-stale-members` each declare an entry over a list they assemble from what an operation returned. There is no response to settle those against, and the roster classifies them as judgements rather than operations.
- **The check still only measures a loop.**
  `entry-field-undeclared` resolves a read through a `forEach` item back to the collection it iterates. A read off an entry reached another way — an index into the list, a member of a value a routine remapped — is outside the family however well the entry is declared.

## Not this task's criteria

AC4 and AC5 — each contract's declared value against the shape its filling operation publishes, and `check-operation-contract` reporting nothing against the corpus — belong to the task beside this one, and AC6 and AC7 to the one after. The eight definitions edited here are technique files, none of which that check reports on before or after.
