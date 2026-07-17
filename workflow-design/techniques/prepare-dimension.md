---
metadata:
  version: 1.0.1
---

## Capability

Prepare the elicitation questions for a single design dimension from the [elicitation-guide](../resources/elicitation-guide.md), as a markdown-ready prompt the activity can surface.

## Inputs

### current_dimension

The design dimension to elicit — one of the dimensions listed in the [elicitation-guide](../resources/elicitation-guide.md).

## Outputs

### dimension_questions

Markdown prompt for `{current_dimension}`: the guide's questions for that dimension. Includes only questions still needed (skip follow-ups already settled by prior answers available as inputs or prior captures).

## Protocol

### 1. Load Dimension Guide

- Load the [elicitation-guide](../resources/elicitation-guide.md) entry for `{current_dimension}` — sole source of questions and capture depth for this dimension

### 2. Assemble Questions

- Assemble `{dimension_questions}` as markdown: the questions needed to capture the dimension at the guide's Capture depth; omit follow-ups already settled by prior answers available as inputs or prior captures
