# E14 candidate units

The dependency check groups E14's undelivered rows by declared component. Each candidate it reports is answered here.

| Candidate | Component | Answer |
| --- | --- | --- |
| W01, W02, W04, W05, W06, W08 | `workspace:skills/guidelines.md` | Split by rule: 16 criteria exceed the bound of six, and W04 needs W03, which needs W02. W01 and W02 are joined within it, and so are W05 and W06. W04 stays its own pull request, since it heads the path W07, W08, W09. |
| W07, W09 | `workspace:skills/scripts/check_skill_files.py` | Split by rule: W09 needs W08, which needs W07. |

No candidate is open, so no record line is needed for one. Each other row declares a component no other undelivered E14 row declares.

## Joined units

- **W01 and W02.** Both state citation rules in the shared guidelines and cover four criteria together. W02's dependency on W01 is dropped, since the joined pull request orders their commits.
- **W05 and W06.** Both state a rule in the shared guidelines and apply it to Work Planner's instruction files after W03. They cover six criteria, two of them retired placeholders, which meets the bound of six.
