# Themes

A theme is a destination that outlives any one initiative. It is a label, not an issue and not a
Project. Scrum does not define Theme. In Atlassian’s extra Plans levels, a theme is an
organizational destination you do not close.

The test used here: it persists after a batch closes, it still attracts new initiatives, and it
names a destination rather than a mechanism.

## The four labels

Inferred from the 2026-08 epic wave, the I00/I01 redistribution, and the planning-folder density
since.

**`theme:mechanical`** — a program walks the run. Runner, session record, compiled delivery; later
fan-out and parallel as runtime. Driven by #523, I00 E04–E06 and E08–E10, decision path (#400 /
I01 E01).

**`theme:language`** — the corpus is a typed language. Predicates, definition shape, typed
definitions; later routines, fragments, expression work. Driven by #526, #513, #520, I00 E01–E03
and E07; I03.

**`theme:delivery`** — a context receives only the grain it can use, at a known cost. Driven by
#404 Delivery Cost, #398 Section Delivery, #399 Shared Homes, #436 Engine Surfaces, I00 E09 /
I01 E03, token benches, batched dispatch, startup-cost folders. Compiled delivery is one initiative
on this pillar, not the pillar.

**`theme:canon`** — the written standard is binding, and each artifact has a declared reader.
Driven by #403 Artifact Audience, #438 Review by Definition, the plain-language mandate, and the
2026-09 work-package / meta canon-audit cluster. Distinct from `language`: types and signatures
versus prose, audience, and review.

Name it **canon, not corpus**. This repo already uses that pair as two surfaces (routines-sweeps:
corpus definitions versus the rules and the canon). `language` already claims the corpus as its
object. A `theme:corpus` would stamp every definition-side initiative. A work-package audit edits
corpus files *in service of* the standard — tag the destination, not the tree. Canon also covers
artifacts that are not corpus at all (issues, PRs, planning prose).

An initiative can carry more than one. I00 is mechanical + language + delivery. I01 is mostly
canon, with delivery on the shared-homes epic and reach unthemed. I02 is language. I03 is
language. I04 is canon, with delivery on the continue-path and coverage-walk epics.

The four labels exist on the repo. They are not yet applied to issues.

## A Project per theme

Orthogonality is the reason not to. A theme crosses homes; a Project owns Status. I00 would sit on
three theme boards at once — three Status columns for one tree. Project fields are per-board
([community #158094](https://github.com/orgs/community/discussions/158094)). Themes never close, so
four theme Projects are four standing boards of a slice.

What orthogonality wants is a query: `label:theme:delivery`. A later portfolio board that holds
only Initiative issues, with theme as a multi-select, is the cheap durable URL. Dual-home the
initiative, never the work items. That board is not created in this pass.

## Not themes

**Reach** (#310 / I01 E04) — one epic. Watch until a second initiative serves it.

**Hardening** (#437, lockfile, HTTP) — standing operability.

**Fidelity / “the orchestrator is a program”** — the reason mechanical and language exist. If you
label it, every I00 item carries it.

**One home / output economy** — already design principles 6 and 12 in the workflow-design canon.
Do not duplicate them as theme labels.
