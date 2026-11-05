# Measured Integration Flows

PR #1641 at `dc1b274f9176a8d562ada4748c7bb89028532d1b`, against `03d353300ca4804194fd50d316d73e3bf1270d1d`.

All 33 affected static processes reported by GitNexus are represented below. The 144 ordered membership rows supply the sequences. Each arrow means the next indexed step, not an observed runtime invocation. Green identifies symbols in the measured change surface; grey identifies context. Short processes retain their actual symbol count.

Native ranked searches and their limits are preserved in the measurement archive; exact process-membership queries supply these complete reported paths. Analyzer coverage warnings mean unreported paths can still exist.

## 1. Main → Anchor_of

Process `proc_4_main` has 7 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P2 as citation_kinds
    participant P3 as procedure_spans
    end
    box rgb(245,245,245) Context
    participant P0 as main
    participant P1 as citations
    participant P4 as specification_spans
    participant P5 as specifications
    participant P6 as anchor_of
    end
    Note over P0: Indexed entry: main
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
    P4->>P5: Indexed step 6
    P5->>P6: Indexed step 7
```

- **Step 1: [main](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1332).**
  skills/scripts/check_skill_files.py.
- **Step 2: [citations](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L427).**
  skills/scripts/check_skill_files.py.
- **Step 3: [citation_kinds](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1252).**
  skills/scripts/check_skill_files.py.
- **Step 4: [procedure_spans](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L405).**
  skills/scripts/check_skill_files.py.
- **Step 5: [specification_spans](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L387).**
  skills/scripts/check_skill_files.py.
- **Step 6: [specifications](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L371).**
  skills/scripts/check_skill_files.py.
- **Step 7: [anchor_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L179).**
  skills/scripts/check_skill_files.py.

## 2. Main → Heading_end

Process `proc_17_main` has 6 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P2 as citation_kinds
    participant P3 as procedure_spans
    participant P4 as procedure_headings
    participant P5 as heading_end
    end
    box rgb(245,245,245) Context
    participant P0 as main
    participant P1 as citations
    end
    Note over P0: Indexed entry: main
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
    P4->>P5: Indexed step 6
```

- **Step 1: [main](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1332).**
  skills/scripts/check_skill_files.py.
- **Step 2: [citations](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L427).**
  skills/scripts/check_skill_files.py.
- **Step 3: [citation_kinds](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1252).**
  skills/scripts/check_skill_files.py.
- **Step 4: [procedure_spans](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L405).**
  skills/scripts/check_skill_files.py.
- **Step 5: [procedure_headings](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L457).**
  skills/scripts/check_skill_files.py.
- **Step 6: [heading_end](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L452).**
  skills/scripts/check_skill_files.py.

## 3. Main → Scan_blocks

Process `proc_18_main` has 6 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P2 as citation_kinds
    participant P4 as parse
    participant P5 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P0 as main
    participant P1 as citations
    participant P3 as scan
    end
    Note over P0: Indexed entry: main
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
    P4->>P5: Indexed step 6
```

- **Step 1: [main](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1332).**
  skills/scripts/check_skill_files.py.
- **Step 2: [citations](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L427).**
  skills/scripts/check_skill_files.py.
- **Step 3: [citation_kinds](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1252).**
  skills/scripts/check_skill_files.py.
- **Step 4: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 5: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 6: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 4. Main → Validate_structure_entry

Process `proc_19_main` has 6 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P2 as contract
    participant P4 as loaded
    participant P5 as validate_structure_entry
    end
    box rgb(245,245,245) Context
    participant P0 as main
    participant P1 as citations
    participant P3 as structure_at
    end
    Note over P0: Indexed entry: main
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
    P4->>P5: Indexed step 6
```

- **Step 1: [main](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1332).**
  skills/scripts/check_skill_files.py.
- **Step 2: [citations](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L427).**
  skills/scripts/check_skill_files.py.
- **Step 3: [contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L360).**
  skills/scripts/check_skill_files.py.
- **Step 4: [structure_at](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L287).**
  skills/scripts/check_skill_files.py.
- **Step 5: [loaded](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L303).**
  skills/scripts/check_skill_files.py.
- **Step 6: [validate_structure_entry](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L317).**
  skills/scripts/check_skill_files.py.

