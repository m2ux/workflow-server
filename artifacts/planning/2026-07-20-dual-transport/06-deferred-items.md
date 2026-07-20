# Deferred Items

> Dual Transport Support · issue skipped · updated 2026-07-20

| ID | Deferred at | Item | Reason | Follow-up |
|----|-------------|------|--------|-----------|
| D-1 | Plan & Prepare | Authentication/authorization for the HTTP transport | Out of scope for this work package — HTTP is opt-in, off by default, and intended to sit behind network-level access control or a reverse proxy in this phase | — until raised |
| D-2 | Implement (Task 3) | HTTP session resumability (`EventStore`) and multi-process session sharing | The per-process, in-memory `Map<sessionId, StreamableHTTPServerTransport>` in `src/transports/http.ts` is lost on restart and isn't shared across replicas — acceptable for this work package's single-process, trusted-network deployment model; not required by any success criterion | — until raised |
