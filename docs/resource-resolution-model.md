# Technique and resource resolution

A workflow's full set of instructions runs to tens of thousands of characters. Hand all of it to an agent when the run opens, and most of it is irrelevant to whatever that agent is doing at any given moment. The part that matters is crowded out by the part that does not, responses slow, and every later call carries the whole of it again.

So the server hands over one piece at a time. Behaviour is broken into techniques — a technique being a markdown definition of a single capability — and an activity names the ones it needs.

This document covers how a name reaches a file: how techniques and resources are named, how a reference is written and resolved, and what a namespace is. What then travels to an agent, and what it costs, is [the delivery model](delivery-model.md).

## How a technique or resource is named

Techniques and resources are markdown files on disk, and each one's filename is its id. A standalone technique is `techniques/{slug}.md`; a grouped technique is a folder holding a `TECHNIQUE.md` index plus one `{sub}.md` per nested technique; a resource is `resources/{slug}.md`. The id matches the filename, and the frontmatter repeats it.

So the file `techniques/workflow-engine.md` is the technique `workflow-engine`, and that is the name an agent asks for it by.

## What a technique is

There is one kind of technique. It is either a single markdown file, or a folder whose `TECHNIQUE.md` index carries nested techniques as sibling files. A nested technique is itself a technique: same shape, same delivery.

A technique publishes:

* **`id`**, **`version`**, **`capability`** — the identity and the capability statement.
* **`inputs`** (optional) — an array of entries, each with `id`, `description`, `required`, `default`, and optional `components` (named sub-members).
* **`outputs`** (optional) — an array of entries, each with `id`, `description`, optional `components`, and an optional `artifact` carrying a `name` (the filename produced when the output is persisted).
* **`protocol`** — an ordered list of blocks `{title?, steps[]}`. Steps are imperative bullets; failure handling is expressed inline within the relevant steps.
* **`rules`** — named behavioural invariants that apply across the technique. Each key is a rule name (or a group prefix); each value is a single rule string or an array of related rules.

The full file contract — section shapes and the addressing grammar — is [the technique protocol specification](technique-protocol-specification.md). The case and shape rules that govern every id in it are [the identifier conventions](identifier-conventions.md).

## Referring to a technique or a rule

Activities and workflows compose behaviour by listing technique references. A reference is a `::`-delimited path:

```
[namespace::]technique[::nested…]
```

```yaml
techniques:
  primary: workflow-engine::dispatch-activity
  supporting:
    - workflow-engine::evaluate-transition
    - agent-conduct::checkpoint-discipline
    - meta::agent-conduct::file-sensitivity      # namespace-prefixed
    - shared::indexer::analyse                   # a namespace named by its path
```

A same-namespace reference omits the prefix; the current workflow is filled in at resolution. Include a leading prefix only to reach another namespace — the longest leading run that names one is the prefix, and everything after it is a path inside that namespace's `techniques/`. A `namespace/technique` slash form spells a single-segment prefix.

### What a namespace is

A namespace is a directory offering artifacts to references. It earns that by holding a `techniques/`, `resources/` or `routines/` directory, or by holding a `workflow.yaml` — and a directory holding a definition is a **workflow** as well, the thing an operator can run. The two are usually one directory: a workflow keeping its own library beside its definition is addressable with nothing done to it.

`activities/` earns nothing. An activity declares exits, and the destinations those exits lead to live in a definition's `graph`, so an activity in a directory holding no definition could never be routed. Activities belong to workflows; the three library kinds are what a namespace offers.

A namespace answers to two names: its directory name, and the slash-joined path from the corpus root that reaches it. The name is what a reference ordinarily carries, so a folder can be re-grouped without rewriting what points at it; the path is what a reference carries where a name is claimed twice, or where an author would rather be explicit. `shared/indexer/techniques/analyse.md` answers to `indexer::analyse` and to `shared::indexer::analyse` alike.

Two consequences are worth stating. A namespace holding no definition never reaches `list_workflows`, because the listing reads definitions rather than a list of names to exclude — so a shared library sits in the corpus without appearing as a product. And where a namespace at `a/b` and a directory `a/techniques/b/` both exist, one reference names two files: `indexCorpus` reports the collision and the reference is refused naming both, rather than one reading being picked and the other left unreachable.

### What a reference addresses

* **A technique** — a standalone `{technique}.md`, a grouped `{group}/TECHNIQUE.md` index, or a nested `{group}/{sub}.md` file (addressed `{group}::{sub}`). A nested technique is a technique.
* **A rule** — when the trailing segment matches a rule name on the addressed technique. A bare group reference `{technique}::{group}` expands to every rule named `{group}-*` on that technique.

### The inline form

Technique invocations also appear inside step descriptions:

```yaml
steps:
  - id: dispatch-worker
    description: "workflow-engine::dispatch-activity(activity_id: {next}, agent_id: 'worker')"
```

The inline form points at the same technique body. Agents read the technique from the bundled response rather than re-fetching it.

## How a reference resolves

### The resolution order

Each reference resolves as follows:

