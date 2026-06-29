# Ponytail Marker Convention

The single source for how a deliberate simplification is marked in code so it can be harvested later. A ponytail marker is an inline comment that records a ceiling — a point where the lazy solution stops — together with the trigger that would justify climbing past it.

---

## Convention

A deliberate simplification carries an inline comment in this form:

```
ponytail: <ceiling>, add when <upgrade-trigger>
```

The marker token is `ponytail:` in an inline comment, so it is greppable across any language. The comment leader is whatever the language uses — the token is matched as `(#|//) ?ponytail:`, covering hash-comment and slash-comment languages alike.

- **`<ceiling>`** — what the lazy choice stops short of: a hard-coded value, a skipped abstraction, a narrowed scope, a single-case implementation. The ceiling states what the code does *not* do yet, and why that is fine for now.
- **`<upgrade-trigger>`** — the concrete, observable condition that would justify climbing past the ceiling: a third caller appears, the value needs to vary, a second product is added. The trigger turns the ceiling from a guess into a tracked decision with a defined exit.

Examples:

```python
# ponytail: hard-coded page size 50, add when a caller needs a different size
SELECT * FROM rows LIMIT 50
```

```rust
// ponytail: single concrete handler, add a trait when a second backend exists
fn handle(req: Request) -> Response { ... }
```

**Output discipline.** A marker is one line. It records the ceiling and the trigger and nothing else — no apology, no essay, no restating what the code does. The marker is the harvestable record; the prose stays out of it.

---

## No Trigger

A ceiling with no defined exit is debt that can never be paid down — it rots into "never." A marker that records a ceiling but no upgrade trigger is flagged `no-trigger` when the debt ledger is harvested:

```
ponytail: hard-coded page size 50
```

This marker is incomplete. It says where the lazy solution stops but not what would justify going further, so no one can tell whether the ceiling is still appropriate or long overdue for a climb. Every flagged `no-trigger` marker should be given a concrete trigger, turning a stalled ceiling into a tracked decision.