## 5. Check → Named

Process `proc_60_check` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as check
    end
    box rgb(245,245,245) Context
    participant P1 as report
    participant P2 as finding
    participant P3 as named
    end
    Note over P0: Indexed entry: check
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [check](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L632).**
  skills/scripts/check_skill_files.py.
- **Step 2: [report](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L639).**
  skills/scripts/check_skill_files.py.
- **Step 3: [finding](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L782).**
  skills/scripts/check_skill_files.py.
- **Step 4: [named](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L184).**
  skills/scripts/check_skill_files.py.

## 6. Interfaces → Script_of

Process `proc_84_interfaces` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as interfaces
    participant P1 as html_interfaces
    end
    box rgb(245,245,245) Context
    participant P2 as script_of
    end
    Note over P0: Indexed entry: interfaces
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [interfaces](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L912).**
  skills/scripts/check_skill_files.py.
- **Step 2: [html_interfaces](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L611).**
  skills/scripts/check_skill_files.py.
- **Step 3: [script_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L903).**
  skills/scripts/check_skill_files.py.

## 7. Retired_terms → Vocabulary

Process `proc_86_retired_terms` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as retired_terms
    end
    box rgb(245,245,245) Context
    participant P1 as declaration_at
    participant P2 as vocabulary
    end
    Note over P0: Indexed entry: retired_terms
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [retired_terms](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L842).**
  skills/scripts/check_skill_files.py.
- **Step 2: [declaration_at](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L812).**
  skills/scripts/check_skill_files.py.
- **Step 3: [vocabulary](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L827).**
  skills/scripts/check_skill_files.py.

## 8. Reach → Anchor_of

Process `proc_119_reach` has 6 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P1 as citation_kinds
    participant P2 as procedure_spans
    end
    box rgb(245,245,245) Context
    participant P0 as reach
    participant P3 as specification_spans
    participant P4 as specifications
    participant P5 as anchor_of
    end
    Note over P0: Indexed entry: reach
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
    P4->>P5: Indexed step 6
