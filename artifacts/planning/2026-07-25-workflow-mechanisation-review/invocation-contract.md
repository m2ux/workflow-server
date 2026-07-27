# Mechanised Step Invocation Contract

> Review · Created 2026-07-25 · **Status:** Planning

A standalone, reusable specification. A future author mechanises a technique by following this
document and nothing else. Written against `work-package` v3.35.0 / `meta` v5.7.0, tip 2026-07-25.

**Fixed premise, not relitigated:** the agent runs the script by following a technique. The server
executes nothing. Everything below is a consequence of that.

---

## 1. Terms

| Term | Meaning |
|---|---|
| **Mechanised step** | An activity step of `kind: technique` whose bound technique's Protocol is an invocation-and-binding protocol rather than a derivation. |
| **Script bundle** | One executable per workflow, `<workflow>/scripts/<workflow-slug>.py`, exposing subcommands. `work-package` ships `wp.py`. |
| **Contract major** | A single integer versioning the bundle's *output shapes*, shared by every subcommand in the bundle. |
| **`script_root`** | Host-resolvable absolute directory holding the bundle. Supplied by the server at session bootstrap. |

---

## 2. Addressability and distribution

### Decision

**A `scripts/` sibling directory inside the workflow tree, addressed by a host-presented
`script_root` the server returns at bootstrap.** No new MCP resource class, no inline source
delivery.

```text
<workflowDir>/<workflowId>/scripts/<slug>.py      # server-side path
{script_root}/<slug>.py                           # agent-side path (host-presented)
```

### Why this resolves under both topologies

The problem statement — "the server sees `/app/workflows`, a read-only bind whose host source is
`HOST_WORKFLOWS_DIR`, a path the agent needs but the server's own view does not give it" — is
**accurate at tip, and is being solved right now for a different root in uncommitted working-tree
work.**

> **Provenance caveat, verified 2026-07-25.** `src/utils/path-presentation.ts` is **untracked** —
> `git cat-file -e HEAD:src/utils/path-presentation.ts` fails. Committed `src/config.ts` is 438 lines
> with no presentation layer; the working-tree copy is 509 lines with one. So this section describes
> **in-flight work, not shipped behaviour.** Treat the line counts below as "additions to a change
> already in progress" and re-verify before scheduling Batch 0.

That in-flight layer maintains a server-root → host-root prefix map and rewrites agent-facing paths
through it: `resolveHostPathPresentation` builds the map from `HOST_PROJECTS_ROOT` /
`HOST_WORKTREE_ROOT`, and `workflow-tools.ts` applies it to `planning_folder_path` so — in its own
words — "agents can open/write artifacts in their IDE workspace". Its own doc comment states the
problem this contract needs solved: *"Session storage uses container paths; `planning_folder_path` in
tool responses must be rewritten to the host mount source."*

So the mechanism is being built, and it has no third pair for the workflows root. Closing that gap:

| Change | Where | Size | Depends on the in-flight layer? |
|---|---|---|---|
| Add `serverWorkflowRoot` / `hostWorkflowRoot` to `PathPresentationMap` | `src/utils/path-presentation.ts` | ~10 lines | **yes** — that file must land first |
| Read `HOST_WORKFLOWS_DIR` in `resolveHostPathPresentation` | `src/config.ts` | ~4 lines | **yes** |
| Pass `HOST_WORKFLOWS_DIR` into the container environment | `docker-compose.yml` `environment:`, `scripts/start.sh` (which at **tip** already computes it and defaults it to `${INSTALL_DIR}/workflows`) | 2 lines | no |
| Return `script_root` beside `planning_folder_path` | `get_workflow` response | ~3 lines | no |

If the in-flight presentation layer is abandoned, the first two rows become ~60 lines rather than ~14
— building the map from scratch instead of extending it. Either way the design is unchanged and the
cost stays small; only the estimate moves.

Under **stdio**, `workflowDir` is already a host path and the map is identity — `script_root` is
returned unchanged. Under **http+Docker**, `HOST_WORKFLOWS_DIR` is the bind source `start.sh` already
knows, so the returned `script_root` is the host clone the operator created. Same field, same
semantics, both topologies.

