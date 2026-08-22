# Review Findings — over-engineering in the lean-test-suite change

**Reviewed:** commit `00d15428` on `refactor/lean-test-suite` (35 files, +280/-570) · **Intensity:** ultra · **Scope:** the change

Scanned the 280 added lines. The deletions are not re-litigated — a removed test cannot over-build.

## Findings

```
LC-1  tests/e2e/snapshot.test.ts:L27-41: shrink stamp-freshness block duplicated verbatim in
      option-coverage.test.ts:L131-145 — both already import currentCorpusSha/readStamp/STAMP_PATH
      from tests/corpus-stamp.ts; move the three assertions there as expectStampFresh(driftHint),
      leaving one call per site.                                                            -12

LC-2  tests/e2e/README.md:L72-73: delete "The six walks are shared: … three readings of one
      traversal" — L55-56 already says "all over one set of walks".                          -3

LC-3  tests/e2e/README.md:L55-70: shrink the 16-line snapshot.test.ts bullet — the *Catches:*
      clause re-enumerates the three assertions named two sentences above it.                -5

LC-4  tests/e2e/README.md:L219-222: delete the "Unresolved op refs" entry — a Findings &
      baselines entry whose finding is that there is no finding.                             -4

LC-5  tests/e2e/snapshot.test.ts:L140-141: delete the console.log coverage print and its
      eslint-disable — nothing reads the count, and L142 is the assertion.                   -2

LC-6  tests/e2e/snapshot.test.ts:L84: delete the empty [defaultPolicy.name]: {} entry — it
      exists only to satisfy the non-null assertion on L105; use branches[policy.name] ?? {}. -1

LC-7  tests/e2e/snapshot.test.ts:L122-124: shrink the Layer 2 docblock — "group-prefix rule
      expansion in resolveTechniques, the core-ops.ts names, and the fallback …" names the
      loader internals holding the set empty, which the test does not assert.                -3

LC-8  tests/binding-fidelity.test.ts:L11-13: delete the retired-baseline paragraph — no
      baseline remains in the file, and the test below checks rationale keys only.           -3

LC-9  tests/review-mode-gating.test.ts:L5-7: shrink the docblock — its first paragraph states
      the guard's whole rule, which L9-11 then says the guard owns; the test asserts reasons. -4

LC-10 tests/section-framing-guard.test.ts:L5-10: shrink the docblock — it describes the corpus
      guard above a describe block that now checks only the triage file's shape.             -3

LC-11 tests/site.test.ts:L8-12: shrink the 5-line docblock over two one-line tests — it
      accounts for the two guards that live elsewhere rather than these two properties.      -3

LC-12 tests/guard-registry.test.ts:L50-54: shrink the 5-line docblock — the test name on L55
      and the assertion messages on L58 and L60 already carry it.                            -3

LC-13 tests/e2e/snapshot.test.ts:L31, tests/e2e/option-coverage.test.ts:L133,
      tests/mcp-server.test.ts:L2553, tests/guard-registry.test.ts:L56: delete the four
      "ponytail:" markers — each reserves a skip or a YAML parse no path asks for, under a
      prefix naming the process that wrote the line.                                         -4

LC-14 tests/e2e/snapshot.test.ts:L29-30, tests/e2e/option-coverage.test.ts:L131-132,
      tests/mcp-server.test.ts:L2551-2552: delete "so it fails rather than passing with
      nothing compared" — states the edit, and each assertion's own message says what it
      checks; mcp-server keeps "the oracle IS this test" as its one why-line.                -5

LC-15 tests/schema-loader.test.ts:L12: delete expect(ids.length).toBeGreaterThanOrEqual(
      IDS.length) — implied by L11 asserting containment of all five distinct IDS members.   -1

LC-16 tests/context-window-smoke.test.ts:L313-314: shrink the two-line boundary note over two
      assertion lines to one why-line.                                                       -1

LC-17 tests/session-schema.test.ts:L332-333: shrink the two-line comment over a one-line
      assertion — "nothing else pins this value" is the whole of it.                          -1
```

## Scoreboard

```
net: -58 lines possible.
```

Twelve of the seventeen are comment and doc bulk, which is where an ultra pass on a subtraction lands. LC-1 is the one structural finding: a shared helper module both call sites already import from, with the shared block left at both.
