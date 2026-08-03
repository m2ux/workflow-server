# Key-directory error guidance — investigation record

Supporting record for the key-directory guidance issue. Found 3 August 2026 while resolving a test
failure in the run-profiler work ([#412](https://github.com/m2ux/workflow-server/pull/412)).

## Where the guidance is attached

`src/utils/session/crypto.ts`. `formatKeyAccessError(err, operation)` (line 56) builds the actionable
message: it names the key file, the resolved key directory, the underlying errno and message, and
tells the operator to set `WORKFLOW_SERVER_KEY_DIR` or `WORKFLOW_SERVER_STATE_DIR` to a writable
path, or to point `HOME` somewhere writable — noting that a non-root Docker user often has `HOME=/`.

`loadOrCreateKey` (line 71) has four failure sites, each gated on the same two errnos and each
falling through to a bare re-throw:

| Line | Operation | Guard | Fallthrough |
|---|---|---|---|
| 83–86 | read the key file, errno other than `ENOENT` | `EACCES \|\| EPERM` | `throw err` |
| 93–96 | `mkdir` the key directory (`recursive: true`) | `EACCES \|\| EPERM` | `throw mkdirErr` |
| 117–120 | re-read the key file after `EEXIST` | `EACCES \|\| EPERM` | `throw readErr` |
| 123–126 | `open`/write the key file | `EACCES \|\| EPERM` | `throw writeErr` |

`isErrno` (line 52) is an exact `err.code === code` comparison, so no errno family is matched by
prefix or pattern.

## Errnos that miss the guidance

- **`EROFS`** — read-only filesystem. A container started with `--read-only`, or any read-only root,
  answers `mkdir` this way. The operator sees `EROFS: read-only file system, mkdir '/.config'`.
- **`ENOTDIR`** — a path component is a file. `HOME` pointing at a file produces this.
- **`ENOENT`** — with `recursive: true` this is unusual, but a restricted or overlay mount produces
  it. This is the one observed (below).
- **`ENOSPC`**, **`EDQUOT`** — full disk or exceeded quota. Arguably not configuration, but the
  message names the directory, which is still the useful fact.

## How it surfaced

`tests/session-crypto.test.ts` asserted the guidance appears when the key directory cannot be
written, and created that condition by setting `WORKFLOW_SERVER_KEY_DIR` to
`/.workflow-server-eacces-test-issue-283` — a path under the filesystem root that a non-root user
cannot create.

Run under bubblewrap (`~/.claude/bin/sbx`), whose root is a read-only overlay, `mkdir` returned
`ENOENT: no such file or directory, mkdir '/.workflow-server-eacces-test-issue-283'` rather than
`EACCES`. The guard did not match, the raw error propagated, and the assertion
`rejects.toThrow(/session signing key|WORKFLOW_SERVER_KEY_DIR|HOME/)` failed.

The sibling test `probeSessionKeyWritable is false for an unwritable KEY_DIR` used the same proxy
path and passed, because the probe catches every error and returns `false` regardless of errno — so
it was never asserting the errno in the first place.

Both tests were changed in #412 to create a mode-`0500` directory inside their own temp tree, which
the running user genuinely cannot create a key directory in. That produces a real `EACCES` wherever
the suite runs, and matches the idiom the file already used for its readable-key probe case. The
suite is green at 826 passed. The consequence for this issue: the tests now cover `EACCES` honestly
and cover nothing else, so the errnos above have no coverage at all.

## Blast radius

`gitnexus impact --target loadOrCreateKey --direction upstream`:

- **risk: CRITICAL**, 12 impacted symbols, 8 affected execution flows, 1 module (Session).
- Direct caller (d=1): `getOrCreateServerKey`.
- d=2: `createTraceToken`, `decodeTraceToken` (`src/trace.ts`), `computeSeal`
  (`src/utils/session/store.ts`), `computeSessionIndex`, `computeEmbeddedSessionIndex`
  (`src/utils/session/derivation.ts`).
- d=3: `writeSessionFile`, `writeSeal`, `verifySeal`, `migratePlanningFolder`, and the two tool
  registrars.

Every session seal, session index and trace token is downstream. That is the argument for keeping
the change inside the four failure branches above rather than restructuring the key path.

## Caller survey — does anything branch on the errno?

No. `getOrCreateServerKey` is awaited at five sites and none inspects the rejection:

- `src/trace.ts` lines 121, 162
- `src/utils/session/derivation.ts` lines 73, 127
- `src/utils/session/store.ts` line 197

`store.ts` does carry four `err.code ===` checks (lines 229, 296, 374, 447), but they sit on the
rename path (`EXDEV`) and on file reads (`ENOENT`) — not on the key path. `probeSessionKeyWritable`
has its own try/catch and returns a boolean, so wrapping cannot change its answer.

So replacing the two-errno guard with an unconditional wrap on the create and write branches cannot
break a caller that was reading the code, because no caller reads it. The raw errno and message stay
inside the wrapped message, so nothing is lost for diagnosis either.

## Origin

The guidance was added for [#283](https://github.com/m2ux/workflow-server/issues/283) (closed),
"Docker HTTP bootstrap friction: start_session EACCES on HMAC key + install/layout gaps" — a
non-root container with `HOME=/`. That case genuinely reports `EACCES`, which is why the guard was
written to match it and went no wider.
