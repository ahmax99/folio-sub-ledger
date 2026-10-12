# Sprint 1: Firms can sign up and stay isolated

- Status: proposed
- Dates: 2026-10-12 → 2026-10-25
- Capacity: 3
- Roadmap: R1

## Sprint goal

A new user can create a firm, and no firm can read another firm's data.

## Stories

### S1.1 · Signup creates the firm

- Roadmap: R1
- Size: M
- Accounting: maybe
- Depends on: none

**Story:** As an Owner, I want signing up to create my firm, so that I can start without configuration.

**Acceptance criteria**

- [ ] Signup creates the user, organization and Owner membership in one transaction.
- [ ] A failure rolls back so no Cognito user is left without an org.

### S1.2 · Cross-tenant reads return 404

- Roadmap: R1
- Size: M
- Accounting: maybe
- Depends on: S1.1

**Story:** As an Analyst, I want other firms' ids to be invisible to me, so that client data never leaks.

**Acceptance criteria**

- [ ] Every read endpoint returns 404 for another org's ids.

## Risks and decisions needed

- Does Owner inherit Analyst abilities? Decide before S1.2's CASL rules.
