# Work Package Contract-Tests Fan Conformance

A specimen of the implementation fan: a contract-tests stub and a stub implement branch converge on implementation-join, which hoists the contract-tests container and confirms base failures.

| Activity | Borrows | Role |
|---|---|---|
| `take-case` | nothing | opens the case |
| `surface-contract-tests` | nothing | stub contract-tests branch (red on base) |
| `stub-implement` | nothing | stub implement branch |
| `implementation-join` | nothing (specimen-local hoist) | hoists and validates |
| `record-case` / `report-cases` | nothing | case report |
