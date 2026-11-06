# Command Tag Fix Plan

Baseline: `f819e3b68e32aa014c4ca58648ce674e542cf773`. The user reports broken command tags in Delivery Plan and requests checking throughout. Local CommonMark rendering produces custom `<workspace>` and other HTML elements inside argument links, rather than visible placeholder text.

Audit all 116 invocations and escape literal angle brackets inside payloads; 49 currently contain raw brackets. Keep the big/pre wrappers, Markdown annotations, destinations and role titles. Preserve the exact decoded command and verify the rendered argument-label text and roles, with no custom tags or blockquotes.

State the encoding in the owning parameter-placeholder guideline. The shared HTML-model checker rejects raw payload angle brackets, excluding the actual wrappers. Meaningful fixtures cover broken labels/literals and valid encoded labels and shell operators. Existing positive quoting/redirection specimens use the same canonical source encoding; add no compatibility fallback or renderer dependency.

Run the planner/shared suites, installed-model check and whitespace check. Publish exact source/rendering/decoded preservation evidence and update the existing draft PR. Command behavior, reading paths and I/O contracts stay the same.
