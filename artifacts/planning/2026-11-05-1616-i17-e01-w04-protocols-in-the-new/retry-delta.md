# Linked Retry Calls

The preceding candidate is `/tmp/w04-final-walk-source`, manifest `af1b5a67d53b995be37c2c3bf93ced8abc79128edd9e4479e309e52b21901cfd`. The linked-call candidate is `/tmp/w04-linked-walk-source`, manifest `fd0ad01dcc101d42d6eab4c32192f4140805d52c06db9db06834bd7be09e400c`.

## Candidate Delta

- Change Overview links repeated reads of pull-request state, repeated review-worktree creation and repeated graph measurement through Apply. Original same-identity/new-head/index-update conditions and their action order remain explicit.
- Epic Integration links repeated Review Pull Request and Change Overview through Follow, and repeated readiness/withdrawal operations through Apply. The general failed-gate withdrawal refers to its preceding inputs; this makes the existing reference to those operations explicit. Fresh criterion verification, changed-head input, exact merge head/target, board exception, failed-gate timing and handoff limits are retained.
- Issue Delivery links its repeated Record Epic Delivery through Apply with the identical refreshed epic JSON and retained evidence inputs.

No other protocol changes between these two candidates. The raw delta is `/tmp/w04-linked-retry-delta.patch`. Every added link targets an existing operation or protocol already linked earlier in the same file. No callee, prerequisite file, context requirement or behavior is introduced. All 139 baseline links remain in their original order as a subsequence; each protocol retains the same unique target set after excluding the intentional common-context preamble.

## Invocation Sweep

The sweep distinguishes calls from reports. Bare operation names in returned-body descriptions, saved identity descriptions and local result interpretation remain prose. Issue Closure's generic completion-check retry and restart from its local issue step are local control transfers; they introduce no artifact or protocol call. Repeated named artifact/protocol invocations use their resolving link with Apply or Follow.

## Validation

- Strict proposed protocol-family check: seven files, zero findings.
- Complete isolated skill with the proposed protocol declaration and installed declarations elsewhere: 58 files, zero findings.
- Literal installed-model complete-skill check: 58 files, zero findings.
- Preservation script passes 32 ordered steps, 139 baseline links in order, no new unique targets and byte-identical Prerequisites/Runs in blocks.
- `git diff --check` passes. Prior immutable sources remain intact. Final exact-head behavioral checks and final-source disclosure walks remain pending.
