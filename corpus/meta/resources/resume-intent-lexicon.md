---
name: resume-intent-lexicon
description: Continuation-phrase vocabulary that marks a user request as stating resume intent, with the negative cases that mark a fresh start.
---

# Resume Intent Lexicon

The closed vocabulary that separates a request stating resume intent from one stating a fresh start.

## Affirmative phrases

| Family | Phrases |
|--------|---------|
| Resume | `resume`, `resuming` |
| Continue | `continue`, `continuing`, `carry on`, `keep going` |
| Return | `go back to`, `back to`, `return to` |
| Prior work | `pick up`, `pick up where`, `where I left off`, `where we left off`, `finish off`, `wrap up` |
| Existing session | `the existing session`, `my previous session`, `the session from`, `that work package again` |

## Negative cases

These state a fresh start and do not match, including when a work item is named alongside them:

`start`, `start a new`, `begin`, `create`, `new work package`, `kick off`, `set up`, `from scratch`.

A bare work-item reference — an issue number, Jira key, branch name, or PR number with no continuation phrase — is a fresh start.

## Matching

- Match case-insensitively on whole words, so `restart` and `discontinue` do not match `start` or `continue`.
- A negative case alongside an affirmative phrase resolves affirmative: `start where we left off` states resume intent.
- Multi-word phrases match with any run of whitespace between words.
- Treat the table as the closed vocabulary; a synonym outside it is a fresh start until this resource lists it.
