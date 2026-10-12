# sprint-runner — Trigger Definition

## Verifiable goal

Per run: one phase transition from `SKILL.md`'s table, or none if every
sprint is waiting on a human gate. Per sprint: the tracking issue is closed
after G2. There is no run-to-completion state.

## State

- Durable: the open GitHub issue labelled `sprint` (body = plan, label =
  phase, comments = standups and review).
- Ephemeral: `.claude/sprint-state/` (gitignored) — plan drafts and the last
  standup digest.

## Trigger

### Manual

```
/run-sprint
```

### On a cadence (built-in `/loop`)

```
/loop 24h /run-sprint
```

`/loop` re-runs the command on an interval for as long as that Claude Code
session stays open; it is a convenience for an attended session, not a
server-side schedule. A daily interval fits: a standup a day, and gate
clearances are noticed within a day. Story issues are delivered by the
downstream loop, which you can put on its own cadence the same way
(`/loop 24h /run-backlog`).

> **Flag:** verify `/loop`'s interval syntax against the current Claude Code
> docs before relying on it — command surfaces change.

## Trigger notes

- Before the first live run, read `HUMAN-GATES.md` and run both label
  bootstrap scripts (see `SKILL.md` → How to run).
- The budget in `HUMAN-GATES.md` holds however often the loop fires.