```

- **Step 1: [reach](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1288).**
  skills/scripts/check_skill_files.py.
- **Step 2: [citation_kinds](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1252).**
  skills/scripts/check_skill_files.py.
- **Step 3: [procedure_spans](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L405).**
  skills/scripts/check_skill_files.py.
- **Step 4: [specification_spans](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L387).**
  skills/scripts/check_skill_files.py.
- **Step 5: [specifications](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L371).**
  skills/scripts/check_skill_files.py.
- **Step 6: [anchor_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L179).**
  skills/scripts/check_skill_files.py.

## 9. Reach → Heading_end

Process `proc_129_reach` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P1 as citation_kinds
    participant P2 as procedure_spans
    participant P3 as procedure_headings
    participant P4 as heading_end
    end
    box rgb(245,245,245) Context
    participant P0 as reach
    end
    Note over P0: Indexed entry: reach
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [reach](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1288).**
  skills/scripts/check_skill_files.py.
- **Step 2: [citation_kinds](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1252).**
  skills/scripts/check_skill_files.py.
- **Step 3: [procedure_spans](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L405).**
  skills/scripts/check_skill_files.py.
- **Step 4: [procedure_headings](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L457).**
  skills/scripts/check_skill_files.py.
- **Step 5: [heading_end](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L452).**
  skills/scripts/check_skill_files.py.

## 10. Doubled_conventions → Scan_blocks

Process `proc_130_doubled_conventions` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P1 as labelled_rules
    participant P3 as parse
    participant P4 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P0 as doubled_conventions
    participant P2 as scan
    end
    Note over P0: Indexed entry: doubled_conventions
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [doubled_conventions](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L891).**
  skills/scripts/check_skill_files.py.
- **Step 2: [labelled_rules](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L862).**
  skills/scripts/check_skill_files.py.
- **Step 3: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 4: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 5: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 11. Interfaces → Validate_structure_entry

Process `proc_131_interfaces` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as interfaces
    participant P1 as contract
    participant P3 as loaded
    participant P4 as validate_structure_entry
    end
    box rgb(245,245,245) Context
    participant P2 as structure_at
    end
    Note over P0: Indexed entry: interfaces
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [interfaces](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L912).**
  skills/scripts/check_skill_files.py.
- **Step 2: [contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L360).**
  skills/scripts/check_skill_files.py.
- **Step 3: [structure_at](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L287).**
  skills/scripts/check_skill_files.py.
- **Step 4: [loaded](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L303).**
  skills/scripts/check_skill_files.py.
- **Step 5: [validate_structure_entry](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L317).**
  skills/scripts/check_skill_files.py.

## 12. Interfaces → Named

Process `proc_155_interfaces` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as interfaces
    participant P1 as html_interfaces
    end
    box rgb(245,245,245) Context
    participant P2 as finding
    participant P3 as named
    end
    Note over P0: Indexed entry: interfaces
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [interfaces](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L912).**
  skills/scripts/check_skill_files.py.
- **Step 2: [html_interfaces](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L611).**
  skills/scripts/check_skill_files.py.
- **Step 3: [finding](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L782).**
  skills/scripts/check_skill_files.py.
- **Step 4: [named](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L184).**
  skills/scripts/check_skill_files.py.

## 13. Mode_commands → Anchor_of

Process `proc_168_mode_commands` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as mode_commands
    end
    box rgb(245,245,245) Context
    participant P1 as specification_spans
    participant P2 as specifications
    participant P3 as anchor_of
    end
    Note over P0: Indexed entry: mode_commands
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [mode_commands](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L795).**
  skills/scripts/check_skill_files.py.
- **Step 2: [specification_spans](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L387).**
  skills/scripts/check_skill_files.py.
- **Step 3: [specifications](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L371).**
  skills/scripts/check_skill_files.py.
- **Step 4: [anchor_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L179).**
  skills/scripts/check_skill_files.py.

## 14. Interfaces → Heading_end

Process `proc_175_interfaces` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as interfaces
    participant P1 as html_interfaces
    participant P2 as procedure_headings
    participant P3 as heading_end
    end
    Note over P0: Indexed entry: interfaces
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [interfaces](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L912).**
  skills/scripts/check_skill_files.py.
- **Step 2: [html_interfaces](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L611).**
  skills/scripts/check_skill_files.py.
- **Step 3: [procedure_headings](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L457).**
  skills/scripts/check_skill_files.py.
- **Step 4: [heading_end](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L452).**
  skills/scripts/check_skill_files.py.

## 15. Heading_model → Scan_blocks

Process `proc_176_heading_model` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as heading_model
    participant P1 as field_contract
    participant P3 as parse
    participant P4 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P2 as scan
    end
    Note over P0: Indexed entry: heading_model
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [heading_model](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L486).**
  skills/scripts/check_skill_files.py.
- **Step 2: [field_contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L469).**
  skills/scripts/check_skill_files.py.
- **Step 3: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 4: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 5: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 16. Mode_commands → Validate_structure_entry

Process `proc_177_mode_commands` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as mode_commands
    participant P1 as contract
    participant P3 as loaded
    participant P4 as validate_structure_entry
    end
    box rgb(245,245,245) Context
    participant P2 as structure_at
    end
    Note over P0: Indexed entry: mode_commands
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [mode_commands](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L795).**
  skills/scripts/check_skill_files.py.
- **Step 2: [contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L360).**
  skills/scripts/check_skill_files.py.
- **Step 3: [structure_at](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L287).**
  skills/scripts/check_skill_files.py.
- **Step 4: [loaded](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L303).**
  skills/scripts/check_skill_files.py.
- **Step 5: [validate_structure_entry](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L317).**
  skills/scripts/check_skill_files.py.

## 17. Doubled_conventions → Anchor_of

Process `proc_194_doubled_conventions` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P1 as labelled_rules
    end
    box rgb(245,245,245) Context
    participant P0 as doubled_conventions
    participant P2 as anchor_of
    end
    Note over P0: Indexed entry: doubled_conventions
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [doubled_conventions](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L891).**
  skills/scripts/check_skill_files.py.
- **Step 2: [labelled_rules](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L862).**
  skills/scripts/check_skill_files.py.
- **Step 3: [anchor_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L179).**
  skills/scripts/check_skill_files.py.

## 18. Heading_model → Heading_end

Process `proc_198_heading_model` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as heading_model
    participant P1 as procedure_headings
    participant P2 as heading_end
    end
    Note over P0: Indexed entry: heading_model
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [heading_model](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L486).**
  skills/scripts/check_skill_files.py.
- **Step 2: [procedure_headings](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L457).**
  skills/scripts/check_skill_files.py.
- **Step 3: [heading_end](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L452).**
  skills/scripts/check_skill_files.py.

## 19. Inline_commands → Scan_blocks

Process `proc_199_inline_commands` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as inline_commands
    participant P1 as field_contract
    participant P3 as parse
    participant P4 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P2 as scan
    end
    Note over P0: Indexed entry: inline_commands
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [inline_commands](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L555).**
  skills/scripts/check_skill_files.py.
- **Step 2: [field_contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L469).**
  skills/scripts/check_skill_files.py.
- **Step 3: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 4: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 5: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 20. Operation_calls → Validate_structure_entry

Process `proc_200_operation_calls` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as operation_calls
    participant P1 as contract
    participant P3 as loaded
    participant P4 as validate_structure_entry
    end
    box rgb(245,245,245) Context
    participant P2 as structure_at
    end
    Note over P0: Indexed entry: operation_calls
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [operation_calls](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L583).**
  skills/scripts/check_skill_files.py.
- **Step 2: [contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L360).**
  skills/scripts/check_skill_files.py.
- **Step 3: [structure_at](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L287).**
  skills/scripts/check_skill_files.py.
- **Step 4: [loaded](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L303).**
  skills/scripts/check_skill_files.py.
- **Step 5: [validate_structure_entry](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L317).**
  skills/scripts/check_skill_files.py.

## 21. Retired_terms → Named

Process `proc_206_retired_terms` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as retired_terms
    end
    box rgb(245,245,245) Context
    participant P1 as finding
    participant P2 as named
    end
    Note over P0: Indexed entry: retired_terms
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [retired_terms](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L842).**
  skills/scripts/check_skill_files.py.
- **Step 2: [finding](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L782).**
  skills/scripts/check_skill_files.py.
- **Step 3: [named](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L184).**
  skills/scripts/check_skill_files.py.

## 22. Heading_model → Anchor_of

Process `proc_210_heading_model` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as heading_model
    participant P1 as field_contract
    end
    box rgb(245,245,245) Context
    participant P2 as anchor_of
    end
    Note over P0: Indexed entry: heading_model
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [heading_model](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L486).**
  skills/scripts/check_skill_files.py.
- **Step 2: [field_contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L469).**
  skills/scripts/check_skill_files.py.
- **Step 3: [anchor_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L179).**
  skills/scripts/check_skill_files.py.

## 23. Reach → Scan_blocks

Process `proc_213_reach` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P1 as citation_kinds
    participant P3 as parse
    participant P4 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P0 as reach
    participant P2 as scan
    end
    Note over P0: Indexed entry: reach
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [reach](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1288).**
  skills/scripts/check_skill_files.py.
- **Step 2: [citation_kinds](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1252).**
  skills/scripts/check_skill_files.py.
- **Step 3: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 4: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 5: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 24. Reach → Validate_structure_entry

Process `proc_214_reach` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P1 as contract
    participant P3 as loaded
    participant P4 as validate_structure_entry
    end
    box rgb(245,245,245) Context
    participant P0 as reach
    participant P2 as structure_at
    end
    Note over P0: Indexed entry: reach
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [reach](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1288).**
  skills/scripts/check_skill_files.py.
- **Step 2: [contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L360).**
  skills/scripts/check_skill_files.py.
- **Step 3: [structure_at](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L287).**
  skills/scripts/check_skill_files.py.
- **Step 4: [loaded](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L303).**
  skills/scripts/check_skill_files.py.
- **Step 5: [validate_structure_entry](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L317).**
  skills/scripts/check_skill_files.py.

## 25. Inline_commands → Anchor_of

Process `proc_221_inline_commands` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as inline_commands
    participant P1 as field_contract
    end
    box rgb(245,245,245) Context
    participant P2 as anchor_of
    end
    Note over P0: Indexed entry: inline_commands
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [inline_commands](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L555).**
  skills/scripts/check_skill_files.py.
- **Step 2: [field_contract](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L469).**
  skills/scripts/check_skill_files.py.
- **Step 3: [anchor_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L179).**
  skills/scripts/check_skill_files.py.

## 26. Undecided_rules → Scan_blocks

Process `proc_223_undecided_rules` has 5 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P1 as labelled_rules
    participant P3 as parse
    participant P4 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P0 as undecided_rules
    participant P2 as scan
    end
    Note over P0: Indexed entry: undecided_rules
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
    P3->>P4: Indexed step 5
```

