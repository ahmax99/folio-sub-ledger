# One firm per user

- Status: Proposed
- Proposed: 2026-11-21 by Claude, from the Sprint 2 plan (#60)
- Accepted:
- Supersedes: none

## Context

S2.2 lets an Owner invite a colleague by email. That raises the question of what happens when the invited person already belongs to another firm.

Today one Cognito identity is one firm member. `User` carries `orgId` and `role`, and `cognitoSub` is `@unique` (`shared/neon/prisma/schema.prisma`). #46 (2026-11-03) chose this shape instead of a separate membership table. The isolation chain depends on it: the `organization` macro resolves the caller's single `member` row from `cognitoSub`, `organizationDb` sets `app.org_id` from that row's `orgId`, and CASL is built from the same row.

Options:

1. **One firm per user.** An identity that already belongs to a firm can't accept an invitation to another firm.
2. **Several firms per user.** A `Membership` table (user, organization, role), a firm switcher, and an active firm chosen on each request.

## Decision

We will keep one firm per Cognito identity for the MVP.

- An invitation is refused **at acceptance** when the signed-in identity already has a `users` row. The invitee sees a clear message, and no row is created or changed.
- The inviter gets no signal about other firms. Creating an invitation for an email that belongs to another firm gives the same response as for an unknown email.
- To change firms, a person is first removed from their current firm (S2.3), or uses a different email identity.

**Technical justification.** Every request resolves exactly one organization from the caller's identity, and RLS, CASL and `organizationDb` all build on that. Several firms per user needs an active-firm choice carried on every request through the BFF. `auth_session` holds only the refresh token (an `architecture.md` invariant), so that choice needs a new, validated input on every call. That is new security surface in the tenancy boundary.

**Business justification.** Time to market: S2.2 is the last open part of R1, and R2 waits on it. Folio's users are a firm's own staff, who work for one firm. A contractor who serves several firms is rare at MVP and can use a second email.

## Consequences

- No change to the schema, the `organization` macro or RLS. Invitations stay a single-firm feature.
- The acceptance check can't run at invitation time: the inviter's RLS-bound `db` can't see other firms' users, and bypassing it to check would leak which emails use Folio.
- An accountant who works for two firms needs two identities. Support may hear about this.
- Moving to several firms later means a data migration (`users.org_id` and `role` into membership rows), a new request input for the active firm, and changes to the `organization` macro. That change gets a new ADR that supersedes this one.

## Compliance

- Schema: `cognitoSub @unique` on `User` makes a second `users` row for the same identity fail in the database.
- S2.2 integration tests: accepting an invitation as an identity that already has a `users` row is refused and creates no row; creating an invitation for an email in another firm returns the same response as for an unknown email.
- `security-reviewer` checks S2.2 for an invite flow that reveals another firm's members.

## Alternatives

- **Membership table now.** Rejected for the MVP: it reopens the tenancy boundary that #56 just proved, for a user group that barely exists yet.
- **Refuse at invitation time.** Rejected: the check needs a cross-tenant read, and the answer tells the inviter that the email belongs to another firm.

## Sources

- #60 Sprint 2 plan, "Risks and decisions needed"
- #46 signup creates the firm and its Owner; #56 CASL and Postgres RLS isolation
- `.claude/rules/architecture.md`, "Organization isolation" and the auth invariants
