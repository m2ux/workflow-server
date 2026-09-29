# Exitless End Workflow

A graph whose last activity declares no exits: `open` exits to `close`, and `close` names nowhere to go.

The walk still completes its session. The activity with no exits ends the run the way an exit bound to `__terminal__` does, so the advance that retires `close` enters `__terminal__`.

Walk it as `workflow_id: exitless-end`.

## Copying from it

Take this when a walk needs a graph that ends without a terminal exit. It holds two activities and no steps. A terminal exit, a fan or a checkpoint belongs on a different specimen.