### Rejected alternatives

| Alternative | Rejected because |
|---|---|
| **Inline source through the technique payload** | Prices out badly and defeats the purpose. `wp.py` at PoC scope is 11,634 chars; a full bundle covering the ledger's 15 candidates is 30–50k chars ≈ 8–13k tokens. Delivered once per session that is 4–7 % of the 185k-token technique budget — affordable, but spent to save a payload that the PoC measured shrinking by **0.6 %**. Net negative. Also breaks trust: source arriving as model-context text can be paraphrased on its way to disk. |
| **A new addressable non-markdown resource class** (`get_script`) | Same token cost as inline delivery, plus a new tool, a new loader path, and a schema surface. `resource-loader.ts` resolves markdown only; extending it to binaries buys nothing that `script_root` does not. Reconsider only if a topology appears where the agent and the workflows clone are on different machines. |
| **Bare `<workflowDir>/<id>/scripts/` with no presentation** | Works under stdio, silently produces a nonexistent container path under Docker. The failure is a `No such file` at step time, mid-activity. |
| **Ship scripts with the harness rules / client install instead of the workflow tree** | Decouples script version from workflow version — precisely the coupling §3 exists to guarantee. |
| **A `kind: script` step** | Moves the invocation into activity YAML, duplicating the shape at every call site, bypassing `get_technique` delivery and the step-manifest path, and costing a schema major. The whole design goal is that a mechanised step is an *ordinary* technique step. |

### Consequence for the workflows tree

The tree gains its first non-`.md`/`.yaml` files. Two follow-ons:

- The tree is a separate clone on an orphan branch, refreshed by `scripts/update-workflows.sh`. A
  user on a stale clone gets a stale bundle — handled by §3.
- The Docker bind is `read_only: true`. Scripts are read and executed, never written. Executable
  permission bits are irrelevant: the invocation is `python3 <path>`, not `<path>`.

---

## 3. Version coupling

### Decision

**Handshake on a bundle-wide contract major, asserted by the technique at every call.**

The technique's Protocol names `--require-contract=N`. The script compares `N` against its own
`CONTRACT` constant and, on mismatch, prints a failure envelope and exits 2 without doing any work.

```text
python3 {script_root}/wp.py --require-contract=1 derive-names …
```

The contract major is bumped whenever any subcommand's **output** shape changes incompatibly: an
output id renamed or removed, a type changed, or an exit-code meaning redefined. Adding a subcommand,
adding an optional flag, or adding a field to `provenance` does not bump it.

### Why the handshake and not frontmatter

`metadata.version` is the technique's own version and is checked corpus-wide by
`scripts/check-technique-template.ts`, whose first rule is that frontmatter carries
`metadata.version` **and nothing else**. There is no schema-legal place to declare a script
dependency in a technique file. The Protocol text is the only carrier, so the assertion becomes an
argument — which has the side benefit of being enforced by the script at runtime rather than by a
linter at author time.

### Divergence behaviour

Fail closed, always. A technique expecting contract 2 against a contract-1 bundle exits 2 with
`reason: "contract mismatch: technique requires 2, script provides 1"` and `fallback: "prose"`. The
agent then follows the fallback path of §7. It never proceeds on a guess about which fields exist.

**Rejected:** minimum-version comparison (`--min-contract`), which would let a technique run against
a newer bundle whose outputs it does not understand. Exact equality is the only check that cannot
half-succeed.

---

## 4. Interpreter and availability

### Decision

**Python 3, standard library only, no build step.**

### Rationale against the four axes

| Axis | Python 3 | TypeScript (reusing `scripts/`) |
|---|---|---|
| **Interpreter availability** | Present on effectively every developer host, macOS and Linux; `python3` is on PATH by default. | Guaranteed Node is an artefact of the **stdio install path only** — that user installed the server from source, so they have Node. An http+Docker user has *Docker*; nothing obliges them to have Node on the host where their agent runs. |
| **Build / packaging burden** | Zero. The file in the workflows clone is the file that runs. | Requires `tsc` output or `tsx`, plus `node_modules`. The workflows tree is a separate orphan-branch clone with no `package.json`; giving it one makes a definitions repo into a buildable package and makes `update-workflows.sh` a build step. |
| **Testability** | `unittest` in the stdlib. The PoC's 31 tests run under bare `python3` with no install. | `vitest` is already configured and excellent — but only inside the server repo, which is not where these scripts live. |
| **Second-toolchain cost** | Real: contributors to `src/` write TypeScript, contributors to `scripts/` would write Python. Mitigated by keeping the bundle small, dependency-free, and stdlib-only — a reviewer needs no Python ecosystem knowledge, only the language. | Zero second toolchain, but see the two rows above. |

