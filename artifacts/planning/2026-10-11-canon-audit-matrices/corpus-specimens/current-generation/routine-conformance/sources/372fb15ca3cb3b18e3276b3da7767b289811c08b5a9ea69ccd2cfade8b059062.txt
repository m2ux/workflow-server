---
metadata:
  version: 1.0.0
---

## Capability

The question domains this run elicits across, drawn from the reference and narrowed to what the stakeholder discussion left open.

## Inputs

### stakeholder_baseline

The stakeholder discussion the questions build on, or the recorded limitation that none was held.

## Outputs

### question_domains

The domains this run poses questions from, in the order the [Question Domain Reference](../../resources/requirements-elicitation.md#question-domain-reference) sets them out.

## Protocol

### 1. Select the Domains

- Take the domains from the [Question Domain Reference](../../resources/requirements-elicitation.md#question-domain-reference) and emit them as `{question_domains}`, keeping the reference's order so the problem is explored before its scope is bounded
  > Where `{stakeholder_baseline}` already settles a domain outright, that domain is dropped from the set rather than posed and skipped, so the loop's length reflects the work left to do.
