# Prerequisite-index verification cycle

This record fixes the scenarios, acceptance rules and stopping condition before any worker launches. It is written and committed ahead of dispatch so the result cannot be read back onto the question.

## What changed

Skill commits `9f52a90d` and `7708825b` on `skill/canon-audit-matrices`. Sixteen command specifications now cite their prerequisites in reading order as numbered links, where eleven previously cited one and five cited none. `Run Project Check` gains a prerequisite it never carried; `Run Guard Suite` and `Run Guards on the Delta` replace an unlinked assertion that the caller supplies the conventions; `Run Corpus Checks` and `Run Option Coverage` gain the index. Check selection in `canon-context.md` becomes one bullet per condition in place of a 110-word prose line naming five routes.

Core audit tools, fixture criteria and semantic ledgers are unchanged. Static checks at these bytes pass: 230 local links, 35 audit tests, 36 edit-guard tests, three mode-summary tests.

## The question

The diagnosis holds that retrieval order failed for a structural reason: `Run Project Check` carried no prerequisite while its conventions sat 217 lines later in the file, and no audit command carrying a point-of-use index ever failed ordering across seven walks. This cycle tests whether supplying that index changes the observed order.

It does not target DA-05 whole-file over-reads, DA-06 memory-neighbourhood contamination or DA-07 missing instruction receipts. Those are agent-borne or host-borne, and a result touching them says nothing about this change.

## Prediction

Ordering holds in all four walks. Recorded before dispatch so a miss stays a miss.

## Scenarios

The four scenarios repeat the previous cycle's, so the two cycles differ in the skill revision rather than the task. Each worker starts fresh and receives its task, the skill root, candidate and checker locations, the paired engine, authority limits and an evidence destination.

| Walk | Scenario |
| --- | --- |
| Author one | An output contract changes while a consumer that binds it is not edited |
| Author two | A candidate changes after an earlier evaluation accepted results |
| Audit one | An unresolved binding concern on an existing definition |
| Audit two | A disputed exclusion in a settled applicability map |

No worker receives expected reading choices, prior failure notes, the content of this plan, or any statement that prerequisites or ordering are under test. Workers are read-only: no definition, audit state, skill file or Git state changes inside a walk.

## Acceptance

Two judgements are scored separately, because one rule conflating them is what made the previous results hard to act on.

- **Ordering, the targeted question.** For every operation whose specification cites a prerequisite index, was each cited section received before the operation's own specification? A walk passes when no operation arrives ahead of a prerequisite it names.
- **Strict disclosure, the standing gate.** The existing rule: complete required context, selected branch boundaries, correct explanation, honest execution limits. Missing necessary context or loading unrelated content fails it.

A walk can fail the gate on an untargeted anti-pattern while passing on ordering. Both results are recorded. Passing ordering in all four does not reopen the skill-revision acceptance that the standing gate governs.

## Stopping

One cycle of four. A failure is preserved and the cycle stops with the finding recorded; an equivalent retry is not a remedy and none is started. Previous failures remain observed failures and are not relabelled.

## Amendment: the trace is observed, not reported

Recorded before the second dispatch and after the first produced no observations. Scenarios, acceptance rules, prediction and stopping condition are unchanged; only the instrument changes.

Each dispatch writes a transcript holding the worker's tool calls. The coordinator projects the retrieval trace from that transcript. Briefs ask for the procedure alone and say nothing about reads, logs or process.

This is a stronger instrument than the one it replaces, for three reasons beyond unblocking the cycle. The record is independent, so a worker cannot tidy, omit or misremember it. A worker told nothing about reading behaves as it otherwise would, where one asked to account for its wasted reads may not. And the projection applies to transcripts already on disk, including the four the first dispatch left.

## Limits accepted in advance

The projection observes retrieval, never comprehension: a received byte range is not an understood one. Its transcript layout is specific to this dispatch path and needs revisiting if that path changes. Workers reach files through shell commands as well as the read tool, so a command string is normalised into a path and range before scoring, and a shape the normaliser does not recognise is reported as unparsed rather than counted as no read.

Four walks measure neither consistency nor a rate. No token saving or detection improvement is inferred.