The decisive asymmetry: **the execution host changed**. The repo's ~25 TypeScript validators run in CI
and on maintainer machines, where Node is a given. These scripts run on an arbitrary user's host at
workflow time. Optimise for the constraint that actually binds.

### Pre-flight

The technique's Protocol does **not** open with an interpreter check — that would add a tool call to
every mechanised step to guard against a condition that fails loudly anyway. Instead:

- A missing interpreter surfaces as a shell error (`python3: command not found`), which the technique's
  fallback note treats identically to exit 4.
- The **first** mechanised step of a workflow run (in `work-package`, `repo-root-resolution` in
  activity 01) carries the one-time check. Its failure note names the remedy: install Python 3, or run
  the whole workflow in prose-fallback mode.
- Scripts declare `#!/usr/bin/env python3` for direct execution but are always *invoked* as
  `python3 <path>` so a non-executable bit in a read-only bind is never an issue.

**Rejected:** a `wp.py --selftest` bootstrap step at session start. It spends a turn on every run to
detect a condition that is stable per host and self-announcing on first use.

---

## 5. I/O contract

### 5.1 Arguments in

Literal `--flag=value` arguments, one per declared input, `snake_case` input id rendered
`--kebab-case`. No positional arguments except the subcommand. No environment-variable inputs. No
shell interpolation of any kind.

**Content-bearing inputs never travel as argv.** Any input that can exceed a few hundred characters —
`artifact_content`, `rendered_pr_body`, a JSON `entity_context` — is passed as `--<name>-file=PATH`,
written by the agent with its own Write tool first. This bounds argv length, keeps large content out
of the shell command the user sees in a permission dialog, and sidesteps quoting entirely.

### 5.2 Structured stdout

**Exactly one JSON object on stdout, followed by one newline, and nothing else.** Never a log line,
never a progress marker, never a second object.

```json
{ "ok": true, "contract": 1, "subcommand": "derive-names",
  "outputs": { "branch_name": "…", "target_path": "…" },
  "warnings": [ "…" ],
  "provenance": { "script": "wp", "contract": 1, "subcommand": "derive-names", "layout": "nested" } }
```

```json
{ "ok": false, "contract": 1, "subcommand": "derive-names",
  "class": "ambiguous", "reason": "…", "fallback": "prose", "detail": { … } }
```

### 5.3 Exit codes

| Code | Class | Meaning | Agent action |
|---:|---|---|---|
| 0 | — | success | bind `outputs`, surface `warnings` |
| 1 | `internal` | unexpected failure — a script defect | fall back to prose; report the defect |
| 2 | `precondition` | a required input is missing or malformed, **or** contract mismatch | fix the named input and re-invoke; do not fall back on the first attempt |
| 3 | `ambiguous` | legally-reachable state the script may not resolve | **take over with judgement**, per §7 |
| 4 | `environment` | interpreter, tool, or filesystem prerequisite absent | fall back to prose; report the prerequisite |

The 2/3 split is the load-bearing one. **2 means the agent got it wrong; 3 means the specification
does not decide.** Collapsing them would make every retry-vs-escalate decision a judgement call — the
opposite of the point.

### 5.4 Diagnostics

Human-readable diagnostics go to **stderr**, one line, `class: reason`. Stderr is for the transcript
and the user; stdout is for the machine. A script that writes anything but its one JSON object to
stdout is a defect the bundle's own test suite must catch (the PoC asserts this:
`test_stdout_is_exactly_one_json_object`).

### 5.5 Reconciliation with `variable-binding`

