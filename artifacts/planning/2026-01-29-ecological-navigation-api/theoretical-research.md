# Theoretical Research: Ecological Navigation API

**Work Package:** #36 - Ecological Navigation API  
**Activity:** Research (Theoretical Grounding)  
**Date:** 2026-01-29

---

## Executive Summary

This research explores whether ecological psychology and situated cognition frameworks are directly applicable to LLM agent-tool interactions, or whether adaptation/alternative frameworks are required. The findings suggest **distributed cognition** (Hutchins) is more applicable than pure **ecological psychology** (Gibson), with emerging frameworks like **enactivism** and **activity theory** offering additional bridges.

---

## 1. Knowledge Base Research

### 1.1 Primary Sources Found

| Source | Author(s) | Key Framework |
|--------|-----------|---------------|
| The Cambridge Handbook of Situated Cognition | Robbins & Aydede (2008) | Embodied/extended cognition, symbol grounding |
| Human-Machine Reconfigurations | Suchman (2007) | Plans as resources, situated action |
| Cognition in the Wild | Hutchins | Distributed cognition, cognitive artifacts |

### 1.2 Key Insights from Hutchins

**On Tool-Mediated Cognition:**
> "Humans create their cognitive powers by creating the environments in which they exercise those powers."

This directly supports our navigation engine design: the workflow engine *creates* the cognitive environment in which agents operate.

**On Knowledge Obviation:**
> "The correct relationships are built into the tool; the task performer has no need to know anything about these relations."

This validates our opaque state token design: agents don't need to understand state structure—the engine encodes correct transitions.

**On Distributed Computation:**
Cognitive work is distributed across agents and artifacts, with social organization providing computational control. The navigation engine serves as the "organizational" layer that controls computation flow.

### 1.3 Suchman on Plans vs. Situated Action

Suchman's key distinction:
- **Planning model**: Plans determine and control action
- **Situated action model**: Plans are *resources* for action, not control structures

**Implication for our design**: The workflow definition is a resource that the navigation engine uses to compute affordances. The agent's actual behavior remains situated—responding to the navigation landscape presented.

---

## 2. Web Research Findings

### 2.1 Contemporary Agentic Reasoning Research (2025-2026)

**ARTIST Framework** (Agentic Reasoning and Tool Integration):
- LLMs autonomously decide *when*, *how*, and *which* tools to invoke
- Uses reinforcement learning to optimize tool use
- Multi-turn reasoning chains with tool integration

**Mind-Map Agent Pattern**:
- Constructs knowledge graphs to store reasoning context
- Tracks logical relationships across reasoning chains
- Ensures coherence in long reasoning sequences

**Relevance**: These frameworks assume agents have autonomy over tool selection. Our navigation engine *constrains* this autonomy to enforce workflow fidelity while preserving situated response to presented affordances.

### 2.2 Paradigm Translation Challenges

**Core Tension Identified**:
Ecological psychology emphasizes affordances arising through *direct perception* and *bodily engagement*. LLM agents lack bodies and perceive through text/tool interfaces.

**Emerging Solutions**:

1. **Enactivist Reframing** (arXiv:2509.07871):
   - Reconceptualize agents as "self-organizing systems that actively enact their cognitive domains"
   - Shift from passive information processing to active world-making
   - Measure agency through neurophenomenological indicators (not applicable to LLMs)

2. **Artifact-Artifact Affordances** (Springer 2025):
   - Extends affordance theory beyond human-centered perception
   - "Operational Autonomy Continuum" for computational agents
   - Digital agents can develop affordance-based perceptions of virtual environments

3. **Activity Theory** (Bardram):
   - Work is "situated planning"—formal procedures and informal practice coexist
   - Workflows are resources that guide action, not rigid prescriptions
   - Workers adapt predetermined workflows to contextual conditions

### 2.3 Extended Mind and Cognitive Offloading

**Extended Cognition** (Nature 2025):
- Humans are "hybrid thinking systems" incorporating non-biological resources
- AI tools extend cognitive capabilities when properly integrated

**Extracted Cognition** (Counter-hypothesis):
- Advanced tools may *displace* cognitive responsibilities
- Risk of becoming "content-curators rather than creators"

**Implication**: Our effectivity model should ensure agents remain *active participants* in workflow execution, not passive followers of prescribed paths.

---

## 3. Paradigm Translation Analysis

### 3.1 What Transfers

| Ecological Concept | Agent-Tool Translation | Confidence |
|--------------------|------------------------|------------|
| **Affordances** | Available actions in navigation response | High |
| **Effectivities** | Agent capabilities (skills, tools) | High |
| **Perceptual Restriction** | Engine limits visible actions to valid ones | High |
| **Direct Perception** | Immediate presentation of action possibilities | Medium |
| **Coupling** | State token creates agent-engine coupling | Medium |

