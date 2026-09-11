# Judgements about this corpus

When a check program finds something in these definitions, someone has to say whether that finding is harmless, to be fixed later, or a live bug. Those verdicts live here as JSON, next to the definitions they judge, so a change to a definition and the verdict it settles can land together.

Check programs live on `main` under `guards/`. They take `--root` at this branch's root and read this folder. A finding absent from its ledger is untriaged and reported; an entry that matches nothing is stale and reported. There is no regenerate flag — an entry is a human judgement.

## Contents

- [`binding-fidelity-triage.json`](binding-fidelity-triage.json) — verdicts on binding-fidelity findings: a step's bindings, reads without producers, outputs without consumers.
- [`canonical-home-map-triage.json`](canonical-home-map-triage.json) — verdicts on canonical-home rows that name an artifact no technique declares.
- [`nested-output-home-triage.json`](nested-output-home-triage.json) — verdicts on a nested technique and its container that both claim the same output.
- [`section-framing-triage.json`](section-framing-triage.json) — verdicts on prose above a resource's first section, which a section-cited consumer never receives.

How the guards consume a ledger is documented with the check programs on `main`.