- **Step 1: [undecided_rules](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L949).**
  skills/scripts/check_skill_files.py.
- **Step 2: [labelled_rules](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L862).**
  skills/scripts/check_skill_files.py.
- **Step 3: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 4: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 5: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 27. Mixed_moods → Anchor_of

Process `proc_229_mixed_moods` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as mixed_moods
    end
    box rgb(245,245,245) Context
    participant P1 as specifications
    participant P2 as anchor_of
    end
    Note over P0: Indexed entry: mixed_moods
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [mixed_moods](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L1105).**
  skills/scripts/check_skill_files.py.
- **Step 2: [specifications](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L371).**
  skills/scripts/check_skill_files.py.
- **Step 3: [anchor_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L179).**
  skills/scripts/check_skill_files.py.

## 28. Anchors → Scan_blocks

Process `proc_231_anchors` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P2 as parse
    participant P3 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P0 as anchors
    participant P1 as scan
    end
    Note over P0: Indexed entry: anchors
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [anchors](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L642).**
  skills/scripts/check_skill_files.py.
- **Step 2: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 3: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 4: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 29. Interfaces → Scan_blocks

Process `proc_238_interfaces` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as interfaces
    participant P2 as parse
    participant P3 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P1 as scan
    end
    Note over P0: Indexed entry: interfaces
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [interfaces](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L912).**
  skills/scripts/check_skill_files.py.
