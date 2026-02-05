# Rules Migration Work Package

This folder contains planning artifacts for migrating missing agent guidelines from external AGENTS.md to the work-package workflow.

## Problem

The external AGENTS.md file (at agent-resources repo root) was not in the work-package workflow folder and was missed during the WP-006 guide migration. This left the workflow with incomplete agent behavioral rules.

## Solution

Migrate the missing rules from external AGENTS.md to:
- Work-package workflow rules array (critical rules)
- And/or create agent-guidelines guide document (comprehensive reference)

## Documents

- `START-HERE.md` - Quick reference and navigation
- `00-requirements-elicitation.md` - Elicited requirements (if needed)
- `01-implementation-analysis.md` - Current state analysis
- `03-work-package-plan.md` - Implementation plan

## References

- Issue: https://github.com/m2ux/workflow-server/issues/17
- Related: WP-006 (Migrate Guides) - https://github.com/m2ux/workflow-server/issues/6
- External AGENTS.md: https://github.com/m2ux/agent-resources/blob/main/AGENTS.md