1. **Locate the technique.** If the reference carries a namespace prefix, load from that namespace's `techniques/` folder and nowhere else — a prefix says where the technique lives, so a fallback would deliver a different file under the same reference. Otherwise resolve **current-workflow-first, then the `meta` shared layer** — the current workflow's technique shadows a same-named `meta` one.
2. **Whole-technique reference** (no nested segment) — deliver the technique's own body (capability, flow, inputs, protocol, outputs) and auto-include its rules.
3. **Nested reference** — try a `{group}/{sub}.md` nested technique first (current-workflow-first, then `meta`); deliver its body and auto-include its rules.
4. **Rule reference** — if no nested technique matches, match the trailing segment against the technique's rules. A direct name match resolves to that rule. A group prefix `{group}` expands to every `{group}-*` rule.
5. **Unresolved** — a reference that matches none of the above surfaces explicitly; it is never silently dropped.

### Rules come along automatically

When a technique is resolved, its remaining rules — those not already explicitly requested — are appended as rule entries. This lets an activity reference a single technique and still receive the technique's invariants without enumerating every rule.

### The three buckets

The result of resolving a list of references is a bundle grouped into three buckets:

* **`techniques`** — keyed by full path (`{workflow}/{technique}` or `{technique}`, with `::{sub}` appended for a nested technique) → technique body.
* **`rules`** — a flat array of `[rule-name, rule-line]` tuples (one tuple per line).
* **`unresolved`** — references that did not resolve.

Empty buckets are omitted. The lookup is structural and requires no session token; most clients receive it indirectly through the bundles that `get_workflow` and `get_activity` produce, which [the delivery model](delivery-model.md#what-a-role-receives) describes.

## How an ancestor's protocol wraps a descendant's

When a technique is delivered, an ancestor container's `Initial` and `Final` protocol blocks wrap the descendant's protocol recursively. Every ancestor along the path — the workflow-root `TECHNIQUE.md` and each containing group's `TECHNIQUE.md` — contributes its `Initial` blocks (before) and `Final` blocks (after) the technique's own protocol. The server renumbers the combined sequence for display. Any other ancestor block is parent-only: it appears solely when that ancestor is referenced directly.

## The shared meta layer

The behaviours every workflow needs — how the engine advances, how agents are expected to conduct themselves — are written once in a shared workflow called `meta`, so no other workflow has to restate them.

Resolution therefore looks in two places, in order: the current workflow's own technique folder first, and the shared layer second. A workflow that defines a technique under a name the shared layer also uses shadows the shared one, which is how a workflow overrides a standard behaviour without the shared copy having to know about it.

## Techniques declared at the workflow level

A workflow declares techniques partitioned by audience, mirroring `rules`. `techniques.workflow` is for the orchestrator; `techniques.activity` is inherited by every activity.

The orchestrator's set arrives in the `get_workflow` technique bundle rather than as a separate preamble. Before any activity has opened, `get_technique` returns the composed body of the first `techniques.workflow` entry.

The activity set is injected into every `get_activity` technique bundle, ahead of the activity's own `techniques[]`. So a technique common to all activities — variable binding, say — is declared once at the workflow level instead of repeated on each one.

## Resources

Even with techniques tightly scoped, large reference material (Git CLI tutorials, API guides, templates) does not belong inline. A technique references a resource by id through a normal markdown hyperlink in its content — a template linked from an Input or Output, for instance. When the server projects a technique for delivery, it **rewrites those resource hyperlinks into `get_resource`-callable refs**: the bare id form `{id}[#section]`, or the cross-workflow form `{workflow}/{id}[#section]`. Technique links are left untouched.

Server responses do not bundle resource bodies by default. The agent loads a resource when it needs it.

## Loading a resource when it is needed

When an agent reaches a resource reference it needs, it asks for it:

```javascript
get_resource({ session_index, resource_id: "meta/activity-worker-prompt" })
```

The server resolves the reference:

* **Bare slugs** (for example `"review-mode"`) resolve within the session's workflow.
* **Prefixed references** (for example `"meta/activity-worker-prompt"`) resolve from the named namespace. The prefix is the longest leading run of segments naming one, so `"shared/indexer/index-reading"` reads the namespace `shared/indexer` and the slug `index-reading`.

### Narrowing to one section

An optional `#section` anchor — a GitHub-style heading slug — narrows the result to that section and its body. That is how a technique fetches just the template it references without the whole file. The content is loaded from the named workflow's own `resources/{slug}.md` and returned alongside the resource `id` and `version`.

A refetch of a body the calling context already holds can collapse to a short marker instead. [Reference delivery](delivery-model.md#reference-delivery) carries that contract, including that a bare id and a sectioned id occupy independent ledger keys. Either way, each call appends a `resource_fetched` history event.

### What this buys

- An agent carries only the guides the technique in front of it actually cites.
- A guide with several callers — how to format a pull request, how to drive the Git command line — is written once and linked from every technique that needs it, across any number of workflows.
- The prefixed form lets a technique in one workflow reach the shared library in `meta`, so a resource is reused rather than copied.
