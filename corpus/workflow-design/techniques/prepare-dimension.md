---
metadata:
  version: 1.0.1
---

## Capability

Markdown-ready elicitation prompt for a single design dimension from the elicitation guide.

## Inputs

### current_dimension

The design dimension to elicit — one of the dimensions listed in [Dimensions](../resources/elicitation-guide.md#dimensions).

### design_context

*(optional)* Reference workflows, integration points, operators and triggers the reader supplied before elicitation began. Where it is present, a dimension it already answers is confirmed rather than asked from scratch; where it is absent, every dimension is elicited unaided.

## Outputs

### dimension_questions

Markdown prompt for `{current_dimension}`: the guide's questions for that dimension. Includes only questions still needed (skip follow-ups already settled by prior answers available as inputs or prior captures).

## Protocol

### 1. Load Dimension Guide

- Load the [Dimensions](../resources/elicitation-guide.md#dimensions) entry for `{current_dimension}` — sole source of questions and capture depth for this dimension

### 2. Assemble Questions

- Assemble `{dimension_questions}` as markdown: the questions needed to capture the dimension at the guide's Capture depth; omit follow-ups already settled by prior answers available as inputs or prior captures
