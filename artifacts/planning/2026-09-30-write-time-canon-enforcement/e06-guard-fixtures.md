# Guard and listing fixtures

Engine `i09/main` at `7dc26dba`. `WORKFLOWS_DIR` pointed at a missing directory, so the live corpus test is skipped. That test is the paired run.

`npx vitest run tests/fires-on-ids-guard.test.ts tests/list-fires-on.test.ts` reports 2 files, 113 passed, 1 skipped.

The guard file covers an unknown id, an id naming a removed schema field, a unit with no Fires-on line, a repeated line, and a line not directly under its title. The listing file covers a field id whose listed units include the id, a prefix, the bare kind, and `*`.
