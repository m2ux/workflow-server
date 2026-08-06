# Capture: issue #414 — Key directory errors: the fix-it guidance reaches every reason the write failed, not only permission denied

Body verbatim as of 6 August 2026 (filed 3 August 2026; subsumed into the deployment-hardening epic as W2 and closed on 6 August 2026).

Its investigation record — the four failure sites, the error codes that miss the guidance, the sandbox run that surfaced it, the caller survey and the blast-radius output — stays where it was written: [`2026-08-03-key-directory-error-guidance`](../2026-08-03-key-directory-error-guidance/).

---

## Summary

Before the server can seal a session it needs a signing key, and it keeps that key in a directory worked out from the environment. When it cannot put the key there, the operator gets a genuinely useful message: the directory it tried, the reason the filesystem gave, and the two environment variables that move the key somewhere writable. That message is attached to one reason — the filesystem answering "permission denied". Every other reason a write can fail comes back as the bare system error with no mention of the setting that fixes it.

So an operator running the container with a read-only root filesystem sees `read-only file system` and a path, and has to go and read the source to learn that a variable exists to relocate the key. An operator whose home directory turns out to be a file sees `not a directory` and the same silence. The guidance is right there in the module and simply does not fire for them.

There are four places in the key path that can fail this way, and each of them asks the same narrow question before deciding whether to help.

## Why it is narrow

The guidance was written for [#283](https://github.com/m2ux/workflow-server/issues/283), where a container running as a non-root user had its home directory at the filesystem root and could not create the key. That case really does report "permission denied", so the check was matched to it and went no further. Nothing was overlooked at the time; the message was simply fitted to the one case in hand.

## How it surfaced

The repository's own tests found it, and the signal was first read as noise.

A test asserts the guidance appears when the key directory cannot be written, and it created that condition by pointing the key directory at a path under the filesystem root that a non-root user cannot create. Run inside a sandbox whose root is a read-only overlay, that attempt came back as "no such file or directory" rather than "permission denied". The guidance did not fire, the raw error propagated, and the test failed.

It was diagnosed as an artifact of the sandbox, which it was, and the test has since been corrected in [#412](https://github.com/m2ux/workflow-server/pull/412): it now locks a directory inside its own temporary tree, which the running user genuinely cannot write into, so it provokes a real permission-denied failure wherever the suite runs. A sibling test used the same proxy path and passed only because it checks a boolean the probe returns for any failure, so it was never asserting the reason at all.

That leaves the tests honest about what they cover — permission denied, and nothing else. The reasons above have no coverage.

## The work

**Widen the guidance to any failed write.** Creating the key directory and writing the key file can only go wrong in one way that matters to the operator: the server cannot establish a key there. Those two branches should wrap whatever the filesystem returned rather than first asking whether it was permission denied. Nothing is lost for diagnosis, because the message already carries the underlying code and text inside it.

**Leave a missing key distinguishable from an unreadable one.** Reading the key file is a different case: "no such file" means the key has not been minted yet and the server should carry on and create it. That branch stays exactly as it is, and so does the re-read that follows a concurrent write.

**Cover the reasons a test cannot easily provoke.** A read-only filesystem and a home directory that is really a file are awkward to arrange from a test process. Injecting the failure rather than provoking it from disk covers them without requiring a specially mounted test environment.

## Why now is cheap

The change lives entirely inside branches that already throw. No signature changes, no new failure where there was none, and the successful path is untouched.

That matters here, because the key-loading function is not a quiet corner. Impact analysis over it reports **12 dependent symbols across 8 execution flows** and rates the blast radius **critical** — every session seal, every session index and every trace token is downstream of it. The callers were surveyed for that reason: **5 call sites** across tracing, session-index derivation and the session store, and every one of them simply awaits the key and lets a failure propagate. None reads the error's code. The session store does test error codes in four places, but on its rename and file-read paths, not on the key path. So widening what gets wrapped cannot break a caller that was branching on the reason, because no caller branches on it.

## Scope of change

One module in the session utilities, plus its test file. No schema change, no tool-surface change, no change to where the key directory is resolved from.

## Acceptance criteria

- [ ] Any failure to create the key directory or write the key file reports the directory it tried, the underlying system code and message, and the environment variables that relocate it.
- [ ] A key file that does not exist yet still leads to one being minted, and a concurrent write is still resolved by re-reading.
- [ ] Tests cover a read-only filesystem and a path component that is a file, without needing a specially mounted test environment.
- [ ] The readiness probe still answers false rather than throwing when the directory cannot be written.

## Non-goals

- Where the key directory is resolved from, and the precedence between the two environment variables. Both stay as they are.
- The sealing, session-index and trace paths that consume the key.
- The install layout and container mount documentation, which #283 already settled.

## Investigation detail

The four failure sites, the errnos that miss the guidance, the sandbox run that surfaced it, the caller survey and the blast-radius output:
**[engineering/artifacts/planning/2026-08-03-key-directory-error-guidance](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-03-key-directory-error-guidance)**

