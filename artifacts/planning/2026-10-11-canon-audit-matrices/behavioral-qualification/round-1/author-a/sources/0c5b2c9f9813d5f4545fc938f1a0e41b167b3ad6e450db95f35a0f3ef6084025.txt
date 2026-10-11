# Controlled qualification anti-patterns

These two entries are test criteria, not the project's full canon. Interpret only the binding and instruction constructs defined here. Each distinct failing instruction or binding is one finding; section and whole-element rows can expose the same finding.

## Controlled Qualification

### AP-01. emission-without-validation

Detect: A technique's Protocol instruction or Rules clause explicitly directs an artifact's emission without validating that artifact first. Review each instruction and each semicolon-separated clause independently. Validation elsewhere does not excuse an instruction or clause that explicitly permits unvalidated emission.

Do not flag: A directive to validate before emission satisfies this criterion. A heading, output declaration, retention clause, destination declaration, routine call, binding or graph label does not itself direct emission. Capability descriptions describe the service and are not imperative instructions.

Fix: Require validation of the same artifact before emission in every emitting instruction and clause.

### AP-02. broken-binding

Detect: Either binding contract fails: (1) an activity's routine invocation has an argument-key set different from the routine's Inputs list; or (2) a routine Outputs binding of the form step-id.output-name names an output absent from the technique called by that step. Resolve the step and technique before comparing their names. The keys below a technique's Outputs heading declare its output names. Check each concrete routine invocation, even when its routine declaration is valid.

Do not flag: Matching argument keys and declared output names satisfy the contract. Argument values such as sealed are opaque test values. The fixture has no optional parameters or aliases. Markdown artifact mentions are not bindings. An output's declared name need not match the name of its exported routine binding.

Fix: Match the routine's exact input names at the invocation and bind only outputs that its called technique declares.