The `outputs` object **is** the "produced value" map that
[`meta/techniques/variable-binding.md`](../../../../workflows/meta/techniques/variable-binding.md)
step 5 lands in the bag. No new machinery, no new rule:

- `signature-is-the-contract` — every key in `outputs` is a declared output id of the technique;
  every declared output id appears as a key (or the run failed). This is checkable statically, and
  should become a lint: *for each mechanised technique, the script's emitted key set equals the
  technique's `## Outputs` id set.*
- `binding-carries-only-deviations` — unchanged. A step remapping an output uses
  `step.technique.outputs`; the script neither knows nor cares about the bag name.
- `outputs-by-name-and-path` — a nested-object output (e.g. `validation_results`,
  `artifact_conformance`) lands whole from JSON and resolves by dotted path downstream. JSON is
  strictly better here than prose, which had to describe nesting in words.
- `outputs-mutate-state-only-via-sanctioned-path` — the worker still reports through
  `variables-changed` on `activity_complete`. The script is a *source* of values, never a writer of
  state.

---

## 6. Trust boundary

### Decision

**Accept the script's answer; assert only the invariants the script cannot self-certify against
workflow intent.** Never re-derive.

Re-deriving would spend exactly what mechanisation saves and, worse, would make the *agent's*
derivation the tiebreaker — reinstating the four-answers problem the script exists to remove. But
"accept everything" is wrong too: **a script that silently returns a wrong path is worse than an
agent that gets it right by reading.**

The line: the script owns *arithmetic*; the agent owns *semantics that the script has no way to see*.

### Checked, always, at O(1) cost

1. **Output-set conformance** — the returned `outputs` keys are exactly the technique's declared
   output ids. A drift here means script and technique have desynchronised despite the contract
   handshake.
2. **Containment invariants for path-producing steps** — `target_path` is neither
   `planning_folder_path` nor inside it, and is not equal to `repo_root`. Two string comparisons that
   catch the one failure class with observed history (ledger §6.2).
3. **`warnings[]` are surfaced verbatim and never acted on.** A warning names a rule the script
   *declined* to enforce. Suppressing it would hide a known contradiction; obeying it would let the
   script drive judgement.

### Not checked

- Existence of a path the script says it created — the next mutating step will fail loudly on it, and
  a `stat` per step is a call per step.
- The arithmetic itself. That is what the test suite is for. **A mechanised technique without a test
  suite is not mechanised, it is delegated.**

### Rejected alternatives

| Alternative | Rejected because |
|---|---|
| **Full agent re-derivation** | Spends the saving, and makes the agent the tiebreaker. |
| **Blind acceptance** | The observed failure class is exactly a silently wrong path. |
| **Server-side validation of returned values** | The server cannot see the host filesystem the values refer to. |

---

## 7. Failure escalation

### Decision

**Exit 3 (`ambiguous`) is an explicit, contractual hand-back of control to agent judgement, and the
technique tells the agent it may take it.**

Every technique's Protocol carries this as a `>` note beneath its final step — a blockquote
continuation, per §3.3 of the technique spec, so it folds into the step rather than parsing as a peer:

> On exit 2 (precondition) fix the named input and re-run. On exit 3 (ambiguous) or 4 (environment),
> derive the values by hand from [the fallback resource] and record which exit code forced the
> fallback.

Three properties make this work:

1. **The script decides when it may not decide.** Encountering `issue_type: spike`, the PoC does not
   guess a prefix — it exits 3 listing the known types. Guessing is the failure mode a script makes
   *worse* than an agent, because it guesses silently and identically every time.
2. **The rules survive the mechanisation, relocated.** A thin technique that deletes the derivation
   rules leaves nothing to fall back to. So the rules move to a **resource** the technique links —
   e.g. `work-package/resources/naming-conventions.md` carrying the type table, slug rule, and layout
   formulas as *documentation of what the script does*. Fetched only on exit 3, via `get_resource`.
   Answering the question directly: **the technique file is not a fallback and does not pretend to
   be. The fallback is a resource, and the technique names it.**
3. **The fallback is recorded, not silent.** "Record which exit code forced the fallback" makes
   fallback frequency observable in the step manifest — the signal that a script's ambiguity set is
   too large.

