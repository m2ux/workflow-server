# Declared Style Model

## Declaration

Structure entries select sections and required sections. The model extends that same entry with `steps: "headings"`, `commands: "inline-html"`, `contracts: "Fields"`, required `preamble` link targets, and call-routing targets by directory. A `SKILL.md` file-name entry selects an entry point's layout. Declarations are validated as data; malformed or unsupported values fail the check before a partial model can run.

## Responsibilities

- The existing structure resolver owns file-to-model selection and declaration validation.
- A bounded HTML-block reader owns invocation boundaries and payload masking. It preserves text and distinguishes actual bold argument links from literal command syntax.
- The existing Markdown reader owns headings and ordinary links; HTML payload does not create headings or prose findings.
- Heading-step validation owns sequence, scope and flush detail. Contract validation owns linked Inputs/Outputs and their field destinations. Preamble and call checks own only their selected file contracts.
- Existing citation and interface checks consume the same selected model and invocation spans, retaining command reach, GraphQL REST-gap and Projects V2 checks.

## Baseline and Acceptance

At source 03d353300ca4804194fd50d316d73e3bf1270d1d, the full installed tree reports 81 files and 68 findings outside Work Planner. Work Planner reports zero findings. The complete baseline output is retained. Exact outside-finding equality is measured after implementation; root is reconciling the criterion's full-tree passing wording with this inherited baseline.

## Boundaries

The implementation extends the shared checker and its tests. Installed Work Planner model adoption and document conversion remain later plan work. No agent reading path changes in this task: declarations are exercised only in temporary specimen skills, and live document links and model files retain their bytes. No live disclosure walk is claimed.