### 3.2 What Doesn't Transfer

| Ecological Concept | Problem | Alternative |
|--------------------|---------|-------------|
| **Embodiment** | LLMs lack bodies | Treat tool interface as "body" |
| **Continuous Perception** | Discrete request-response cycle | N/A - fundamental difference |
| **Motor System** | No physical movement | Tool invocation as "motor" action |
| **Environment** | Virtual, defined by engine | Accept as different environment type |
| **Ontogenetic Development** | No persistent learning across sessions | External skill/effectivity registry |

### 3.3 Framework Recommendation

**Primary Framework: Distributed Cognition** (Hutchins)
- Explicitly addresses tool-mediated cognition
- Acknowledges representational systems while emphasizing distribution
- Includes organizational/social aspects of computation
- More applicable to agent-tool systems than pure ecological psychology

**Secondary Framework: Activity Theory** (Bardram/Engeström)
- Treats workflows as resources, not prescriptions
- Emphasizes situated planning
- Bridges formal process and informal adaptation

**Supplementary: Enactivism**
- Agents as self-organizing systems
- Active world-making vs passive information processing
- Useful for conceptualizing agent autonomy within constraints

---

## 4. Design Implications

### 4.1 Ecological Concepts to Implement

1. **Affordance Salience**: Navigation responses should clearly communicate what actions are available and why they matter (descriptions, enables/requires relationships).

2. **Effectivity Matching**: Steps should declare required effectivities; navigation response should include these for agent capability matching.

3. **True Perceptual Restriction**: Engine should present *only* valid actions—no "blocked" actions that tempt exploration.

4. **Situation Narrative**: Replace position coordinates with rich, contextual descriptions of the current situation.

5. **Invariants**: Extract stable environmental properties that persist across actions (workflow rules, constraints).

### 4.2 Distributed Cognition Concepts to Implement

1. **Computation Distribution**: Engine handles state transitions; agent handles task execution.

2. **Artifact Encoding**: Workflow definitions encode domain knowledge; agents don't need to understand workflow logic.

3. **Organizational Control**: Engine provides the "social hierarchy" (Hutchins) that controls computational flow.

4. **Coordination Structures**: State token serves as coordination artifact between engine and agent.

### 4.3 Activity Theory Concepts to Implement

1. **Workflow as Resource**: Present workflow structure as navigational resource, not prescriptive sequence.

2. **Situated Adaptation**: Allow agent flexibility in *how* tasks are executed while constraining *which* tasks are available.

3. **Contextual Enrichment**: Include contextual information (loop state, checkpoint history) to support situated decision-making.

---

## 5. Open Questions

1. **Is embodiment essential?** Can an agent without a body meaningfully perceive affordances, or is this always metaphorical?

2. **Does direct perception apply?** LLM "perception" is mediated by text tokenization—fundamentally representational. Should we embrace this or design around it?

3. **Session continuity**: Ecological agents develop through ontogenesis. How do we handle agents with no persistent memory across sessions?

4. **Multi-agent dynamics**: Hutchins emphasizes social distribution of cognition. How does this apply to delegated effectivity model with sub-agents?

---

## 6. Recommendations

### 6.1 Theoretical Stance

**DECISION (2026-01-30):** Adopt distributed cognition as primary framework, supplemented by activity theory and enactivism. Acknowledge that ecological psychology's embodiment requirements don't transfer directly, but its affordance/effectivity vocabulary remains useful as design metaphor.

**Rationale:** Distributed cognition (Hutchins) explicitly addresses tool-mediated cognition and treats organizational structures as computational controllers—directly applicable to our navigation engine design.

### 6.2 Next Steps

1. **Skill Restructuring**: Identify which skills are engine-subsumed vs agent effectivities
2. **Effectivity Schema**: Define how steps declare required effectivities
3. **Response Enhancement**: Implement ecological response format with salience, invariants, narrative
4. **Validation**: Test whether ecological design reduces workflow violations

---

## References

### Knowledge Base Sources
- Hutchins, E. *Cognition in the Wild*. MIT Press.
- Robbins, P. & Aydede, M. (eds.) *The Cambridge Handbook of Situated Cognition*. Cambridge University Press, 2008.
- Suchman, L. *Human-Machine Reconfigurations: Plans and Situated Actions*. Cambridge University Press, 2007.

### Web Sources (2025-2026)
- ARTIST: Agentic Reasoning and Tool Integration via Reinforcement Learning. arXiv:2505.01441
- Enactivist Approach to Human-Computer Interaction. arXiv:2509.07871
- Digital Human Twin and Operational Autonomy. Springer, 2025.
- Extending Minds with Generative AI. Nature Communications, 2025.
- Activity Theory in HCI. Interaction Design Foundation.
