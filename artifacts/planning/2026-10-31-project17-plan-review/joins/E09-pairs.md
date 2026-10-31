# E09 pair decisions

Each line records one current pair. Separate reviews do not authorize concurrent writes. Shared files require coordination; absent work-item declarations leave write-set safety unverified.

- E09:W01 and E09:W02: joined. One sync/theme update with one verification pass.
- E09:W01 and E09:W03: Separate reviews: Sync reads every epic and names its prefix (AC6, AC7) and Initiative membership and epic activity determine status (AC2, AC3) have distinct acceptance evidence and can be reverted independently. Complete actual write sets before parallel dispatch; one or both task declarations are missing.
- E09:W01 and E09:W04: Separate reviews: Sync reads every epic and names its prefix (AC6, AC7) and Ready and Backlog follow the initiative (AC4, AC5) have distinct acceptance evidence and can be reverted independently. Complete actual write sets before parallel dispatch; one or both task declarations are missing.
- E09:W01 and E09:W05: Separate historical delivery: the completed row retains its delivered PR; the unfinished scope receives its own review.
- E09:W01 and E09:W06: Separate reviews: Sync reads every epic and names its prefix (AC6, AC7) and The set a sync run reads (AC12, AC13) have distinct acceptance evidence and can be reverted independently. Complete actual write sets before parallel dispatch; one or both task declarations are missing.
- E09:W02 and E09:W03: Separate reviews: Name the planning theme and its board (AC8) and Initiative membership and epic activity determine status (AC2, AC3) have distinct acceptance evidence and can be reverted independently. Complete actual write sets before parallel dispatch; one or both task declarations are missing.
- E09:W02 and E09:W04: Separate reviews: Name the planning theme and its board (AC8) and Ready and Backlog follow the initiative (AC4, AC5) have distinct acceptance evidence and can be reverted independently. Complete actual write sets before parallel dispatch; one or both task declarations are missing.
- E09:W02 and E09:W05: Separate historical delivery: the completed row retains its delivered PR; the unfinished scope receives its own review.
- E09:W02 and E09:W06: Separate reviews: Name the planning theme and its board (AC8) and The set a sync run reads (AC12, AC13) have distinct acceptance evidence and can be reverted independently. Complete actual write sets before parallel dispatch; one or both task declarations are missing.
- E09:W03 and E09:W05: Separate historical delivery: the completed row retains its delivered PR; the unfinished scope receives its own review.
- E09:W03 and E09:W06: Separate reviews: Initiative membership and epic activity determine status (AC2, AC3) and The set a sync run reads (AC12, AC13) have distinct acceptance evidence and can be reverted independently. Complete actual write sets before parallel dispatch; one or both task declarations are missing.
- E09:W04 and E09:W05: Separate historical delivery: the completed row retains its delivered PR; the unfinished scope receives its own review.
- E09:W04 and E09:W06: Separate reviews: Ready and Backlog follow the initiative (AC4, AC5) and The set a sync run reads (AC12, AC13) have distinct acceptance evidence and can be reverted independently. Complete actual write sets before parallel dispatch; one or both task declarations are missing.
