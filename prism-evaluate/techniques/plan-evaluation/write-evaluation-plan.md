---
metadata:
  version: 2.0.0
---

## Capability

Renders the settled plan as the human-readable document a reader approves the evaluation from.

## Inputs

### target_summary

A summary of the target's scope, goals, and major content.

### structure_inventory

Sections or modules with their sizes.

### key_topics

The target's key topics and claims.

## Outputs

### evaluation_plan

The composed evaluation plan document.

#### artifact

`evaluation-plan.md`

#### audience

`human`

#### target_overview

The target's classification and structure.

#### dimension_mapping

Each dimension's lens configuration and analysis focus.

### evaluation_plan_path

The written `evaluation-plan.md` path.

## Protocol

### 1. Compose the Plan

- Compose `{evaluation_plan}` per the [Evaluation Plan Template](../../resources/evaluation-plan-template.md#evaluation-plan-template), populating `{evaluation_plan.target_overview}` from `{target_type}`, `{target_summary}`, `{structure_inventory}` and `{key_topics}`, and `{evaluation_plan.dimension_mapping}` from `{dimension_plan}` and `{execution_groups}`.

### 2. Write It Out

- Write `{evaluation_plan}` into `{output_path}` and record `{evaluation_plan_path}`.
