# Review Taxonomy

The single source for the over-engineering tags, the one-line-per-finding format, and the scoreboard that closes a review. Scope is over-engineering only — correctness, security, and performance belong to the safety floor and are never tagged here.

---

## Tags

Five tags classify every over-engineering finding. Each names the simpler rung that would replace the construct.

- **delete** — The construct can be removed outright; nothing depends on it. Dead code, an unused parameter, a flag no path reads, a comment that restates the line below it, a comment/doc block whose bulk dwarfs the code it annotates with no unique why, or a speculative feature / unused flexibility that no path actually needs.
  *Example:* `L42: delete unused 'verbose' parameter — no caller passes it.`
  *Example:* `L52-71: delete retry wrapper around an idempotent local call — nothing replaces it.`
  *Example:* `L10-40: delete 30-line comment block above a 5-line function — restates the signature.`
- **stdlib** — A hand-rolled block reimplements something the standard library already provides. Replace the block with the library call.
  *Example:* `L88: stdlib hand-rolled dedup loop — use a set.`
- **native** — A dependency or hand-written code does what the platform already covers — either reimplementing a platform feature by hand, or pulling a dependency for what a native primitive already does. Drop the dependency or replace the construct with the native form.
  *Example:* `L15: native manual null-check chain — use optional chaining.`
  *Example:* `L4: native moment.js imported for one format call — Intl.DateTimeFormat, 0 deps.`
- **yagni** — An abstraction, generality, or extension point with no present, concrete caller. Collapse it to the one concrete case that exists.
  *Example:* `L60: yagni factory with one product — inline the single constructor.`
- **shrink** — The logic is needed but expressed in more code than it requires. Tighten it without changing behaviour. Includes a useful why-comment that should stay but must be cut down to match the size of the code it annotates.
  *Example:* `L31: shrink 12-line if/else ladder — table lookup in 3.`
  *Example:* `L8-20: shrink comment to one why-line — keep rationale, drop narration.`

### Comment proportionality

Comment and doc-block bulk must stay proportional to the surrounding code. A why-rationale is in scope for lean-coding; a block larger than the code it annotates is a hard trim finding (`delete` or `shrink`) — not excused because it “explains why.”

---

## Finding Format

One line per finding, no prose paragraphs:

```
L<line>: <tag> <what>. <replacement>.
```

For a multi-file diff or repo-wide pass, prefix the location with the file:

```
<file>:L<line>: <tag> <what>. <replacement>.
```

The line reference locates it, the tag classifies it, `<what>` names the construct, and `<replacement>` names the simpler rung. A higher intensity lowers the bar for what is flagged: an `ultra` pass flags any construct a lazier rung could replace, a `lite` pass flags only the clear wins.

---

## Scoreboard

A review closes with one scoreboard line summing the savings across all findings:

```
net: -<N> lines possible.
```

When the change carries no over-engineering, the scoreboard states it plainly:

```
Lean already. Ship.
```

A repo-wide audit extends the scoreboard with the dependencies it would drop: `net: -<N> lines, -<M> deps`.
