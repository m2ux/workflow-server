---
metadata:
  version: 1.0.0
---

## Capability

Shared base contract for a workflow's techniques. Any Inputs, Outputs, or Rules defined here are inherited by every technique in this workflow. A Protocol here WRAPS each descendant's own protocol: blocks titled `Initial` are placed before, blocks titled `Final` after, and the server renumbers the combined sequence; any other protocol block here is delivered only when this contract is referenced directly. The wrap is recursive — every ancestor container (this root and any containing group) contributes its `Initial`/`Final`. The technique set is implied by the folder contents — do not list techniques here. Keep this minimal: only genuinely cross-technique contract belongs here.
