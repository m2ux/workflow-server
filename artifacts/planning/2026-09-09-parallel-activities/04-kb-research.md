# Knowledge Base Research - Parallel activities

> work-package · 2026-09-09 · Complete

## Research Approach

| Activity | Technique Used | Results Summary |
|----------|----------------|-----------------|
| Domain index | concept-rag `list_categories` | 794 categories / 327 documents. Nearest domains: software architecture, distributed systems, design patterns, systems design. No Workflow Patterns (van der Aalst) volume in the library. |
| Catalog + chunks | concept-rag catalog / chunks | CI/CD and architecture books name pipeline DAGs, matrix jobs, and orchestrated coordination. They do not define graph-level AND-split / AND-join. |
| Institutional canon | design-principles, schema-construct-inventory, scatter-gather | Graph owns routing. Mid-phase fan-out binds `orchestration-patterns`. Isolation-then-combine is the gather contract. |
| Web prior art | Workflow Patterns, BPMN, Step Functions, Temporal, Airflow, GitHub Actions, EIP | Conventional solutions confirm the specification's two destination forms and wait-for-all join. |

## Relevant Concepts Discovered

### Parallel Split and Synchronization (WCP-2 / WCP-3)
**Source:** [Workflow Patterns — Parallel Split](http://workflowpatterns.com/patterns/control/basic/wcp2.php), [Synchronization](http://www.workflowpatterns.com/patterns/control/basic/wcp3.php) (Workflow Patterns Initiative, pages current through 2023)  
**Relevance:** A list-fan is an AND-split of named branches; the derived join is an AND-join.  
**Key Insight:** "The synchronizer can either be represented explicitly or implicitly." BPEL, WebSphere MQ, and COSA implement the join as multiple incoming edges. Staffware, BPMN, and XPDL use an explicit construct. The specification's derived join is the implicit family.

### Multiple Instances with a priori runtime knowledge (WCP-14)
**Source:** [Workflow Patterns (2003)](https://doi.org/10.1023/a:1022883727209); van der Aalst et al. PDF survey of Patterns 12–15  
**Relevance:** An instance-fan opens one worker per collection element, width known when the fan enters.  
**Key Insight:** Synchronization of those instances is a separate requirement from launching them. The specification binds both: the frontier holds one entry per instance and the join fires when that set is empty.

### Isolation then combine
**Source:** [scatter-gather isolation-then-combine](../../../workflows/meta/techniques/scatter-gather.md); [EIP Scatter-Gather](https://www.enterpriseintegrationpatterns.com/patterns/messaging/BroadcastAggregate.html); [EIP Aggregator](https://www.enterpriseintegrationpatterns.com/patterns/messaging/Aggregator.html)  
**Relevance:** Branch outputs must not clobber a shared bag.  
**Key Insight:** Hohpe: "Use a Scatter-Gather that broadcasts a message to multiple recipients and re-aggregates the responses." Completeness is "Wait for all" when the recipient list is known. The specification lands each branch's map under a key derived from its activity id, then the join gathers the container.

### Graph owns fan-out
**Source:** [design-principles §18 Prefer Shared Capability](../../../workflows/workflow-design/resources/design-principles.md#18-prefer-shared-capability); [schema-construct-inventory](../../../workflows/workflow-design/resources/schema-construct-inventory.md) mid-phase vs session-level rows; specification § "A construct that runs several workers has to sit where the routing is decided"  
**Relevance:** Fifteen corpus bindings of scatter-gather sit inside activities whose workers hold no dispatch tool.  
**Key Insight:** Mid-phase fan-out stays `orchestration-patterns`. Session-level parallel activities are `workflow-engine::dispatch-activity` plus a graph destination. Those are different grains.

## Applicable Design Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| WCP-2 Parallel Split | workflowpatterns.com WCP-2 | List-fan destination names several members | HIGH |
| WCP-3 Synchronization (implicit AND-join) | workflowpatterns.com WCP-3 | Join is the activity every branch already names; frontier-empty is the barrier | HIGH |
| WCP-14 Multiple instances (runtime-known) | van der Aalst 2003 Patterns 13–15 | Instance-fan over a bag collection | HIGH |
| Step Functions Parallel + Map | [Parallel state](https://docs.aws.amazon.com/step-functions/latest/dg/state-parallel.html), [Distributed Map](https://docs.aws.amazon.com/step-functions/latest/dg/state-map-distributed.html) | Same two forms: heterogeneous branches, and one definition per collection element. Parallel waits until every branch terminates. Map output is an array, one element per iteration. | HIGH |
| EIP Scatter-Gather + Aggregator | enterpriseintegrationpatterns.com | Known recipient list → wait-for-all completeness; combine is a separate algorithm | HIGH |
| Temporal Promise.all / child workflows | [Temporal parallel execution](https://docs.temporal.io/design-patterns/parallel-execution), [child workflows](https://docs.temporal.io/design-patterns/child-workflows) | Each branch is its own identity; parent waits for all. Width is capped (2,000 in-flight children). | HIGH |
| Airflow dynamic task mapping | [Airflow 3.3.1 mapping](https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/dynamic-task-mapping.html) | `expand()` creates n copies at runtime; a downstream task reduces the collected output. `max_active_tis_per_dag` is a width cap. | HIGH |
| GitHub Actions matrix + needs | [matrix jobs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations), [needs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-jobs) | One job definition, many instances; a job that `needs` the matrix waits for every combination. `max-parallel` is a width cap. | HIGH |

## Best Practices Found

### Place the AND-join where early entry is unrepresentable
**Source:** specification derived-join; WCP-3 implicit family; Step Functions Parallel `Next` after all branches terminate  
**Description:** The join fires only when every incoming branch has completed.  
**Application:** Frontier-empty is the barrier. The last retirement is the only call that enters the join. Matches the specification.

### Cap width in one place, allow a tighter local cap
**Source:** specification width-bound row; Step Functions `MaxConcurrency`; Temporal 2,000-child limit and [Sliding Window](https://docs.temporal.io/design-patterns/sliding-window); Airflow `max_active_tis_per_dag`; GitHub Actions `strategy.max-parallel`  
**Description:** Every conventional engine that opens a fan states a server-wide ceiling and an optional tighter per-fan cap.  
**Application:** Keep the operative bound in `src/config.ts`. A destination may state a tighter cap with a reason.

### Isolate outputs until a named gather
**Source:** scatter-gather `isolation-then-combine`; Step Functions Parallel output array; EIP Aggregator  
**Description:** Per-branch values land in slots; a later step combines them.  
**Application:** Branch key from activity id; join reads the container whole.

### Replace one failed branch; do not invent a merge policy for a missing slot
**Source:** specification "One branch of several failing to return"; WCP-3 deadlock note; Temporal "retry that child without re-processing siblings"  
**Description:** WCP-3 names deadlock when one incoming branch never arrives. None of the surveyed offerings auto-resolve a missing branch.  
**Application:** One replacement, then block. The join does not run on a partial container.

## Risks and Anti-Patterns

| Risk/Anti-Pattern | Source | Mitigation |
|-------------------|--------|------------|
| BPMN implicit incoming is XOR, not AND | [Camunda parallel-gateway thread](https://forum.camunda.io/t/use-of-parallel-gateway/32049); [BPMNbox explicit split](https://bpmnbox.org/en/rule/explicit_parallel_split) | The specification is WCP-3 implicit AND-join, not BPMN implicit incoming. Authoring docs must say the join waits for every branch. |
| Step Functions enclosed Parallel | [Parallel state](https://docs.aws.amazon.com/step-functions/latest/dg/state-parallel.html): "Each branch must be self-contained" | The specification derives the join from branch exits rather than wrapping branches in a container state. Same wait-for-all semantics; different authoring shape. Do not import the self-contained-branch rule. |
| Fail-fast cancels siblings | Step Functions Parallel: one branch fail stops all; GitHub Actions `fail-fast` | The specification replaces one branch and leaves siblings' committed slots. Do not adopt fail-fast. |
| Unbounded instance fan | Temporal Sliding Window / 2,000-child cap; Step Functions Distributed Map 10,000 | Agent fans are small. The server width bound is the control, not a sliding window. |
| Mid-phase scatter-gather as the graph fan | schema-construct-inventory; specification unreachable bindings | Keep `orchestration-patterns` for in-activity work units. Graph destinations own activity-level parallel. |

## Web Research Findings

### Search Queries Used

| Query | Sources Consulted | Key Findings |
|-------|-------------------|--------------|
| workflow patterns parallel split synchronization multiple instances | workflowpatterns.com WCP-2/WCP-3; van der Aalst 2003 DOI | Implicit AND-join is a first-class implementation. WCP-14 is the instance-fan. |
| AWS Step Functions Parallel Map state | docs.aws.amazon.com Parallel + Distributed Map (fetched 2026-09-09) | Two forms match list-fan and instance-fan. Join is the state itself. Branches are enclosed. |
| BPMN 2.0 parallel gateway implicit join | Camunda docs 7.5; Camunda forum 2021; BPMNbox | Explicit gateway is AND-join. Implicit incoming is XOR. |
| Temporal Promise.all child workflows | docs.temporal.io parallel-execution, child-workflows, sliding-window (2025 design-pattern pages) | Per-identity children + wait-for-all. Width capped. |
| Airflow dynamic task mapping GitHub Actions matrix | Airflow 3.3.1 docs; docs.github.com matrix + needs | Runtime copies of one definition; downstream reduce waits for all. |
| EIP scatter-gather aggregator | enterpriseintegrationpatterns.com | Wait-for-all when the recipient list is known. |

### External Documentation

| Source | URL | Key Insights | Relevance |
|--------|-----|--------------|-----------|
| WCP-2 Parallel Split | http://workflowpatterns.com/patterns/control/basic/wcp2.php | AND-split may be explicit or implicit | HIGH |
| WCP-3 Synchronization | http://www.workflowpatterns.com/patterns/control/basic/wcp3.php | Implicit AND-join via multiple incoming edges; deadlock if one branch never arrives | HIGH |
| Step Functions Parallel | https://docs.aws.amazon.com/step-functions/latest/dg/state-parallel.html | Wait until all branches terminate; output is an array; branches self-contained | HIGH |
| Step Functions Distributed Map | https://docs.aws.amazon.com/step-functions/latest/dg/state-map-distributed.html | Child execution per item; `MaxConcurrency`; separate history per child | HIGH |
| Temporal parallel execution | https://docs.temporal.io/design-patterns/parallel-execution | Promise.all / gather; child workflows for identity; width limits | HIGH |
| Airflow dynamic mapping | https://airflow.apache.org/docs/apache-airflow/stable/authoring-and-scheduling/dynamic-task-mapping.html | `expand()` + reduce; `max_active_tis_per_dag` | HIGH |
| GitHub Actions matrix | https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations | Matrix instances; `needs` waits for all; `max-parallel` | HIGH |
| EIP Scatter-Gather | https://www.enterpriseintegrationpatterns.com/patterns/messaging/BroadcastAggregate.html | Broadcast then aggregate; wait-for-all when recipients are known | HIGH |

### Alignment with KB Research

All 4 KB findings confirmed by external sources. One extension: BPMN implicit incoming is XOR, so authoring prose must not describe the derived join as "just multiple incoming edges" without naming AND-join semantics.

| KB Finding | Web Validation | Notes |
|------------|----------------|-------|
| Graph, not activity, owns activity-level fan-out | Extended | Temporal puts parallel in workflow code (no separate graph). This engine's graph/activity split makes the graph the routing home. |
| Isolation-then-combine | Confirmed | Step Functions array; EIP Aggregator; Airflow reduce |
| One width bound plus optional tighter cap | Confirmed | Every surveyed engine |
| Derived join without a join node | Extended | WCP-3 implicit family confirms it. BPMN practice warns against reading implicit incoming as AND. |

## Recommended Approach

1. **Primary Pattern:** WCP-2 + WCP-3 implicit AND-join, plus WCP-14 for instance-fan
   - Rationale: Matches the specification's destination union, derived join, and frontier. Step Functions Parallel/Map and Airflow mapping confirm the two forms. Do not import BPMN-implicit-XOR or Step Functions enclosed-branch rules.

2. **Key Practices to Apply:**
   - Implement against the specification indexed from [index.md](index.md)
   - Land branch outputs under a server-derived key; gather at the join
   - Keep the width bound in server config; honour a tighter per-destination cap
   - Replace one failed branch once; block on a second failure
   - State AND-join semantics in authoring docs so a BPMN reader does not treat multiple incoming edges as XOR

3. **Risks to Monitor:**
   - BPMN XOR misread — name the barrier as frontier-empty
   - Fail-fast leakage from Step Functions / GitHub Actions defaults

## Open Research Candidates

No open research gaps remain. Conventional solutions confirm the specification's destination forms, derived wait-for-all join, output isolation, width bound, and one-branch replacement. Residual judgements (whether those documents are complete enough to skip elicitation) are already DP-3 and DP-4 in the [assumptions log](02-assumptions-log.md).

| ID | Statement | Status | Rationale | Handoff |
|----|-----------|--------|-----------|---------|
| — | — | — | None | — |

## Sources Referenced

| Document | Relevance | Key Sections |
|----------|-----------|--------------|
| workflow-design design-principles | Institutional stance | §18 Prefer Shared Capability; §26 Atomic Techniques |
| workflow-design schema-construct-inventory | Mid-phase vs session fan-out | Informal Pattern table |
| scatter-gather technique | Isolation-then-combine; gather contract | isolation-then-combine |
| Specification README | Design to implement | Destination forms; derived join; width bound; branch failure |
| WCP-2 / WCP-3 / WCP-14 | Conventional graph routing | Parallel Split; Synchronization; Multiple Instances |
| Step Functions Parallel + Map | Industry Parallel / Map states | Wait-for-all; output array; MaxConcurrency |
| Temporal / Airflow / GitHub Actions | Instance identity and width caps | Promise.all; expand(); matrix + needs |
| EIP Scatter-Gather | Completeness when recipients are known | Wait for all |
