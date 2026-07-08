# Comprehension Probes — Repeat Pass (Post-#166)

Date: 2026-07-08. Two fresh-agent probes on **real payloads captured from the live persistent-mode work-package walk** (see `payload-measurements.md`), targeting the two payload shapes that #166 changed most: a reference-mode `get_activity` response and a provenance-annotated composed `get_technique` response. Each probe received only the payload plus the minimal session context a real agent would have.

## Probe A — reference-mode get_activity (design-philosophy activity, `bundle_mode: reference`)

Payload: ~6.1k chars; four technique bundle entries + rules + activity_rules as `{ unchanged: true, content_hash }` markers, full activity body.

**Transmitted correctly:**

- Marker semantics: reuse prior-delivered content from own context, do **not** refetch — exactly the B1 intent; correctly enumerated both escape hatches (`get_technique { step_id, full: true }`, `get_activity { bundle: "full" }`).
- Checkpoint structure, option effects, transitions, gates.

**Failure/ambiguity classes:**

1. **Escape-hatch conflation.** For the ordinary next step (`define-problem`, a technique never yet delivered), the probe chose `get_technique { step_id, full: true }` — copying the *re-fetch* recipe from `bundle_note` for what is a plain first fetch. Harmless here (full is default-equivalent for a first fetch) but shows the note teaches "re-fetch" as the only fetch verb; the normal per-step fetch contract is not restated anywhere in the payload.
2. **Inert-field misreads persist at payload level (F3 residue).** The probe guessed the **server** applies `action: set` on the `kind: action` step ("I would guess the server/workflow engine applies it") and was unsure whether `autoAdvanceMs` auto-advance is server-driven or needs an agent call. B6's enforcement-model documentation lives in `schemas/README.md` / Zod descriptions — none of it rides the delivered payload, so a payload-only reader still infers engine behavior that does not exist.
3. **Content defect (new, F15-class):** the checkpoint `message` interpolates `{problem_complexity}`, but its default option `skip-optional` sets `path_gating_complexity: simple` and *not* `problem_complexity` — on the default path the message token has no producer. Probe flagged it unprompted.
4. Minor: `bundle_note`'s example omits `session_index`; `blocking: false` semantics unstated in-payload.

## Probe B — provenance-annotated composed get_technique (`reference-resolution`, step-bound)

Payload: ~3.3k chars; B2 `inherited_inputs` block with scope note, B3 `source:` lines, `provenance_note`.

**Transmitted correctly:**

- Protocol restated faithfully as a checklist; correct identification that **only** `discovered_path` is needed now, sourced from the named workflow variable — the B3 `source:` line did its job.
- The "produced later in the workflow, not yet available" annotations were read exactly as intended: forward declarations, not blockers. The original review's top failure class (F4 — inherited inputs read as required-now) **did not reproduce**.

**Failure/ambiguity classes:**

1. **Inconsistent provenance coverage confuses (B3 residue).** `branch_name`/`pr_number` carry no `source:` line (the "noteworthy-only" annotation policy), and the probe couldn't tell whether that meant missing, optional, or ambient — the *absence* of an annotation now reads as signal. Uniform annotation (or an explicit "ambient, no producer" default) would close it.
2. **Multi-output manifest encoding unspecified (F13 residue).** `provenance_note` says deliver outputs "by reporting it in your step-manifest `output`" — a single string per step. Asked to deliver `reference_path` + `component_name`, the probe **guessed** a JSON object keyed by output id. Reasonable, but explicitly a guess; no encoding is specified anywhere in the payload or the technique-protocol spec.
3. **`provenance_note` overclaims:** it references "the shown `destination:`" but no output in the payload has one (destination renders only on remapped outputs) — a note that describes machinery the reader cannot see.
4. Minor content nits: "monorepo root" not precisely defined; `.gitmodules` match rule underspecified.

## Verdict

The B2/B3 additions measurably transmit: both probes resolved input needs and forward-declared inherited inputs correctly — the original probes' failure classes 1 and 2 (inherited-required misread, unknown provenance) are gone. The residual failures are **specification gaps at the delivery seam** (multi-output encoding, escape-hatch vs normal fetch, uneven annotation coverage) and **payload-level enforcement ambiguity** (inert `actions`/`autoAdvanceMs` still look executable to a payload-only reader) — all addressable with note/renderer tweaks, none requiring schema change.
