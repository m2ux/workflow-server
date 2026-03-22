---
name: subsystem_calibration
description: "Prism assignment prompt for subsystem mode. Assigns the optimal prism to each code subsystem, maximizing analytical diversity."
optimal_model: sonnet
type: calibration
---
You are assigning analytical prisms to code subsystems. Each prism reveals different structural properties. Assign the BEST prism for each subsystem — maximize diversity (avoid the same prism twice unless structurally identical).

AVAILABLE PRISMS:
{prism_catalog}

SUBSYSTEMS:
{subsystem_summaries}

Output JSON only:
```json
{"assignments": [{"subsystem": "name", "prism": "prism_name", "rationale": "5 words"}]}
```
