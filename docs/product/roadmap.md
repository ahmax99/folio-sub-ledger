# Roadmap

Folio's MVP in dependency order. Story ids refer to the product requirements (epics 01 to 05). Items carry no calendar dates on purpose: see **Pace** below.

## Pace

Development happens on weekends, when there is free time. The roadmap and every sprint plan follow that:

- **Sprints are scope-boxed, not time-boxed.** A sprint ends when its stories are done, not when a date passes.
- **Capacity: 2 to 3 stories per sprint.** Each story is one `/spec → /plan → /implement → /qa` cycle and one PR, small enough for one or two weekend sessions.
- **Sprint `Dates` are a loose window.** The sprint-plan format needs them, so set the end date 6 weeks after the start. A skipped weekend should never force a sprint review. If the window passes with stories still open, they carry over; that is expected, not a failure.
- **Run `/run-sprint` by hand** at the start of a weekend session, not on a daily `/loop`.
- **Weekend estimates below are rough** and only for ordering. They are not commitments.
- **Design is part of the story, not extra work.** A UI story's Figma screens (`/spec` runs the `product-designer` agent in Design mode) and its `/design-review` after `/implement` count inside that story's place in the 2-to-3-story budget.

## Design track

Design runs alongside the build, not as a separate phase. R0 sets up the foundations once; after that, each roadmap item with screens carries a **Design** line: its screens are designed in Figma before `/implement` and checked with `/design-review` after.

## R0 · Design foundations

- Status: now (runs alongside R1; it needs no code)
- Outcome: Folio has its own product context, design tokens, Figma library and personas, so every later screen is designed from the same base.
- Depends on: none
- Rough size: 1 to 2 weekends
- Scope:
  - Replace the boilerplate `apps/web/PRODUCT.md` and `DESIGN.md` with Folio's (re-run `/impeccable init`): accounting-firm users, a dense review surface for operators and a calm reporting surface for clients
  - Figma file with Foundations and Components pages that mirror `DESIGN.md` tokens and the atomic component layers (`product-designer` agent)
  - Personas for Owner (Priya), Analyst (Sam) and Reviewer (Dana) and their main journeys in `docs/research/` (`ux-researcher` agent)

## R1 · Foundation: tests, CI checks and tenancy

- Status: now
- Outcome: A firm signs up and its data is provably isolated from every other firm.
- Depends on: none
- Rough size: 4 to 6 weekends
- Scope:
  - Vitest with a test database, and a CI workflow that runs type-check, lint, format and tests on every PR (enabler for the proofs below)
  - Remove the Post/Comment/image boilerplate and reset the `init` migration
  - Organization, and Owner/Analyst/Reviewer roles as `orgId` and `role` on User; signup creates the user, firm and Owner in one transaction (story 1.1)
  - `orgId` on every domain table, CASL built from org and role, two-firm test expecting 404 (story 1.3)
  - Postgres row-level security proven by a raw cross-tenant query test (story 1.3); prototype on Neon first
  - Design: signup, firm creation, member invites and role management screens

## R2 · Data in

- Status: next
- Outcome: An Analyst creates a portfolio per client and imports Ethereum wallets and exchange CSVs, and can see whether the data is complete.
- Depends on: R1
- Rough size: 5 to 7 weekends
- Scope:
  - Portfolios nested inside org scoping (story 2.1)
  - Core data model: accounts/sources, canonical events with a unique hash, prices with source and timestamp, exact decimal quantities
  - Exchange CSV import first, then Ethereum ingestion
  - Coverage panel and untracked-counterparty warning (story 2.4)
  - Provisional transactions and reorg handling (story 3.4)
  - Design: portfolio list, source connection and import flow with progress, coverage panel

## R3 · Deterministic classification

- Status: later
- Outcome: Most transactions are classified by rules, and transfers between a client's own wallets are matched, without calling the model.
- Depends on: R2
- Rough size: 3 to 4 weekends
- Scope:
  - Label taxonomy and proposal schema in `@shared/config` (shared with R4's evals)
  - Rules engine, transfer matcher and token map (first half of story 4.1)

## R4 · AI classification

- Status: later
- Outcome: Transactions the rules can't resolve get a model proposal with evidence, measured against a golden set before it ships.
- Depends on: R3
- Rough size: 5 to 7 weekends
- Scope:
  - Golden set, rules-only baseline and eval gates in CI, written before the first prompt; Mastra evals score the golden set (story 9.1)
  - SQS worker running a Mastra workflow on Bedrock (Vercel AI SDK provider), producing proposals with evidence (stories 4.1, 4.2)
  - Per-org token budget (story 9.3) and prompt-injection suite (story 9.4)

## R5 · Review

- Status: later
- Outcome: An Analyst or Reviewer works through a queue of proposals, and corrections become rules.
- Depends on: R4
- Rough size: 4 to 6 weekends
- Scope:
  - Review queue and two-pane review UI with precedent search (story 5.1), built on TanStack Query, Table + Virtual, Hotkeys for the review shortcuts and Pacer for debounced search
  - Rule learning from corrections (story 5.2)
  - Reviewer assignments (story 5.3)
  - Design: review queue, two-pane proposal view with evidence and precedents, keyboard-shortcut map, Reviewer's assigned queue; a usability walkthrough with the Analyst and Reviewer personas (`ux-researcher`)

## R6 · Cost basis, reconciliation and exports

- Status: later
- Outcome: A firm exports a client's register and realised gains with FIFO cost basis, reconciled against on-chain balances.
- Depends on: R5
- Rough size: 4 to 6 weekends
- Scope:
  - Append-only lots and disposals; FIFO engine with `missing_basis` flagging (stories 6.1, 6.2)
  - Reconciliation of computed vs on-chain balances (story 7.1)
  - Register and realised-gains exports (story 8.2); grids on TanStack Table + Virtual
  - Design: lots and gains views, reconciliation gap view, export screens and the client-facing report layout

## R7 · Hardening for first clients

- Status: later
- Outcome: The product is safe to put real client data in.
- Depends on: R6
- Rough size: 2 to 4 weekends
- Scope:
  - Reversible canary deploys (story 9.7), alarms and runbooks
  - Content-Security-Policy header and Sentry scrubbing of request bodies, wallet addresses and emails
  - Per-org retention setting and full-org deletion

## R8 · After MVP

- Status: later
- Outcome: Wider coverage once the MVP is in use.
- Depends on: R7
- Scope:
  - LIFO and HIFO methods, journal entries and GL export
  - More chains, direct exchange APIs, billing
  - Mastra agent features: reconciliation-gap investigation, finding the matching leg of a transfer or missing basis, DeFi and bridge decoding, an accountant Q&A assistant (agents propose; a human posts)

## Decisions needed before an item starts

- **Before R2:** FIFO lot pooling per portfolio+asset or per wallet/account, MVP jurisdiction (US only or also UK), and the default fee policy. These shape the data model.
- **Before R1's permissions story:** whether Owners also get Analyst abilities.
- **Before R3:** `unknown` vs `unclassified` as the no-evidence label.
- **Before R7:** data residency (US only or EU too) and the audit target (SOC 2 and/or SOC 1).
