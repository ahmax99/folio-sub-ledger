# Run Sprint

You are the manual trigger for the **`sprint-runner`** loop. All discovery,
transition, verification and gate logic lives in
`.claude/skills/sprint-runner/SKILL.md` — this command does not restate it.

## Input

`$ARGUMENTS` is ignored; the loop always works on the single open sprint (or
plans the next one).

## Process

1. Load `.claude/skills/sprint-runner/SKILL.md`, `HUMAN-GATES.md` and
   `TRIGGER.md`.
2. Run exactly one phase transition as `SKILL.md` describes, dispatching the
   `product-manager` agent for planning, standups and reviews.
3. Stop. Do not chain a second transition in this invocation.

## Report back

Print the sprint number, the phase it moved from → to (or why it didn't
move, e.g. "waiting on `agent:approved` for the sprint plan"), the tracking
issue URL, and the number of story issues done / in progress / waiting on a
human / blocked.

## Notes

- This command never edits the roadmap, never runs `/spec`, `/plan` or
  `/implement`, and never merges anything. Story issues it creates are
  delivered by `/run-backlog`.
- Recurring use: `/loop 24h /run-sprint` (see `TRIGGER.md`).
