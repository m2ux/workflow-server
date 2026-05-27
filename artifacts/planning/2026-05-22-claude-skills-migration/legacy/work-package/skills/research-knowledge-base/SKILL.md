---
name: research-knowledge-base
description: Research the knowledge base and external sources for relevant patterns and resources.
metadata:
  ontology: legacy
  kind: skill
  version: 1.0.0
  order: 6
  legacy_id: 6
---

# Research Knowledge Base

## Capability

Research knowledge base and external sources to discover best practices, patterns, and resources

## Inputs

### requirements

Elicited requirements from the elicitation activity

### problem-statement

Problem statement from design philosophy

## Protocol

### 1. Load Resources

- Use attached resource 07 (knowledge-base-research) and 08 (web-research) for guidance
- Review requirements and problem_statement for research focus

### 2. Search Knowledge Base

- Fetch concept-rag://activities resource to load activity index
- Match research goal to an available activity from the index
- Follow the matched activity's skill workflow and tool sequence
- Identify key concepts, patterns, and specific guidance from results
- Map findings to work package requirements

### 3. Perform Web Research

- Use WebSearch for current information and documentation
- Cross-reference multiple sources for robustness
- Note publication dates and source freshness

### 4. Synthesize Findings

- Connect kb and web findings to work package requirements
- Map applicable patterns to specific needs
- Document assumptions about pattern applicability

### 5. Create Research Artifact

- Create kb-research.md artifact in planning folder
- Include kb_findings, web_findings, synthesis, applicable_patterns, risks

## Outputs

### research-document

Knowledge base and web research synthesis for the work package

- **artifact**: `kb-research.md`
- **kb_findings**: Findings from concept-rag knowledge base
- **web_findings**: Findings from web research
- **synthesis**: Synthesized connection to requirements
- **applicable_patterns**: Patterns validated and mapped to needs
- **risks**: Risks, gaps, or assumptions documented

## Rules

### multiple-sources

Multiple sources should be consulted for robust findings

### validate-patterns

Patterns should be validated across documents

### no-narration

Never narrate the search process to the user. Synthesize answers directly and cite sources.

## Errors

### no_kb_results

**Cause:** Knowledge base has no relevant content

**Recovery:** Rely on web research and note gap in findings

### stale_findings

**Cause:** Web results may be outdated

**Recovery:** Cross-reference multiple sources and note dates in artifact

## Resources

- [knowledge-base-research](skill:legacy/work-package/resources/knowledge-base-research)
- [web-research](skill:legacy/work-package/resources/web-research)
