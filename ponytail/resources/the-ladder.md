# The Ladder

The lazy senior developer's discipline: the best code is the code that is never written. Lazy here means efficient, not careless — every line that exists is a line to read, test, secure, and maintain, so the leanest solution that still works is the best one. This resource is the single source for the rungs of the ladder, the order they are climbed, and the safety floor that no rung may climb past.

---

## Understand First

A rung is never chosen against a guess at the problem. Before climbing, the real end-to-end flow the change touches is read and traced: the entry path, the data it carries, and the exit and error paths.

- **Read the code fully.** Not the function under the cursor — the flow it sits inside. What calls it, what it returns into, what happens when it fails.
- **Trace the real path end to end.** Follow the data from the entry point through to where it leaves or errors. The rung that fits is the one that fits the actual flow, not the imagined one.
- **Understand before you climb.** If the problem cannot yet be stated plainly, it is not yet understood — and understanding it is the first obligation, a [safety-floor](#safety-floor) obligation, not an optional preamble. The reading and tracing above are how the understanding is reached; the rung is chosen only once they hold.

A bug fix follows the same rule, one level deeper: fix the root cause, not the symptom, and grep every caller before changing a shared signature. Climbing without understanding produces a lean solution to the wrong problem.

---

## Rungs

Climb from the laziest rung down, and stop at the highest rung that solves the understood problem. When two rungs both solve it, take the higher (lazier) one.

1. **Does it need to exist?** (YAGNI) The laziest rung. Often the requirement dissolves once the real flow is understood, or the case is already handled. Code not written is the cheapest code there is.
2. **Reuse an in-repo helper.** Something in the codebase already does this, or most of it. Find it and call it before writing a second copy.
3. **Reach for the standard library.** The language ships a function, type, or module that covers the case. Use it before hand-rolling.
4. **Reach for a native platform feature.** A language native or platform primitive (a built-in operator, a runtime capability, a framework hook) does the work without added code.
5. **Lean on an already-installed dependency.** A dependency the project already pulls in covers the case. Use it before adding a new one — a new dependency must earn its place against a present, concrete need.
6. **Write the one line.** No abstraction, no helper, no indirection — the single expression that does it.
7. **Write the minimum code that works.** The floor rung: the smallest correct implementation, with no abstraction introduced before a second concrete case exists — inline it until a second one exists. No interface with one implementation, no factory for one product.

Deletion is preferred over addition at every rung. Removing code, dependencies, or indirection counts as progress; adding any of them must earn its place.

---

## Safety Floor

The safety floor is never simplified away. No rung above is climbed at the cost of any obligation below — these are not rungs to climb past, they are the ground the ladder stands on.

- **Understand the problem first.** The [understand-first](#understand-first) trace is itself part of the floor — a lean solution to a misunderstood problem is not lean, it is wrong.
- **Input validation at trust boundaries.** Data crossing a trust boundary (user input, network, file, IPC) is validated before it is trusted. Internal calls between trusted code do not need the same ceremony.
- **Error handling that prevents data loss.** Failures that could lose or corrupt data are handled. A swallowed error that drops a write is never the lazy choice.
- **Security.** Authn/authz, secret handling, injection defences, and the like are never thinned to save lines.
- **Accessibility.** User-facing affordances stay accessible; accessibility is not an over-engineering finding.
- **Hardware calibration.** Where the code drives or reads hardware, calibration and tolerances stand.
- **Anything explicitly requested.** A behaviour the user asked for is in scope by definition and is never simplified away as "unnecessary."
- **One runnable assert-based check.** Any non-trivial logic carries one runnable check — the smallest thing that fails if the logic breaks: an assert-based `demo()`/`__main__` self-check or one small test file. No frameworks, no fixtures, no per-function suites unless asked. Trivial one-liners need no test; YAGNI applies to tests too.

Everything else is fair game for the ladder. Correctness, security, and performance live here on the floor, which is why the over-engineering review leaves them out of scope: the floor already protects them.
