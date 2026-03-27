# Risk Assessment — WP-10: Server Core Cleanup

**Created:** 2026-03-27

---

## Risk Matrix

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| TraceStore eviction drops active session data | Medium | Low | LRU eviction targets oldest sessions; active sessions are recent by definition |
| `ResolvedServerConfig` type change breaks downstream imports | Medium | Low | Export both types; downstream code already uses `ServerConfig` |
| Promise cache in `getOrCreateServerKey` masks key-file errors | Low | Low | Clear cache on rejection to allow retry |
| Token validation rejects previously-accepted malformed tokens | Low | Low | Tokens are short-lived; malformed tokens should be rejected |
| `logWarn` truncation hides diagnostic data | Low | Medium | Set threshold high enough (8KB) to cover normal payloads |
| Removing `AuditEvent.timestamp` changes log format | Low | Low | No external consumers parse audit logs; format is internal |

---

## Overall Assessment

**Risk Level:** Low

All changes are localized, additive, and verified by the existing test suite. The highest-risk change (session eviction) uses a standard eviction pattern with a conservative default. No public API signatures change.
