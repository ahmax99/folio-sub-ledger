# Owners get Analyst abilities

- Status: Proposed
- Proposed: 2026-11-21 by Claude, from the Sprint 2 plan (#60) and the roadmap
- Accepted:
- Supersedes: none

## Context

Folio has three roles: `OWNER`, `ANALYST` and `REVIEWER`. Today `getUserPermissions` (`apps/api/src/modules/auth/permission.ts`, mirrored in `apps/web/src/features/auth/lib/permission.ts`) lets an Owner manage the organization and its users. No Analyst resources exist yet. R2's first portfolio story writes the first Analyst rule (create portfolios, import data). The roadmap lists this question under "Decisions needed before an item starts".

Options:

1. **Owner is a superset of Analyst.** An Owner can do everything an Analyst can, plus administration.
2. **Owner administers only.** An Owner who wants to do the work needs a separate Analyst identity.

## Decision

We will make the Owner role a superset of the Analyst role. Every ability granted to `ANALYST` is also granted to `OWNER`, plus the Owner-only administration abilities.

- `getUserPermissions` builds the Analyst rules in one place and applies them to both roles, so the two can't drift.
- This decision does not give Owners the Reviewer role's abilities. R5 decides those, and must say whether one person may approve their own work.

**Business justification.** In a small firm the Owner is usually also the main practitioner. Option 2 would force them to keep a second identity, and under `2026-11-21-one-firm-per-user.md` that also means a second email address. That friction lands on the first user of every new firm.

**Technical justification.** A superset is one shared rule set. It adds no new code path and is simple to test.

## Consequences

- A one-person firm can sign up and start importing data with no second account.
- An Owner account carries the widest permissions in a firm. The added risk is small, because an Owner can already manage every user.
- The audit trail must record the acting user, not only their role, so an Owner's own work stays attributable. Later stories must keep that.
- A firm that wants an admin-only Owner would need a per-firm setting later. That is not in the MVP.

## Compliance

- A unit test on `getUserPermissions`: for every action and subject an Analyst can perform, an Owner of the same firm can too. It runs against the API and the web copy of the rules.
- `correctness-reviewer` checks that a new Analyst rule goes through the shared rule set, not a role-specific branch.

## Alternatives

- **Owner administers only.** Rejected: a separation of duties that small firms don't have, at the cost of a second identity per Owner.
- **Owner gets Analyst and Reviewer abilities now.** Deferred to R5: it lets one person prepare and approve the same work, which an auditor will ask about.

## Sources

- #60 Sprint 2 plan, "Risks and decisions needed"
- `docs/product/roadmap.md`, "Decisions needed before an item starts"
- `apps/api/src/modules/auth/permission.ts`
