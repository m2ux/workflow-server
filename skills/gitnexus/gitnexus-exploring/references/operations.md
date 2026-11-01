# GitNexus Exploring Operations

The procedure that explores a codebase through the GitNexus knowledge graph, and the resources, tool calls and example it consults.

## Procedure

### Explore a Codebase

1. **Discover repositories.**
   Read `gitnexus://repos` for the indexed repositories.
2. **Read the overview.**
   Read `gitnexus://repo/{name}/context` for the codebase overview and the index's freshness.
3. **Find related flows.**
   Run `gitnexus_query({query: "<what you want to understand>"})` for the concept to find its execution flows.
4. **Review the processes.**
   Review the processes, the execution flows, the query returns.
5. **Read key symbols.**
   Run `gitnexus_context({name: "<symbol>"})` on each key symbol for its callers and callees.
6. **Trace full flows.**
   Read `gitnexus://repo/{name}/process/{name}` for each full execution trace.
7. **Read the implementation.**
   Read the source files for implementation details.

## Reference

### Resources

| Resource                                | What you get                                            |
| --------------------------------------- | ------------------------------------------------------- |
| `gitnexus://repo/{name}/context`        | Stats, staleness warning (~150 tokens)                  |
| `gitnexus://repo/{name}/clusters`       | All functional areas with cohesion scores (~300 tokens) |
| `gitnexus://repo/{name}/cluster/{name}` | Area members with file paths (~500 tokens)              |
| `gitnexus://repo/{name}/process/{name}` | Step-by-step execution trace (~200 tokens)              |

### Tools

#### gitnexus_query

Finds the execution flows related to a concept.

```
gitnexus_query({query: "payment processing"})
→ Processes: CheckoutFlow, RefundFlow, WebhookHandler
→ Symbols grouped by flow with file locations
```

#### gitnexus_context

Gives a 360-degree view of a symbol.

```
gitnexus_context({name: "validateUser"})
→ Incoming calls: loginHandler, apiMiddleware
→ Outgoing calls: checkToken, getUserById
→ Processes: LoginFlow (step 2/5), TokenRefresh (step 1/3)
```

### Example: How Does Payment Processing Work?

```
1. READ gitnexus://repo/my-app/context       → 918 symbols, 45 processes
2. gitnexus_query({query: "payment processing"})
   → CheckoutFlow: processPayment → validateCard → chargeStripe
   → RefundFlow: initiateRefund → calculateRefund → processRefund
3. gitnexus_context({name: "processPayment"})
   → Incoming: checkoutHandler, webhookHandler
   → Outgoing: validateCard, chargeStripe, saveTransaction
4. Read src/payments/processor.ts for implementation details
```
