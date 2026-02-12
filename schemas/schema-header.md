# Workflow Schema Guide

This workflow system uses a Goal -> Activity -> Skill -> Tools metamodel.

- **Workflow** defines WHAT to do: an ordered sequence of activities with rules, variables, and modes.
- **Activity** defines WHEN to do it: a stage in the workflow that references skills and controls sequencing via transitions, checkpoints, and decisions.
- **Skill** defines HOW to do it: a reusable capability with protocol, tools, inputs/outputs, and rules.

The JSON Schema definitions below describe the exact field structure for each entity type. Apply them when interpreting workflow, activity, and skill data returned by subsequent tool calls.