- **Step 2: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 3: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 4: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 30. Undecided_rules → Anchor_of

Process `proc_243_undecided_rules` has 3 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P1 as labelled_rules
    end
    box rgb(245,245,245) Context
    participant P0 as undecided_rules
    participant P2 as anchor_of
    end
    Note over P0: Indexed entry: undecided_rules
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
```

- **Step 1: [undecided_rules](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L949).**
  skills/scripts/check_skill_files.py.
- **Step 2: [labelled_rules](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L862).**
  skills/scripts/check_skill_files.py.
- **Step 3: [anchor_of](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L179).**
  skills/scripts/check_skill_files.py.

## 31. Mode_commands → Scan_blocks

Process `proc_245_mode_commands` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as mode_commands
    participant P2 as parse
    participant P3 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P1 as scan
    end
    Note over P0: Indexed entry: mode_commands
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [mode_commands](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L795).**
  skills/scripts/check_skill_files.py.
- **Step 2: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 3: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 4: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 32. Operation_calls → Scan_blocks

Process `proc_252_operation_calls` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as operation_calls
    participant P2 as parse
    participant P3 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P1 as scan
    end
    Note over P0: Indexed entry: operation_calls
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [operation_calls](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L583).**
  skills/scripts/check_skill_files.py.
- **Step 2: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 3: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 4: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

## 33. Retired_terms → Scan_blocks

Process `proc_258_retired_terms` has 4 measured steps.

```mermaid
sequenceDiagram
    box rgb(200,230,201) Changed
    participant P0 as retired_terms
    participant P2 as parse
    participant P3 as scan_blocks
    end
    box rgb(245,245,245) Context
    participant P1 as scan
    end
    Note over P0: Indexed entry: retired_terms
    P0->>P1: Indexed step 2
    P1->>P2: Indexed step 3
    P2->>P3: Indexed step 4
```

- **Step 1: [retired_terms](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L842).**
  skills/scripts/check_skill_files.py.
- **Step 2: [scan](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L191).**
  skills/scripts/check_skill_files.py.
- **Step 3: [parse](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L252).**
  skills/scripts/check_skill_files.py.
- **Step 4: [scan_blocks](https://github.com/m2ux/workflow-server/blob/dc1b274f9176a8d562ada4748c7bb89028532d1b/skills/scripts/check_skill_files.py#L209).**
  skills/scripts/check_skill_files.py.

