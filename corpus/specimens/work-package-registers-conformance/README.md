# Work Package Registers Conformance

A specimen of one form: a workflow borrowing another workflow's techniques by `::` address and holding them to a negative and a positive case.

The techniques are the work-package deferred-items register's: appending deferrals, recording an issue raised for one, and collecting the deferrals that name no issue yet. The negative case collects before anything is deferred, so no register exists and the collection is empty. The positive case collects after two deferrals are appended and the first is raised, so the collection holds the second alone.

| Activity | Binds | Case |
|---|---|---|
| `negative-case` | `work-package::raise-deferred-items::collect` | no register |
| `record-deferrals` | `work-package::manage-registers::append-deferred-item`, `work-package::raise-deferred-items::record` | two deferrals, the first raised |
| `positive-case` | `work-package::raise-deferred-items::collect` | a register holding one raised and one unraised entry |
| `report-cases` | nothing — reports what each collection landed against the shared [case report](/conformance/resources/case-report.md) guide | |
