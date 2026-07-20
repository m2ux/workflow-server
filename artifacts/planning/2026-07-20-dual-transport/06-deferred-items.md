# Deferred Items

> Dual Transport Support · issue skipped · updated 2026-07-20

| ID | Deferred at | Item | Reason | Follow-up |
|----|-------------|------|--------|-----------|
| D-1 | Plan & Prepare | Authentication/authorization for the HTTP transport | Out of scope for this work package — HTTP is opt-in, off by default, and intended to sit behind network-level access control or a reverse proxy in this phase | — until raised |
| D-2 | Implement (Task 3); expanded at Post-Impl Review | HTTP session resumability (`EventStore`), multi-process session sharing, and idle-session eviction | The per-process, in-memory `Map<sessionId, StreamableHTTPServerTransport>` in `src/transports/http.ts` is lost on restart, isn't shared across replicas, and has no idle-timeout/max-sessions cap — acceptable for this work package's single-process, trusted-network, low-concurrency deployment model; not required by any success criterion | — until raised |
