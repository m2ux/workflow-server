# Applicable Constructs

Schema constructs for simplifying `workflow-design` planning artifacts so checkpoint decisions stay easy to make.

| Construct | Why it applies | Reference |
|-----------|----------------|-----------|
| **Technique protocol / outputs + artifact** | Persist steps define artifact content; tighten what is written and how outputs are described | `intake-classification`, `context-loading`, `persist-design-specification`, `impact-analysis`, `scope-definition`, audit/persist techniques |
| **Checkpoint step** (`message`, `options[]`) | Messages link planning files for user choices; keep links few and subjects clear | Intake, requirements, impact, scope-and-draft, quality-review checkpoints |
| **Action `message`** | Surfaces overview text that points at README sections | `present-problem-overview` companion messages |
| **Resource markdown** | Templates/guides that shape README and completion artifacts | `design-context-readme`, `completion-artifact`, related guides |
| **Workflow / activity variables** | Path variables (`*_path`) that checkpoints interpolate | `structural_inventory_path`, `specification_path`, etc. |
| **Condition / transition** | Unchanged routing unless a slimmed artifact drops a gate dependency | Existing update-mode flow |

## Write-time constraints (this change)

- Prefer salient decision facts over exhaustive dumps (`Description Hygiene` / anti-pattern family).
- `link-named-artifacts` — keep labeled path links; do not replace with bare filenames.
- `statement-not-question` — checkpoint messages stay statements.
- `session-interaction-in-technique` — techniques produce/persist; activities present.
