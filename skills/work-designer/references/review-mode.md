# Review Mode

Reviews the combined result of the requested integration and produces a report of findings, coverage and readiness.

## Prerequisites

Before the first command spec, read the [command conventions](commands.md#conventions).

## Procedure

1. **Establish the subject.**
   - Read applicable project instructions and take the repository, integration PRs or branches, intended targets and merge order from the request and repository metadata.
   - Identify the long-lived branches and what each owns from the resolved [project configuration](variants.md#selection) and the project's documentation, manifests and CI. Resolve the shared [planning record](planning.md) before saving evidence.
   - [Fetch Pull Request](commands.md#fetch-pull-request) and [Fetch Requirements](commands.md#fetch-requirements) where applicable. Resolve only missing decisions with the user, one question at a time.
2. **Capture the revisions.**
   - [Fetch Branches](commands.md#fetch-branches), then [Compare Revisions](commands.md#compare-revisions) for each head and target. Record the merge base, full SHAs, constituent PRs and delivered requirements.
   - [Create Review Worktree](commands.md#create-review-worktree) for each distinct reviewed tree. [Prepare Integration Result](commands.md#prepare-integration-result) where the head does not already contain its current target.
   - Record the final combination and any intermediate combination the proposed merge or deployment order exposes. Keep separate branch products in their own trees.
3. **Read the design.**
   - Use [Read Captured File](commands.md#read-captured-file) for whole-document links and [Read Captured Section](commands.md#read-captured-section) for heading links. Start with the documentation index, then the architecture, affected component contracts, schemas, configuration and test guidance at the captured revisions.
   - Trace each affected requirement from its authoritative source through declaration, loading, execution, delivered content and observable output. Follow unchanged consumers of changed shared components.
   - Record disagreements between design, schema and implementation as review evidence.
4. **Plan coverage.**
   - Fill the coverage table in the [report template](../templates/integration-review.md) before broad validation. Use [Coverage](#coverage), the [coverage guide](coverage.md) and the project's resolved configuration to select observations from its contracts and implementation.
   - Associate each check with its exact revision combination, relevant failure scenario and requirement. Include missing checks as evidence gaps.
5. **Examine and exercise the result.**
   - Inspect the combined diff, shared consumers and the proposed integration result against the documented design.
   - [Run Project Check](commands.md#run-project-check) for each selected observation, inspect its output and preserve evidence in the review record. Read CI definitions for the branches and artifacts each job actually uses.
   - Reproduce uncertain findings in disposable fixtures. Where attribution is unclear, compare target and candidate under equivalent conditions and explain any pairing differences.
6. **Check the integration boundaries.**
   - Compare producers and consumers across branches: schema and tool callers, generated and served surfaces, packaging, paths, configuration and host instructions.
   - Assess the proposed deployment order against session and runtime behavior. Distinguish an existing defect from a regression and from an unavailable measurement.
   - Check whether the PR bodies describe the complete current result and identify the constituent PRs accurately.
7. **Refresh evidence.**
   - [Fetch Check Evidence](commands.md#fetch-check-evidence) for each reviewed PR and its relevant CI runs. Inspect recorded checkout revisions as well as the reported check SHA.
   - [Refresh Revisions](commands.md#refresh-revisions) before concluding. A moved head, target or paired dependency sends the affected conclusions back through examination and validation.
8. **Report.**
   Write the [integration review](../templates/integration-review.md) in the shared [planning record](planning.md), using [Verdicts](#verdicts) and [Findings](#findings). End with the smallest concrete actions that close the findings or evidence gaps.

## Coverage

- **Requirements.**
  Each applicable requirement has an observable successful path, relevant boundary or negative behavior, the integration boundary exercised and the observation's limits.
- **Design.**
  Assess the integration against the project's principles, including responsibility boundaries, authoritative homes and dependency policy. A proposed correction follows those same principles.
- **Kinds of evidence.**
  Syntax checks, schema checks, snapshots, simulated walks and real execution establish different facts. Match the check to the claim; file or string checks establish only facts about that file or string.
- **Agent behavior.**
  A walk supplying stand-in values cannot establish that an agent performs a technique correctly or an external tool returns the claimed result. Inspect the instructions the receiving role gets and identify the execution evidence those claims need.
- **Validation behavior.**
  For changed validation, use an existing defect fixture or disposable reproduction to show that the invalid case is detected.
- **Scope.**
  Broaden coverage to the affected dependency closure. A narrow check is sufficient only when the closure excludes the other consumers; explain every not-applicable decision.
- **Results.**
  Record executed, inspected and inferred evidence separately. A skipped test, unavailable dependency, cancelled run or pending check leaves its requirement unobserved.

## Findings

Group findings by area of concern and order them by severity. Each finding states its trigger, expected behavior and source, observed behavior or reproduction, consequence, owning branch, suggested correction and confidence. Cite code and definitions with commit-pinned links where available. Distinguish a confirmed defect from a suspected one or an evidence gap; classify severity by consequence using the project's scale.

## Verdicts

| Verdict | Meaning |
| --- | --- |
| Ready on the reviewed revisions | Required evidence holds for the stated combination and no finding prevents integration |
| Changes required | A confirmed defect prevents integration; further evidence may also be missing |
| Insufficient evidence | Readiness cannot be established and no confirmed blocking defect determines the verdict |

## Rules

- **Review authority.**
  This mode reads, validates and writes a local report. Reviewed branches, tests, baselines and exception ledgers stay as captured; fixes, commits, pushes, publication, merges and GitHub review posts are outside this mode.
- **Isolation.**
  Builds, test output and disposable reproductions belong in review worktrees or scratch storage. Shared checkouts and live services retain their state.
- **Exact subject.**
  Evidence names the revisions it measured. Separate branch products are paired for testing, not merged into one unrelated history.
- **Integration evidence.**
  Constituent PR approvals and passing checks do not establish that their combined result works. Record a conflicting integration result and [Abort Review Merge](commands.md#abort-review-merge) without inventing a resolution.
- **Missing authority or environment.**
  Record the required observation when it needs an unavailable environment or an action outside existing authorization, and continue independent review work.