**Rejected:** a `--best-effort` flag letting the script guess on ambiguity. It converts a visible
hand-back into an invisible wrong answer, which is the single worst outcome available.

---

## 8. Idempotency and re-entry

### Decision

**Every mutating subcommand is convergent, and carries `--dry-run`.**

- **Convergent** — running it twice from any starting state yields the same end state, with the
  second run reporting what it found rather than failing. `create-worktree`'s existing idempotency
  check is the model: probe `worktree list --porcelain`, and if `{target_path}` is already registered
  against `{branch_name}`, reuse and report success. If it is registered against something *else* —
  exit 3. Occupied-by-a-stranger is ambiguity, not failure, and never a reason to delete.
- **`--dry-run`** — mandatory on FS and GIT subcommands. Emits the identical envelope with
  `"would": true` and `provenance.dry_run: true`, performing no writes. Required for two reasons: it
  is the only way to fixture-test a mutating script without a scratch repo per case, and it gives the
  agent a way to show the user what is about to happen before a consequential step.
- **`--dry-run` is not offered on PC/RO subcommands.** They have nothing to withhold.

Re-entry after partial completion is the resume case the #272 retrospective documented (path
reconstruction from the planning folder after an empty bag). A convergent script makes resume a
re-invocation: same inputs, same outputs, no memory required. That is the strongest single argument
for mechanising the path candidates, stronger than any token figure.

---

## 9. Harness portability

### Decision

**A fourth `operation_kind` — `run-script` — in `meta/techniques/harness-compat/`.**

The group already models exactly this shape: "the agent's environment provides a capability; a
technique explains it portably", with
[`resolve-harness-operation.md`](../../../../workflows/meta/techniques/harness-compat/resolve-harness-operation.md)
as the single authoritative `{harness_kind}` → file map and per-harness files exposing named Rules
sections. Mechanisation is the same pattern with a different capability, so it extends the group
rather than inventing a parallel one.

| Change | Detail |
|---|---|
| `resolve-harness-operation.md` | `{operation_kind}` gains `run-script` alongside `spawn` / `resume` / `concurrent`. The kind → file table is untouched — it maps *harness*, not operation. |
| `claude-code.md` | `### run-script` — invoke via `Bash`. Note the allowlist shape (`Bash(python3 /path/to/wp.py:*)`) and that literal `--flag=value` arguments avoid the expansion / substitution constructs that trigger non-bypassable confirmation. |
| `cursor.md`, `cline.md` | `### run-script` — the host's terminal / `execute_command` primitive. |
| `generic.md` | `### run-script` — any mechanism that runs a command and returns stdout, stderr, and exit status separately. |
| `TECHNIQUE.md` | A new group rule, `script-invocation-captures-three-channels`: stdout, stderr, and exit status must all be recoverable. A harness that merges stderr into stdout breaks §5.2 and must not be used for mechanised steps. |

That last rule is the real portability constraint, and it is worth stating loudly: the contract rests
on stream separation. `foreground-always` has an analogue here too — a mechanised step must observe
the process's exit before continuing; fire-and-forget invocation is forbidden.

Individual techniques then never name `Bash`. They say "run `python3 {script_root}/wp.py …`" and the
harness layer supplies the mechanism — the same discipline `harness-independence` already imposes on
dispatch.

---

## 10. Observability

### Decision

**Mechanisation *improves* step-level observability. Bind it to the step manifest and say so.**

Today, per the [2026-07-03 disclosure review](../2026-07-03-schema-technique-disclosure-review/payload-measurements.md)
§7: session history records activity-level events only (verified on a live session file — 18 events,
no step or technique events), and step manifests are warn-only and name-based. Whether a worker
fetched and followed the bound technique is **not observable server-side**. The same review recorded
silent degradation: unresolved refs returned "not found" and the worker completed the walk anyway.

A mechanised step is the first step kind that can prove what it did:

1. **The manifest entry is the script's `outputs` object, verbatim.** §7.5 of the technique spec
   already specifies a JSON object keyed by output id as the canonical multi-output manifest form. A
   mechanised step satisfies it by construction — no summarisation, no paraphrase.
