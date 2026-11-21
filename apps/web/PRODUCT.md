# Product

<!-- Folio product context for impeccable and the design agents. Users and
journeys are expert assumptions until docs/research/ holds user evidence; the
ux-researcher agent proposes edits here when research changes them. -->

## Register

product

## Users

Accounting firms that keep crypto books for their clients. Folio is
multi-tenant: each firm is an organization, and inside it each client has a
portfolio of wallets and exchange accounts. Three roles use it daily or
weekly:

- **Owner** (practice lead). Sets up the firm, invites staff with roles,
  creates client portfolios and watches model spend. Uses Folio rarely, so
  setup must be obvious.
- **Analyst** (daily operator). Imports exchange CSVs and wallet addresses,
  works the review queue, reconciles balances and exports reports. A power
  user who lives on the keyboard and clears hundreds of transactions per
  client at month-end and tax season.
- **Reviewer** (senior specialist). Decides the hard cases assigned to them,
  with the evidence, precedents and the Analyst's note on one screen. Must see
  what is and isn't theirs to decide.

Two people never log in but shape the design: the firm's **client**, who
receives a calm report they can follow, and the **auditor**, who must trace any
number back to its lots, its price source and timestamp, and its approval.

They speak accountant: disposal, cost basis, realised gain, reconciliation,
period. Crypto jargon (gas, bridge, rebase) needs explaining in context.

## Product Purpose

A crypto sub-ledger for accounting firms. Folio imports a client's wallet and
exchange history, proposes a classification for every transaction (by rule,
transfer match or model), lets people review and approve those proposals,
computes cost basis and realised gains (FIFO) from append-only lots, reconciles
computed balances against on-chain balances, and exports the register and the
client report.

Model output never writes to the ledger: it lands as a proposal that a person
approves. Success: an Analyst closes a client's period in one sitting, every
open item is counted and named before export, and an auditor can defend every
number without asking the firm.

## Brand Personality

A well-kept working paper. Precise, calm, accountable. The interface shows its
work: who or what proposed a number, who signed it, and where it came from.
Confidence is earned by provenance, not asserted by styling. It should feel
like a careful senior accountant's file, never like a trading app or a
promotional dashboard.

## Anti-references

- The crypto-dashboard look: dark by default, neon, price tickers, a big
  portfolio-value number, green and red P&L styling.
- AI branding: "magic" proposals, sparkles, model confidence shown as certainty.
- SaaS-template maximalism: purple-to-blue gradients, glassmorphism cards,
  hero-metric blocks, identical icon-heading-text card grids.
- The cream/beige "warm neutral" default; Folio's paper is cool.
- Dashboard clutter: decorative charts, badges and stat tiles that don't answer
  a user question.
- Hidden provenance and silent zeros: a label with no "why", a number with no
  route to its source, a blank that could mean zero or unknown.

## Design Principles

1. **Show the trail.** Every proposed or computed number shows who or what
   produced it and links to its evidence, lots and price source. Machine
   proposals look different from human approvals (pencil and ink).
2. **Honest states.** Provisional, unclassified, missing basis, gaps, partial
   imports and a paused budget are visible, named and counted, never hidden or
   rendered as 0.
3. **Fast and safe bulk work.** The Analyst works from the keyboard at compact
   density; focus never gets lost; bulk actions show the count first and offer
   undo; confirmations state their consequence in numbers.
4. **Context is always on screen.** The firm, the client portfolio and the
   period are visible everywhere, and switching client is explicit.
5. **Colour carries meaning, never decoration.** Five status families, one
   meaning each, always with an icon and a label; negatives use a sign.
6. **Tokens are the only door.** Visual change happens in `src/styles/tokens/`
   and the Penpot tokens; components consume semantic classes.

## Accessibility & Inclusion

WCAG 2.1 AA: ≥4.5:1 text contrast (≥3:1 large text) and ≥3:1 for focus rings
and component boundaries, measured on the surfaces they actually sit on, in
light and dark. Full keyboard operation with a visible focus ring that differs
from hover, including inside dense grids; a `?` shortcut map reachable from
every keyboard surface. Status is never conveyed by colour alone. Screen-reader
labels on icon-only controls and announced row status. `prefers-reduced-motion`
alternatives for every animation.
