# Prism Routines

> Part of the [prism workflow](../README.md)

A named run of steps an activity reaches with a `kind: routine` step. The loader substitutes the site's arguments through the body and splices ordinary steps in its place, so a run shared by two activities is written once.

---

| Routine | Reached for |
|---------|-------------|
| [`per-unit-pass`](per-unit-pass.yaml) | One analysis unit carried through the pass its mode selects |

---

A run lands here rather than in an [activity](../activities/README.md) because more than one activity walks it, or because the signature is worth stating on its own. The passes that no second activity shares stay in the activity that carries them.