2. **`provenance` is carried into the manifest**: `{script, contract, subcommand}` plus any
   subcommand-specific facts (the PoC emits `layout` and `wp_slug`). A reader of the trace can tell
   *which* branch of a layout decision fired — information that prose derivation never leaves behind.
3. **Exit code is recorded when non-zero**, including fallbacks. Fallback frequency per subcommand
   becomes a maintainable metric.
4. **The blind spot this creates, stated plainly:** the derivation disappears from the transcript. A
   human reading a run today can see the agent reason about a path and can catch a wrong turn. After
   mechanisation they see one command and one JSON object. The mitigation is `provenance` +
   `warnings` carrying the *decisions* the derivation used to narrate — which is why `provenance`
   is mandatory, not decorative.

---

## 11. Technique shape — the template

Concretely, this. It passes `scripts/check-technique-template.ts` (canonical five H2s in canonical
order, `snake_case` entry ids, `kebab-case` rule names, no `{$name}` bindings) — verified against the
PoC's rewrite.

```markdown
---
metadata:
  version: 2.0.0
---

## Capability

<what this does> by invoking the `<slug>` mechanisation script.

## Inputs

### <each declared input, unchanged from the prose version>

<description — what the value IS, per the authoring rules>

### script_root

Host-resolvable directory holding the workflow's mechanisation scripts, from the session bootstrap
response.

## Outputs

### <each declared output>

<description. Shorter than the prose version: the derivation rule has moved to the script, so the
description states what the value is, not how it is computed.>

## Protocol

1. Run `python3 {script_root}/<slug>.py --require-contract=<N> <subcommand> --flag={input} …`,
   <plus any conditional flag variation>.
2. On exit 0, parse the single stdout JSON object and land `outputs.<id>` … per
   `meta.variable-binding.signature-is-the-contract`. Report `outputs` verbatim as this step's
   `step_manifest` entry.
3. <Assert the O(1) invariants of §6 that apply to this step's outputs.>
4. Surface every `warnings[]` entry to the user without acting on it; a warning names a rule the
   script declined to enforce, not a failure.
   > On exit 2 (precondition) fix the named input and re-run. On exit 3 (ambiguous) or 4
   > (environment), derive the values by hand from [<fallback-resource>](../resources/<name>.md) and
   > record which exit code forced the fallback.

## Rules

### script-is-the-single-source

<The tables, formulas, and thresholds> live only in `<slug>.py`. Never restate them here or in an
activity — a copy in prose is the drift this technique exists to remove.

### <any surviving semantic invariant, unchanged>
```

Five things the template makes non-negotiable:

- **`## Inputs` and `## Outputs` do not shrink.** `signature-is-the-contract` requires the full
  signature. This is why the payload saving is ≈ 0 and why nobody should expect otherwise.
- **`script-is-the-single-source` is mandatory on every mechanised technique.** It is the rule that
  makes drift a review-catchable defect rather than an emergent property.
- **Step 2 always names `variable-binding` by its dotted symbol address.** The binding is not
  ad-hoc reasoning; it is the sanctioned path.
- **Step 4's `>` note is a blockquote, never a sub-bullet.** A `  - …` line parses as a new step and
  detaches the fallback from the step it qualifies (AP-56).
- **The fallback resource is a link, not inlined text.** Paid for only on exit 3.

---

## 12. Author's checklist

A mechanised technique is complete when all of these hold:

1. Determinism test applied and the seam stated, if separable.
2. Subcommand added to the workflow's bundle; contract major unchanged, or bumped with every
   dependent technique updated in the same change.
3. Emitted key set **equals** the technique's `## Outputs` id set.
4. Exits 0/2/3/4 all reachable and covered by a test; exit 3's ambiguity set enumerated in the
   failure `detail`.
5. `--dry-run` present and tested, for FS and GIT subcommands.
6. Convergent: the double-invocation test passes.
7. Exactly one JSON object on stdout, asserted by a test.
8. Fallback resource exists and carries the rules the technique no longer states.
9. `script-is-the-single-source` present; no formula, table, or threshold restated in prose.
10. Invocation shape has a stable static prefix and no dynamic-shell construct.
11. Template guard passes.
12. `harness-compat::run-script` is the named mechanism; no technique mentions `Bash`.
