# Applicable Constructs

Schema constructs for slimming `work-package` planning artifacts so checkpoint decisions stay easy to make.

| Construct | Why it applies | Reference |
|-----------|----------------|-----------|
| **Technique protocol / outputs + artifact** | Persist steps define artifact content; tighten what is written and how outputs are described | `implementation-analysis/document`, `research/document`, `review-assumptions/record`, `strategic-review/document-findings`, `plan-prepare/plan`, design-philosophy / finalize-documentation persist ops |
| **Checkpoint step** (`message`, `options[]`) | Messages link planning files for user choices; keep links few and subjects clear | Gates across design-philosophy → submit-for-review |
| **Action `message`** | Surfaces overview text that points at README sections | `present-*` companion messages |
| **Resource markdown** | Templates/guides that shape README and planning artifacts | `readme`, `wp-plan`, `implementation-analysis`, `assumptions-review`, `strategic-review`, related guides |
| **Workflow / activity variables** | Path variables (`*_path`) that checkpoints interpolate | Existing `*_path` bag vars |
| **Condition / transition** | Unchanged routing unless a slimmed artifact drops a gate dependency | Existing activity graph |

## Write-time constraints (this change)

- Prefer salient decision facts over exhaustive dumps (Description Hygiene / Output Economy).
- `link-named-artifacts` — keep labeled path links; do not replace with bare filenames.
- `statement-not-question` — checkpoint messages stay statements.
- `session-interaction-in-technique` — techniques produce/persist; activities present.
- No activity-graph / mode / transition redesign unless impact analysis proves a tiny message-only change is required.
