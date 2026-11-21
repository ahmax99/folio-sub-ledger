# Architecture decision records

One file per architecturally significant decision: what was decided, why, and what it costs. Rule files (`.claude/rules/`) say _what_ to do; an ADR says _why_, so nobody re-argues or undoes a decision without knowing its reason. Agents start every session cold, so the reason has to be written down.

## When a decision needs an ADR

Write one when the decision affects any of:

- **Structure** — module or package boundaries, what owns which data.
- **Quality attributes** — security, tenant isolation, performance, cost, reliability.
- **Dependencies** — adding or replacing a framework, service or vendor.
- **Interfaces** — API contracts, the BFF boundary, schemas shared through `@shared/config`.
- **Construction** — build, deploy, test or tooling choices that shape the architecture.
- **Accounting policy** — cost-basis method, lot-pool scope, fee treatment, price source, jurisdiction.

A decision that only one file cares about, and that a reader can reverse without surprise, does not need one.

## Files

- Name: `YYYY-MM-DD-<slug>.md`, slug matching `^[a-z0-9-]+$`. Dates instead of sequence numbers so parallel branches never claim the same number.
- Start from [`template.md`](template.md). Keep it to one or two pages.
- Cite an ADR by its file name, e.g. `docs/decisions/2026-11-21-one-firm-per-user.md`.

## Status and approval

| Status                 | Means                                                     | Who sets it |
| ---------------------- | --------------------------------------------------------- | ----------- |
| `Proposed`             | Drafted, not yet approved. Edit it freely until accepted. | Anyone      |
| `Accepted`             | Approved. Specs, plans and code must follow it.           | A human     |
| `Superseded by <file>` | Replaced by a later Accepted ADR. Kept for the history.   | A human     |

- **Agents write `Proposed` only.** Their own drafts never count as approval.
- **Only an Accepted ADR can be superseded.** The new ADR says `Supersedes: <old file>`; the old one's status becomes `Superseded by <new file>`. Never delete or rewrite an Accepted ADR's reasoning.
- A Proposed ADR that is rejected is deleted, not kept.

## Who reads and writes them

- `/spec` reads Accepted ADRs and flags a spec that contradicts one.
- `planner` (`/plan`) writes a Proposed ADR for each significant decision a plan makes.
- `accounting-domain-expert` writes Proposed ADRs for accounting-policy questions.
- `correctness-reviewer` and `security-reviewer` flag a diff that contradicts an Accepted ADR.

Find the decisions in force with `grep -l '^- Status: Accepted' docs/decisions/*.md`.
