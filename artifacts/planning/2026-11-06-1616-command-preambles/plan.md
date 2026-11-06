# Command Preamble Plan

## Request and Boundary

The user requests confirmation and application throughout commands: use an imperative preamble combining the action with the linked output and requester, followed by relevant conditions and the enriched invocation. The explicit example is Compute Dispatch Status. The original source is `e76308e672cc04d94b47891946bfbdc5331184b3`.

Scope is Work Planner's 116 published command specifications and its owning guideline. Operation/procedure result statements remain at their continuation points. Fields, command invocations, command identities and caller links keep their contents. Conditional outputs, failures, authorization, checkout declarations, optional/repeated parameters and result handling remain explicit.

## Design

- Put the writing rule in Work Planner's Spec Layout guideline, whose rule mapping includes review. The shared generic description rule permits the skill's more specific imperative form.
- Rewrite each command's opening in the imperative and combine its provided results and recipient into the opening paragraph. Keep substantive conditions and usage before the invocation. Compute Dispatch Status includes its agent-review gate in that paragraph.
- Preserve every invocation byte, including linked/quoted optional values and escaped continuations/redirections. Preserve every input/output/transformation link and every existing Field body.
- Review coordinated verbs and conditional/multiple-result grammar rather than mechanically removing every final “s”. Declarative conditions keep their own subjects and meaning.

## Verification and Delivery

- Compare all 116 original and revised specifications: invocation hashes, role-link multisets, Fields, conditions, checkout/REST declarations and empty trailing result sections. Read every revised preamble for action mood and result scope.
- Render all invocation blocks locally to detect accidental blockquotes, while preserving decoded invocation text and argument annotations. Do not send source to an external rendering service.
- Run the full Work Planner suite, shared checker suite, installed model and whitespace checks. Existing corpus readers must follow the same published contracts; this change adds no grammar heuristic or reading path.
- Record static preservation and test evidence separately from live tracker/graph validation. Commit/push the revision on the current E01 branch, publish the engineering record and update the existing draft PR with its exact source identity.
