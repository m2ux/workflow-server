# Command Tag Validation

Source: `5006038c6`, compared with `f819e3b68e32aa014c4ca58648ce674e542cf773`.

- All 116 command payloads preserve exactly the same HTML-decoded syntax.
- Local CommonMark rendering confirms 463 visible argument links with the original destinations and role titles, and no custom placeholder elements or blockquotes. The source correction covers 49 commands.
- The checker rejects raw literal angle brackets inside invocation payloads, including linked labels and shell operators, while accepting encoded text and the actual wrappers.
- Shared checker suite: 280 passing tests. Planner suite: 944 run, 943 passed and one opt-in skip. Installed model: 58 files, zero findings. Whitespace check passes.

The correction changes encoding and its validation, with no altered procedure routes or I/O contracts. Local rendering does not establish GitHub UI behavior, live command execution or prerequisite-reading conformance.
