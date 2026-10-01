| Unit | Status | Excluding wording |
| --- | --- | --- |
| family Structural | walked |  |
| entry AP-01. no-inline-content | walked |  |
| entry AP-02. schema-is-constraint | walked |  |
| entry AP-03. no-partial-implementation | walked |  |
| entry AP-04. no-invented-naming | walked |  |
| family Interaction | walked |  |
| entry AP-05. atomic-checkpoints | not-applicable | **Fires on:** `activity.steps` |
| entry AP-06. no-assumption-execution | walked |  |
| entry AP-07. scope-reverify-completion | walked |  |
| entry AP-08. one-question-per-message | walked |  |
| family Schema Expressiveness | walked |  |
| entry AP-09. checkpoint-not-prose | walked |  |
| entry AP-10. loop-not-prose | walked |  |
| entry AP-11. decision-not-prose | not-applicable | **Fires on:** `activity.description`, `activity.exits`, `workflow.graph` |
| entry AP-12. artifact-not-buried | walked |  |
| entry AP-13. variable-for-approval | not-applicable | **Fires on:** `activity.description`, `activity.steps`, `activity.variables`, `workflow.variables` |
| entry AP-14. mode-as-state | walked |  |
| entry AP-15. procedure-in-protocol | not-applicable | **Fires on:** `activity.steps` |
| entry AP-16. technique-inputs-declared | walked |  |
| entry AP-17. bound-step-no-description | not-applicable | **Fires on:** `activity.steps` |
| entry AP-18. no-monolith-masking-steps | not-applicable | **Fires on:** `activity.steps` |
| family Rule Hygiene | walked |  |
| entry AP-19. no-rule-protocol-restatement | walked |  |
| entry AP-20. rule-group-disambiguation | walked |  |
| entry AP-21. grouped-rule-keys | walked |  |
| entry AP-22. single-rule-authority | walked |  |
| entry AP-23. worker-rule-reach | walked |  |
| entry AP-24. no-contradictory-rules | walked |  |
| entry AP-25. no-one-step-rules | walked |  |
| family Description Hygiene | walked |  |
| entry AP-26. no-rationale-in-description | walked |  |
| entry AP-27. validate-message-economy | not-applicable | **Fires on:** `activity.steps[].actions[].message` |
| entry AP-28. no-sequence-in-description | walked |  |
| entry AP-29. no-user-env-mutation | walked |  |
| entry AP-30. role-rules-not-description | walked |  |
| entry AP-31. no-hand-authored-artifacts | walked |  |
| entry AP-32. outcome-names-value | not-applicable | **Fires on:** `activity.outcome` |
| entry AP-33. no-set-of-technique-output | walked |  |
| entry AP-34. no-valueless-control-set | not-applicable | **Fires on:** `activity.steps[].actions` |
| entry AP-35. no-intra-step-input-set | not-applicable | **Fires on:** `activity.steps[].technique.inputs`, `activity.steps[].actions` |
| entry AP-36. techniques-list-disjoint | not-applicable | **Fires on:** `activity.techniques`, `activity.steps[].technique` |
| entry AP-37. rule-audience-bucket | not-applicable | **Fires on:** `workflow.rules.workflow`, `workflow.rules.activity`, `workflow.rules.universal` |
| entry AP-38. no-duplicate-technique-steps | not-applicable | **Fires on:** `activity.steps[].technique` |
| entry AP-39. hoist-universal-techniques | not-applicable | **Fires on:** `activity.techniques`, `workflow.techniques.activity` |
| entry AP-40. readme-orients-not-transcribes | not-applicable | **Fires on:** `readme` |
| entry AP-41. avoidance-voice-in-definitions | walked |  |
| family Coupling | walked |  |
| entry AP-42. io-agnostic-contract | walked |  |
| entry AP-43. canonical-artifact-ids | walked |  |
| entry AP-44. artifact-name-in-io | walked |  |
| entry AP-45. no-opaque-artifact-path-array | walked |  |
| entry AP-46. no-resource-caller-backlink | not-applicable | **Fires on:** `resource` |
| entry AP-47. no-redundant-link-label | walked |  |
| entry AP-48. brace-output-references | walked |  |
| entry AP-49. no-delivery-mechanism-narration | walked |  |
| entry AP-50. no-tool-usage-prescription | walked |  |
| entry AP-51. canonical-technique-reference | walked |  |
| entry AP-52. brace-declared-ids | walked |  |
| entry AP-53. dotted-rule-address | walked |  |
| entry AP-54. anchored-protocol-references | walked |  |
| entry AP-55. hoist-shared-inputs | walked |  |
| entry AP-56. paren-invocation-args | walked |  |
| entry AP-57. escape-literal-dollar | walked |  |
| entry AP-58. snake-case-symbols | walked |  |
| entry AP-59. constraint-as-blockquote | walked |  |
| entry AP-60. local-rule-as-note | walked |  |
| entry AP-61. factor-repeated-paths | walked |  |
| entry AP-62. bind-protocol-locals | walked |  |
| entry AP-63. backtick-code-tokens | walked |  |
| entry AP-64. boolean-id-shape | walked |  |
| entry AP-65. collection-id-shape | walked |  |
| entry AP-66. io-id-shape | walked |  |
| entry AP-67. rule-slug-shape | walked |  |
| entry AP-68. technique-stage-agnostic | walked |  |
| entry AP-69. no-activity-prose-rules | not-applicable | **Fires on:** `activity.rules` |
| entry AP-70. capability-group-placement | walked |  |
| family Tool-Technique-Doc Consistency | walked |  |
| entry AP-71. no-false-resource-delivery | walked |  |
| entry AP-72. complete-bootstrap-path | walked |  |
| entry AP-73. consistent-tool-names | walked |  |
| entry AP-74. no-duplicated-guidance | walked |  |
| entry AP-75. describe-tool-value | walked |  |
| entry AP-76. no-redundant-tools | walked |  |
| family Execution | walked |  |
| entry AP-77. impl-before-confirmed-approach | walked |  |
| entry AP-78. follow-through-on-recommend | walked |  |
| entry AP-79. structure-backed-constraints | walked |  |
| entry AP-80. preserve-readme-content | not-applicable | **Fires on:** `readme` |
| entry AP-81. verify-format-literacy | walked |  |
| entry AP-82. work-through-activities | not-applicable | **Fires on:** `workflow.activities`, `workflow.graph` |
| entry AP-83. accept-correction | walked |  |
| family Output Economy | walked |  |
| entry AP-84. single-closeout-artifact | not-applicable | **Fires on:** `resource`, `readme` |
| entry AP-85. link-dont-copy-sections | not-applicable | **Fires on:** `resource` |
| entry AP-86. exception-only-verdict-tables | not-applicable | **Fires on:** `resource` |
| entry AP-87. omit-null-sections | not-applicable | **Fires on:** `resource`, `activity.steps` |
| entry AP-88. one-decision-one-checkpoint | not-applicable | **Fires on:** `activity.steps` |
| entry AP-89. checkpoint-requires-decision | not-applicable | **Fires on:** `activity.steps` |
| entry AP-90. no-guide-wrapper-ceremony | not-applicable | **Fires on:** `resource` |
| entry AP-91. lifecycle-row-update | not-applicable | **Fires on:** `resource` |
| entry AP-92. resource-fills-not-does | not-applicable | **Fires on:** `resource` |
| entry AP-93. canonical-fact-home | not-applicable | **Fires on:** `resource` |
| entry AP-94. link-only-input-slots | not-applicable | **Fires on:** `resource` |
| entry AP-95. enforce-output-discipline | walked |  |
| entry AP-96. artifact-audience-declared | walked |  |
| entry AP-97. link-named-artifacts | not-applicable | **Fires on:** `activity.steps[].message`, `activity.steps[].actions[].message` |
| entry AP-98. no-next-step-narration | not-applicable | **Fires on:** `activity.steps[].message`, `activity.steps[].actions[].message`, `activity.steps[].options[].description` |
| entry AP-99. statement-not-question | not-applicable | **Fires on:** `activity.steps[].message` |
| entry AP-100. runtime-rules-only | walked |  |
| entry AP-101. no-caption-only-message | not-applicable | **Fires on:** `activity.steps[].message` |
| entry AP-102. no-technique-resource-dual-home | walked |  |
| family Canon Hygiene | walked |  |
| entry AP-103. cited-home-owns-claim | walked |  |
| entry AP-104. operative-criteria-need-a-home | walked |  |
| entry AP-105. no-shadow-audit-pass | walked |  |
| entry AP-106. canon-layer-cites-not-restates | not-applicable | **Fires on:** `resource`, `readme` |
| entry AP-107. bind-site-is-orchestration-truth | walked |  |
| family Technique Protocol | walked |  |
| entry AP-108. numbered-protocol-phases | walked |  |
| entry AP-109. technique-outputs-declared | walked |  |
| entry AP-110. duplicate-shared-capability | walked |  |
| entry AP-111. contract-not-procedure | walked |  |
| entry AP-112. no-derived-state-shadow | not-applicable | **Fires on:** `workflow.variables` |
| entry AP-113. session-interaction-in-technique | walked |  |
| entry AP-114. pass-orchestration-in-technique | walked |  |
| entry AP-115. platform-semantics-in-capability | walked |  |
| entry AP-116. no-template-creation-guide | walked |  |
| entry AP-117. no-engine-mechanics-as-rules | walked |  |
| entry AP-118. no-bind-mechanics-as-prose | walked |  |
| entry AP-119. procedure-in-io-contract | walked |  |
| entry AP-120. procedure-in-capability | walked |  |
| entry AP-121. rule-as-protocol-step | walked |  |
| entry AP-122. prompt-restates-owned-mechanics | walked |  |
| entry AP-123. capability-as-op-inventory | walked |  |
| entry AP-124. alternate-ops-as-protocol-sequence | walked |  |
| entry AP-125. technique-ref-in-io-contract | walked |  |
| family Draft Hygiene | walked |  |
| entry AP-126. cut-comment-jsdoc-verbosity | walked |  |
| entry AP-127. no-dense-prose-after-config-examples | walked |  |
| entry AP-128. worktree-root-placeholders | walked |  |
| entry AP-129. no-parallel-runbook-when-setup-covers-it | walked |  |
| entry AP-130. variable-description-one-line | not-applicable | **Fires on:** `workflow.variables` |
| entry AP-131. bag-value-as-literal | walked |  |
| entry AP-132. unproduced-value-read | not-applicable | **Fires on:** `activity.steps` |
| entry AP-133. stale-restatement-after-change | walked |  |
| entry AP-134. artifact-name-is-filename | walked |  |
| entry AP-135. resource-id-names-its-content | not-applicable | **Fires on:** `resource` |
| entry AP-136. deployment-path-in-capability | walked |  |
| entry AP-137. overlapping-rule-scopes | walked |  |
| entry AP-138. whole-resource-for-one-section | walked |  |
| entry AP-139. tool-contract-restated-in-protocol | walked |  |
| entry AP-140. phase-cited-by-ordinal | walked |  |
| entry AP-141. unowned-harness-capability | walked |  |
| entry AP-142. output-without-destination | walked |  |
| entry AP-143. framing-outside-any-section | not-applicable | **Fires on:** `resource` |
| entry AP-144. declared-input-never-read | walked |  |
| entry AP-145. apply-omits-declared-input | walked |  |
| entry AP-146. branch-on-undeclared-threshold | walked |  |
| entry AP-147. inherited-rules-re-enumerated | walked |  |
| entry AP-148. reference-without-provenance | walked |  |
| entry AP-149. pre-session-prose-defers-to-the-framework | not-applicable | **Fires on:** `resource` |
| entry AP-150. instruction-narrates-an-actor | walked |  |
| entry AP-151. rule-binds-beyond-its-operation | walked |  |
| entry AP-152. inherited-input-re-declared | walked |  |
| entry AP-153. schema-semantics-restated | walked |  |
| entry AP-154. engine-internals-narrated | walked |  |
| entry AP-155. value-set-in-prose | walked |  |
| entry AP-156. one-invariant-per-rule | walked |  |
| entry AP-157. call-omits-conditionally-required-argument | walked |  |
| entry AP-158. call-omits-required-argument | walked |  |
| entry AP-159. call-names-an-undeclared-argument | walked |  |
| entry AP-160. protocol-phase-as-list-item | walked |  |
| entry AP-161. unreachable-operation-reference | walked |  |
| entry AP-162. produce-path-without-a-reading | walked |  |
| entry AP-163. construct-folder-without-a-readme | walked |  |
| entry AP-164. relocation-without-a-preserved-outcome | walked |  |
| entry AP-165. unproducible-declared-value | walked |  |
| principle 1. Workflows Ossify Patterns | walked |  |
| principle 2. Internalize Before Producing | walked |  |
| principle 3. Define Complete Scope Before Execution | walked |  |
| principle 4. Clarify Before Assuming | walked |  |
| principle 5. Maximize Schema Expressiveness | walked |  |
| principle 6. One Authoritative Home | walked |  |
| principle 7. Convention Over Invention | walked |  |
| principle 8. Confirm Before Irreversible Changes | walked |  |
| principle 9. Encode Constraints as Structure | walked |  |
| principle 10. Non-Destructive Updates | walked |  |
| principle 11. Complete Documentation Structure | not-applicable | **Fires on:** `readme` |
| principle 12. Output Economy | walked |  |
| principle 13. Separate Contract from Procedure | walked |  |
| principle 14. Single Source of Truth | walked |  |
| principle 15. Phase by Sequenced Outcome | walked |  |
| principle 16. Distinguish Designators from Parameters | walked |  |
| principle 17. Document in Positive Present | not-applicable | **Fires on:** `workflow.description`, `activity.description`, `activity.outcome`, `activity.steps[].options`, `readme` |
| principle 18. Prefer Shared Capability | walked |  |
| principle 19. Name Symbols Affirmatively | walked |  |
| principle 20. Keep Orchestration in Structure | walked |  |
| principle 21. Match the Harness Surface | walked |  |
| principle 22. Modular Over Inline | walked |  |
| principle 23. Close the Loop | walked |  |
| principle 24. Keep Session Interaction in Activities | walked |  |
| principle 25. Bind Sibling Techniques as Steps | walked |  |
| principle 26. A Technique Is a Reading | walked |  |
| principle 27. State Contract Contribution | walked |  |
| principle 28. Creation Guide for Generated Documents | walked |  |
| principle 29. Cite Resource Policy; Do Not Restate It | walked |  |
| principle 30. Resources Stay Abstract | walked |  |
| principle 31. Isolate Conditional Branches as Notes | walked |  |
| principle 32. Cite Resources at Section Grain | walked |  |
| principle 33. Pre-Session Prose Stands Alone | not-applicable | **Fires on:** `resource` |
| principle 34. Edit the Owner | walked |  |
| principle 35. Prefer Removing the Thing That Needs a Prohibition | walked |  |
| principle 36. A Technique Names Only What Its Reader Holds | walked |  |
| principle 37. An I/O Contract Names the Value | walked |  |
| principle 38. A Relocation Records the Outcome It Keeps | walked |  |
| principle 39. A Phase Heading Names the Outcome | walked |  |
| principle 40. Fan-Out Lives at the Layer That Runs the Work | walked |  |
| principle 41. A Phase States Answers the Tool Has Returned | walked |  |
| principle 42. A Routine Holds the Codified Path | walked |  |
| principle 43. A Workflow Borrows Activities | not-applicable | **Fires on:** `workflow.activities` |
| principle 44. A Resource Splits for Section Delivery | not-applicable | **Fires on:** `resource` |
| principle 45. A Rule States One Invariant | walked |  |
| principle 46. A Consumer Binds the Contract | walked |  |
| principle 47. A Calibrated Surface Extends by Wrapping | walked |  |
| convention Reference Conventions | walked |  |
| guard binding-fidelity | walked |  |
| guard activity-variables | walked |  |
| guard artifact-status-once | walked |  |
| guard nested-output-home | walked |  |
| guard identity-binds | walked |  |
| guard inherited-inputs | walked |  |
| guard corpus-links | walked |  |
| guard protocol-shape | walked |  |
| guard section-framing | walked |  |
| guard citation-grain | walked |  |
| guard identifier-qualification | walked |  |
| guard review-mode-gating | walked |  |
| guard audience | walked |  |
| guard artifact-guides | walked |  |
| guard repeated-runs | walked |  |
| guard description-hygiene | walked |  |
| guard checkpoint-entry | walked |  |
| guard workflow-identity | walked |  |
| guard namespace-collision | walked |  |
| guard checkpoint-presentation | walked |  |
| guard message-binding | walked |  |
| guard decision-order | walked |  |
| guard bootstrap-self-contained | walked |  |
| guard tool-call-shape | walked |  |
| guard declared-values | walked |  |
| guard rule-citation-form | walked |  |
| guard set-action-values | walked |  |
| guard harness-adapter-set | walked |  |
| guard launched-workflows | walked |  |
| guard self-provisioned-input | walked |  |
| guard self-composed-set | walked |  |
| guard branch-as-step | walked |  |
| guard activity-technique-overlap | walked |  |
| guard prism-lens-reachability | walked |  |
| guard resource-anchors | walked |  |
| guard technique-template | walked |  |
| guard variable-model | walked |  |
| guard duplicate-bodies | walked |  |
| guard stealth-isolation | walked |  |
| guard when-expression | walked |  |
| guard loop-shape | walked |  |
| guard refs | walked |  |
| guard activities | walked |  |
| guard workflow-yaml | walked |  |
| guard site-links | walked |  |
| guard svg-layout | walked |  |
| guard source-encoding | walked |  |
| guard agent-instruction-homes | walked |  |
| guard pinned-corpus-paths | walked |  |
| guard lockfile-denylist | walked |  |
| guard routines | walked |  |
| guard inventory-schema-agreement | walked |  |
| guard fires-on-ids | walked |  |
| guard guard-roster | walked |  |
| guard routine-signature-prose | walked |  |
| guard unserved-operation-refs | walked |  |
