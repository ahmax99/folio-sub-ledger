---
name: Folio Ledger
description: A working-paper design system for a crypto sub-ledger used by accounting firms. Cool white paper, blue-black ink, five status families, and a pencil-and-ink approval vocabulary.
colors:
  primary: '#1e3a5f'
  primary-foreground: '#ffffff'
  background: '#fcfcfc'
  foreground: '#14171c'
  card: '#ffffff'
  secondary: '#ebebeb'
  muted: '#f5f5f5'
  muted-foreground: '#4e5562'
  border: '#e4e4e4'
  input: '#868c96'
  ring: '#1e3a5f'
  destructive: '#b3261e'
  destructive-foreground: '#ffffff'
  status-confirmed: '#17643a'
  status-confirmed-surface: '#e7f4ec'
  status-pending: '#8a4b00'
  status-pending-surface: '#fdf1dc'
  status-blocking: '#b3261e'
  status-blocking-surface: '#fdecea'
  status-assigned: '#1d4ed8'
  status-assigned-surface: '#e8effd'
  status-machine: '#4e5562'
  status-machine-border: '#7b828d'
  numeric-negative: '#14171c'
  row-selected: '#eef2f8'
  row-focus: '#1e3a5f'
typography:
  display:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '3rem'
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: '-0.01em'
  headline:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: '0'
  title:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '1.25rem'
    fontWeight: 500
    lineHeight: 1.375
    letterSpacing: '0.01em'
  body:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.01em'
  body-sm:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: '0.01em'
  label:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '0.875rem'
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: '0.01em'
  label-compact:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: '0.01em'
  caption:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: '0.01em'
  cell-compact:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.538
    letterSpacing: '0.01em'
  status:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '0.8125rem'
    fontWeight: 500
    lineHeight: 1.538
    letterSpacing: '0.01em'
  status-compact:
    fontFamily: 'Geist Sans, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.33
    letterSpacing: '0.01em'
  numeric:
    fontFamily: 'Geist Mono, monospace'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: '0'
  numeric-compact:
    fontFamily: 'Geist Mono, monospace'
    fontSize: '0.8125rem'
    fontWeight: 400
    lineHeight: 1.538
    letterSpacing: '0'
  mono:
    fontFamily: 'Geist Mono, monospace'
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0'
  report-title:
    fontFamily: 'Source Serif 4, serif'
    fontSize: '1.5rem'
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: '0'
rounded:
  sm: '2px'
  md: '4px'
  lg: '6px'
  xl: '10px'
spacing:
  xs: '2px'
  sm: '4px'
  md: '8px'
  lg: '16px'
  xl: '32px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.primary-foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
  button-secondary:
    backgroundColor: '{colors.secondary}'
    textColor: '{colors.foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '8px 16px'
  input:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '8px 12px'
  card:
    backgroundColor: '{colors.card}'
    textColor: '{colors.foreground}'
    rounded: '{rounded.xl}'
    padding: '24px'
  badge:
    backgroundColor: '{colors.muted}'
    textColor: '{colors.muted-foreground}'
    typography: '{typography.label}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  status-badge-approved:
    backgroundColor: '{colors.status-confirmed-surface}'
    textColor: '{colors.status-confirmed}'
    typography: '{typography.status-compact}'
    rounded: '{rounded.sm}'
    padding: '2px 8px 2px 6px'
  status-badge-proposed:
    backgroundColor: 'transparent'
    textColor: '{colors.status-machine}'
    borderColor: '{colors.status-machine-border}'
    borderStyle: 'dashed'
    typography: '{typography.status-compact}'
    rounded: '{rounded.sm}'
    padding: '2px 8px 2px 6px'
  table-row-compact:
    height: '32px'
    typography: '{typography.cell-compact}'
    padding: '6px 8px'
  table-row-comfortable:
    height: '40px'
    typography: '{typography.body-sm}'
    padding: '10px 12px'
  amount:
    textColor: '{colors.foreground}'
    typography: '{typography.numeric-compact}'
    textAlign: 'right'
---

# Design System: Folio Ledger

## 1. Overview

**Creative North Star: "The Working Paper"**

Folio looks like a well-kept accountant's working paper: cool white paper,
blue-black ink, ruled lines, and a margin where every figure is initialled.
It is quiet enough for a client to read and strict enough for an auditor to
tick against. Nothing glows. Certainty is something a person signs for, so the
interface shows, on every row, whether a number was proposed by a machine or
approved by a person, and where it came from.

The users are accountants: an Owner who sets up the firm, an Analyst who works
hundreds of transactions at month-end from the keyboard, and a Reviewer who
decides the hard cases (see `PRODUCT.md`). The design serves auditable numbers
and fast, safe bulk work. It rejects the crypto-dashboard look (dark by default,
neon, tickers, a big portfolio number, green and red P&L) and SaaS-template
maximalism.

**Key Characteristics:**

- Neutral paper and ink carry the screen; colour appears only as one of five
  status families, as the ink primary, or as focus and selection
- **Pencil and ink:** a machine proposal is drawn in pencil (dashed outline,
  italic, a proposer glyph); approving inks it (solid, upright, initials in the
  trail margin)
- Every numeral in Geist Mono, right-aligned, signed with "−", with its unit
- Two density tiers: compact 32px rows for work surfaces, comfortable 40px for
  setup and reports
- Firm, client and period are always visible in the `ContextBar`
- Every visual value flows from `src/styles/tokens/`; components consume
  semantic classes (`bg-primary`, `text-status-confirmed`) exclusively
- Full light/dark parity; dark is composed, not inverted

The Penpot file (see `## Penpot`) is the design source of truth and leads the
code. Until `src/styles/tokens/` catches up, the values here and in Penpot are
the target, and the CSS lists in `## Penpot` say what the code must change.

## 2. Colors

Cool neutrals, one ink primary, and five semantic status families. Each family
has one meaning across the whole app.

### Primary

- **Ink** (#1E3A5F light / #C8D6EE dark): primary actions, the focus ring, the
  focused row and `sidebar-primary`. 11.5:1 with white text. Spend it only on
  the primary action, focus and selection.

### Neutral

- **Paper** (#FCFCFC light / #0B0D10 dark): the app canvas. Cool, never cream.
- **Card** (#FFFFFF / #111418): cards, popovers, inputs. The dark card is one
  step lighter than the dark canvas.
- **Text Ink** (#14171C / #E6E8EB): every foreground on a neutral surface.
  Distinct from the Ink primary.
- **Whisper Gray** (#F5F5F5): muted fills, skeletons, the Unclassified badge.
- **Control Gray** (#EBEBEB): secondary button fills.
- **Input Border** (#868C96 / #666E7A): input and checkbox borders. 3.3:1 on the canvas, so the control's edge passes the 3:1 non-text minimum.
- **Hairline** (#E4E4E4): borders, dividers and ruled lines.
- **Slate Text** (#4E5562 / #A4ABB6): muted foreground, descriptions,
  captions. 6.9:1 on muted; do not lighten it.
- **Row Selected** (#EEF2F8 / #16233A): the selected-row fill.

### Status families

Text sits on its own surface in each family; ratios are in `## Penpot`.

- **Confirmed** (green #17643A on #E7F4EC): a person or the chain settled it.
  Approved, reconciled.
- **Pending** (amber #8A4B00 on #FDF1DC): not final yet. Provisional,
  importing, partial.
- **Blocking** (red #B3261E on #FDECEA, = `destructive`): stops export or can't
  be undone. Missing basis, gap, failed import, destructive actions,
  validation errors.
- **Assigned** (blue #1D4ED8 on #E8EFFD): with a named reviewer.
- **Machine** (Slate Text with a #7B828D dashed border, no fill): proposed and
  not yet signed by anyone.

### Named Rules

**The One Meaning Rule.** A colour family means one thing everywhere. Never use
a status colour for decoration, and never use a different colour for a status.

**The Never Colour Alone Rule.** Every status has an icon and a plain-language
label; negatives use the "−" sign, never red; pencil and ink differ by outline
and glyph as well as colour. A screen read in greyscale must still make sense.

**The Paper Rule.** Neutral paper and ink carry the screen. If a screen needs
emphasis, reach for weight, space and position before hue. No gradients, glows
or tinted canvases.

**The Token Door Rule.** Colour enters components only as semantic classes
(`bg-primary`, `text-muted-foreground`, `bg-status-pending-surface`). A raw hex
value or Tailwind palette colour (`bg-blue-500`) in a component is a defect.

## 3. Typography

**UI Font:** Geist Sans (with system sans-serif fallback)
**Numeric / ID Font:** Geist Mono
**Report Font:** Source Serif 4 (client reports and period statements only)

**Character:** Geist carries the interface: technical, calm, legible at 13px.
Geist Mono carries every numeral, so figures line up in columns without relying
on a tabular-figures feature, and hashes read with distinct 0/O and 1/l. Source
Serif 4 gives the client report a calm, document voice.

### Hierarchy

- **Headline** (600, 1.875rem, 1.25): page titles.
- **Title** (500, 1.25rem, 1.375): card titles, dialog titles and section headings.
- **Body** (400, 1rem, 1.5, +0.01em): default text; cap prose at 65–75ch.
- **Body-sm** (400, 0.875rem, 1.43): descriptions, comfortable table cells, nav labels.
- **Label** (500, 0.875rem, 1.25): buttons, form labels, comfortable table headers, the active nav item.
- **Label-compact** (500, 0.75rem, 1.33): compact table headers (32px rows).
- **Cell-compact** (400, 0.8125rem, 20px line): text in compact grid rows.
- **Status / Status-compact** (500, 13px / 12px): StatusBadge labels.
- **Numeric / Numeric-compact** (Geist Mono 400, 14px / 13px, tracking 0):
  every amount, quantity, count and date column. Right-aligned, unit always
  shown, per-asset precision (ETH 4 dp, BTC 8 dp, USD 2 dp), full value on
  hover and copy.
- **Mono** (400, 0.875rem): IDs, hashes and code.
- **Report-title** (Source Serif 4 500, 1.5rem, 1.25): client report and
  statement headings only.
- **Display** (600, 3rem, 1.1): marketing pages only. The app has no hero numbers.

### Named Rules

**The Two Faces Rule.** Geist for the UI, Geist Mono for every numeral. Source
Serif 4 is the one deliberate exception, for report and statement surfaces
only, never in the app UI. A further face is a design decision made in
`tokens/fonts.css` and recorded here, never inline.

**The Honest Number Rule.** Zero, unknown, not applicable and missing basis
look different: "0.00 ETH", "Unknown", "—", "No basis". Missing basis never
renders as 0. Provisional amounts are italic with a clock. No confidence
figures anywhere.

## 4. Elevation

Structure is drawn, not lifted. Hairline borders and ruled lines do the
primary work, as on a working paper. Shadows are a whisper (1–2px offsets at
9–18% black) that separates floating surfaces (popovers, dialogs, the bulk
action bar) from the page. Cards at rest carry at most `shadow-2xs`; nothing on
the canvas casts a dramatic shadow.

### Shadow Vocabulary

- **Resting** (`0px 1px 2px 0px hsl(0 0% 0% / 0.09)`): cards, inputs.
- **Raised** (`0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 2px 4px -1px hsl(0 0% 0% / 0.18)`): dropdowns, popovers, the client switcher.
- **Floating** (`0px 1px 2px 0px hsl(0 0% 0% / 0.18), 0px 8px 10px -1px hsl(0 0% 0% / 0.18)`): dialogs, sheets, the floating BulkActionBar.

### Named Rules

**The Drawn-Not-Lifted Rule.** If a border can express the boundary, use the
border. Shadows are reserved for surfaces that genuinely float above the page,
and always sit on top of a border, never replace it.

## 5. Components

Components come from shadcn/ui and live in `src/components/` (atoms →
molecules → organisms → layout); feature-specific ones live in
`features/<name>/components/`. Their feel is a working paper: flat surfaces,
crisp ruled edges, instant feedback, and nothing that moves without a reason.
`## Penpot` maps each Penpot component to its shadcn base.

### Buttons

- **Shape:** gently rounded (`radius.md`, 4px), 36px default height; `xs` is
  28px for row actions in compact grids.
- **Primary:** Ink (#1E3A5F) with white text, 8px 16px padding, Label type.
  One primary action per decision point.
- **Hover / Focus:** ~90% opacity shift on hover; a 2px Ink focus ring offset
  from the element, visibly different from hover. No transforms.
- **Secondary / Ghost / Destructive:** Control Gray fill / transparent with a
  hover fill / Blocking red. All via shadcn `variant` props, never custom classes.
- **Labels:** verb + object ("Approve 48 proposals", "Export register"), never
  OK or Submit. Keyboard shortcuts show as `Kbd` hints.
- **Loading:** compose `Spinner` + `disabled`; no bespoke spinners.

### Status and numbers

- **StatusBadge:** icon + label, `radius.sm`. Proposed by rule, transfer or
  model is pencil (dashed Machine border, no fill, italic label, proposer
  glyph). Approved, reconciled, provisional, missing basis, assigned, gap,
  importing and failed are ink (solid family surface). Unclassified uses the
  Whisper Gray fill and no proposer glyph.
- **Amount:** Geist Mono, right-aligned, signed with "−", unit always shown,
  per-asset precision; the states in the Honest Number Rule.
- **ProposerMark:** the trail-margin glyph (rule, transfer, model) that becomes
  the approver's initials once approved. It is a glyph, never a coloured side
  stripe.

### Tables and grids

- **Density:** compact 32px rows (6px 8px cell padding, Cell-compact type) for
  the review queue and every work grid, at least 25 rows at 1440×900;
  comfortable 40px rows (10px 12px) for setup and reports. No other row height.
- **Columns:** select checkbox, then the 40px trail margin, then data columns.
  Amounts right-aligned; headers sticky with an opaque fill.
- **States:** hover (muted fill), selected (Row Selected fill + checked
  checkbox), focused (2px Ink ring, inset), and selected + focused. Exactly one
  focused row.
- **Bulk work:** the `BulkActionBar` shows the count first, then the actions
  with their keys, then undo. Focus moves to the next row after an action and
  is never lost.

### Cards / Containers

- **Use:** setup forms and the client report. Work surfaces use grids and
  panes, not cards.
- **Corner Style:** `radius.xl` (10px). **Border:** 1px Hairline.
- **Background:** Card on Paper. **Shadow:** Resting or border only.
- **Internal Padding:** 24px, via full Card composition
  (`CardHeader`/`CardContent`/`CardFooter`).

### Inputs / Fields

- **Style:** Card fill, 1px Input Border, `radius.md` (4px), 8px 12px
  padding. A compact size (32px, 6px 8px padding, Cell-compact type) edits
  cells and filters inside compact grids.
- **Focus:** border shifts to Ink plus a 2px ring; no glow.
- **Error / Disabled:** Blocking red border + `aria-invalid`/`data-invalid` per
  shadcn Field rules, with the message inline; disabled drops to 50% opacity.
- **Layout:** always `FieldGroup` + `Field`, never raw divs with spacing
  utilities. Labels persist; placeholders are examples only.

### Navigation and context

- **AppShell:** the `ContextBar` (firm, client switcher, period, "as of" time,
  `?` shortcut map, avatar) runs full width above a 220px sidebar that
  collapses to 48px icons. Switching client is an explicit action.
- **Nav items:** 32px, Text Ink on Paper; active gets the sidebar accent fill
  and weight 500; inactive is never saturated. Below 1024px the detail pane
  becomes a Sheet.
- **Dialogs:** for forms and confirmations only, never one per row action.
  Confirmations state the consequence in numbers ("Approve 48 proposals; 3
  have no precedent") and give initial focus to the safe action.

### Feedback & States

- **Loading:** `Skeleton` blocks mirroring the final layout; no custom pulse divs.
- **Empty:** never imported, importing, failed, partial and truly empty are
  separate states, each with one clear next action.
- **Budget reached:** "Classification paused" with counts, never a stalled queue.
- **Toasts:** `sonner`, bottom-right, Label type; never the only confirmation of
  a consequential action.

## 6. Do's and Don'ts

### Do:

- **Do** express every colour, radius, shadow, spacing and font through the
  token files in `src/styles/tokens/`; that is the only door for visual change.
- **Do** use shadcn semantic classes and built-in `variant` props before any
  custom styling.
- **Do** show provenance: who or what proposed a number, who approved it, and a
  route to its lots and price source.
- **Do** keep firm, client and period visible on every authenticated screen.
- **Do** ship loading (Skeleton), empty, error, partial and disabled states
  with every surface.
- **Do** keep body text at ≥4.5:1 and non-text boundaries at ≥3:1 on the
  surface they actually sit on, in both modes.
- **Do** honour `prefers-reduced-motion` with a crossfade or instant alternative
  for every animation.

### Don't:

- **Don't** use the crypto-dashboard look: dark by default, neon, price
  tickers, a big portfolio-value number, green and red P&L styling.
- **Don't** use purple-to-blue gradients, glassmorphism cards, hero-metric
  blocks, or identical icon-heading-text card grids.
- **Don't** introduce warm cream or beige neutrals; Folio's paper is cool.
- **Don't** show status or sign by colour alone, or let a colour mean two things.
- **Don't** show model confidence as a number or as certainty, or brand
  proposals as "AI magic".
- **Don't** render missing basis or unknown values as 0, or round so that
  columns stop adding up to their totals.
- **Don't** write raw hex or Tailwind palette colours in components; semantic
  tokens only.
- **Don't** use coloured side-stripe borders, gradient text, or tiny uppercase
  tracked eyebrows above headings.
- **Don't** nest cards inside cards, or put a work grid in a card.
- **Don't** add decorative charts, badges or stat tiles that don't answer a
  user question.
- **Don't** show raw internal enums (`missing_basis`) or unexplained crypto
  jargon (gas, bridge, rebase); use the plain-language label.

## Penpot

File: <https://design.penpot.app/?screen=workspace&team-id=b4b906dd-9024-819c-8008-f2c1d9a7961e&project-id=110d30a4-9d92-80de-8008-f2c20ea88716&file-id=110d30a4-9d92-80de-8008-f2d3c59d3a39&page-id=110d30a4-9d92-80de-8008-f2d3c59d3a3a>

The file follows the **Ledger** direction (approved 2026-11-15): a well-kept working paper, with cool white paper, blue-black ink, ruled lines, and a margin where every figure is initialled. It now leads the code. Sections 1 to 6 above describe Ledger (rewritten 2026-11-19). Until `src/styles/tokens/` catches up, the file and those sections are the target, and the CSS lists below say what the code must change.

### Tokens

- **Sets.** `core` holds `radius.*` (derived from `radius.base`, as in `borders.css`), `spacing.*` (Tailwind 4px scale; `gap.xs`…`gap.xl` alias it), `size.control*`, `container.*`, `text.*`, `weight.*`, `font.sans`/`font.serif`/`font.mono`, `leading.*`, `tracking.*`, `shadow.2xs`…`shadow.2xl` (`shadow.default` is Tailwind's `shadow`), `opacity.disabled` and `type.*`. `mode/light` and `mode/dark` hold the colour tokens under their CSS-variable names. The themes `Mode / Light` and `Mode / Dark` switch between them. Penpot stores letter spacing in px only, so the CSS's `0.01em` becomes one `tracking.*` token per size.
- **Ledger colours** (light / dark): cool ink #14171C / #E6E8EB is every foreground on a neutral surface (`foreground`, `card-`, `popover-`, `secondary-`, `accent-`, `sidebar-` and `sidebar-accent-foreground`). Dark `background` is #0B0D10 and dark `card` is #111418, which is a step lighter so cards still read in dark mode. `primary`, `ring` and `sidebar-primary` are #1E3A5F / #C8D6EE, and `sidebar-ring` = `{ring}`. `muted-foreground` is #4E5562 / #A4ABB6 and `destructive` is #B3261E / #FF8A80. `primary-foreground` and `sidebar-primary-foreground` stay #FFFFFF / #000000 because they sit on the ink primary. `input` is #868C96 / #666E7A (changed 2026-11-19 so input and checkbox borders reach 3:1). Chart tokens stay as they are until R6.
- **Five status families, one meaning each.** Every family has text on a surface: `status-confirmed` (green, approved and reconciled: a person or the chain settled it), `status-pending` (amber: provisional, importing, partial), `status-blocking` = `{destructive}` (red: missing basis, gap, failed import, destructive), `status-assigned` (blue: with a named reviewer) and `status-machine` = `{muted-foreground}` with `status-machine-border` (neutral: proposed and not yet signed by anyone). Each family except machine has a `-surface`.
- **Grid colours:** `numeric-negative` = `{foreground}` (negatives use the sign, never colour), `row-selected`, and `row-focus` = `{ring}`.
- **Density:** exactly two tiers. `density.row-compact` is 32 and `density.row-comfortable` is 40. Cell padding is `density.cell-x-*` (8/12) and `density.cell-y-*` (6/10). `size.margin-col` (40) is the trail margin. Compact text is `text.compact` 13 with `leading.compact` 1.538 (a 20px line) and `tracking.compact` 0.13px. `tracking.numeric` is 0.
- **Type:** `type.numeric` (Geist Mono 14/20) and `type.numeric-compact` (13/20) are for amount cells. `type.cell-compact` (Geist 13/20) is grid text. `type.status` (13/20/500) and `type.status-compact` (12/16/500) are StatusBadge labels. `type.label-compact` (Geist 12/1.33/500, `tracking.caption`) is the compact table-header label; comfortable headers use `type.label`. `type.report-title` (Source Serif 4 24/1.25/500) is for client reports and statements only. `type.display` stays for marketing; the app has no hero numbers.
- **Other:** `radius.base` is 6, so `radius.sm` = 2, `md` = 4, `lg` = 6 and `xl` = 10. `border.dashed` is 1 (the pencil outline; the dash style is set by hand). `border.icon-sm`/`border.icon` (1/1.33) are Lucide's scaled stroke at 12/16px. `size.icon-sm` is 12 and `size.control-xs` is 28. `size.1` (4), `size.5` (20), `size.6` (24) and `size.72` (288) mirror Tailwind's `w-N`/`h-N` utilities that shadcn components use; `size.sidebar` (220) and `size.sidebar-icon` (48) mirror shadcn's `--sidebar-width` and `--sidebar-width-icon`.
- **Contrast** (WCAG 2.1 AA, measured), light / dark: foreground on background 17.5 / 15.9, and on dark card 15.0; primary-foreground on primary 11.5 / 14.3; muted-foreground on muted 6.9 / 7.3; secondary-foreground on secondary 15.1 / 13.0; destructive-foreground on destructive 6.5 / 9.2; the destructive Button (text on its 10% tint) 5.4. Each status text on its surface: confirmed 6.35 / 8.46, pending 6.09 / 8.52, blocking 5.72 / 7.09, assigned 5.81 / 7.22. `status-machine-border` (#7B828D / #6B7480) passes the 3:1 non-text minimum everywhere a dashed badge can sit: background 3.78 / 4.11, card 3.87 / 3.90, muted 3.55 / 3.56, row-selected 3.45 / 3.32. `input` (Input, Textarea and Checkbox borders, the ResizableHandleGrip) is 3.30 / 3.78 on background, 3.38 / 3.58 on card and 3.10 / 3.27 on muted; it was #EBEBEB / #333333 at 1.16 / 1.54. Focus `ring` reaches 9.65 or more against every surface it sits on in light (row-selected 10.24, sidebar-accent 9.65) and 8.61 or more in dark. `muted-foreground` stays at 6.29 or more on row-selected, sidebar-accent, popover and the Dialog footer (`muted/50`), and every status text stays at 5.82 or more on row-selected. The inactive tab (`foreground/60` on muted) is 4.56 in light, the tightest text pair in the file. Selected and active states whose fill is under 3:1 carry a second cue: the checked Checkbox on selected rows, the 500 weight on the active NavItem, and a 2px inset `ring` on the keyboard-active CommandItem.
- The library mirrors the tokens as colours (`light/*`, `dark/*`) and typographies (`type/*`), used for swatches and text styles.

### Decisions (human, 2026-11-15)

- **Negatives use the minus sign U+2212 "−"** everywhere, in the grid and in the client report. Never parentheses, never colour alone.
- **Per-asset display precision** (ETH 4 dp, BTC 8 dp, USD 2 dp). The full exact value appears on hover and on copy, and the unit is always shown.
- **"Unclassified"** is the label for no evidence: muted fill, CircleHelp icon, and no proposer glyph.
- **No confidence figure anywhere.** Model proposals show evidence and precedents only.
- **Source Serif 4** is a deliberate exception to the old One Family Rule (now the Two Faces Rule in section 3), for report and statement surfaces only. The app UI stays Geist, and Geist Mono carries every numeral.
- **Two density tiers only:** compact 32 for the queue and grids (at least 25 rows at 1440×900) and comfortable 40 for setup and the client report. There is no 28px row tier.
- Approved rows keep the green StatusBadge for now, to be revisited after the review-queue proof. `radius.base` changes from 8 to 6.

### Status vocabulary (pencil and ink)

| Status                                                   | Family             | Icon                                       | Treatment                                                     |
| -------------------------------------------------------- | ------------------ | ------------------------------------------ | ------------------------------------------------------------- |
| Approved                                                 | confirmed          | CircleCheck                                | ink: solid surface fill                                       |
| Proposed by rule / Proposed transfer / Proposed by model | machine            | ListChecks / ArrowLeftRight / CircleDashed | pencil: dashed `status-machine-border`, no fill, italic label |
| Unclassified                                             | neutral            | CircleHelp                                 | `muted` fill, `muted-foreground`                              |
| Provisional                                              | pending            | Clock                                      | ink; amounts italic + clock                                   |
| Missing basis                                            | blocking           | TriangleAlert                              | ink; the cell reads "No basis", never 0                       |
| Assigned                                                 | assigned           | UserRound                                  | ink                                                           |
| Reconciled                                               | confirmed          | CircleCheck                                | ink, with an "as of" timestamp beside it                      |
| Gap                                                      | blocking           | Diff                                       | ink, with a signed difference                                 |
| Importing / Failed                                       | pending / blocking | LoaderCircle / CircleX                     | ink                                                           |

Approving turns a label from pencil (dashed, italic) to ink (solid, upright). Penpot has no italic for Geist or Geist Mono, so the italic exists only in code. The canvas still distinguishes pencil from ink by the outline and the glyph.

### Pages

- `Foundations` shows the colour swatches for both modes, including the five status families with their measured ratios and the grid tokens. It also has the type ramp (with the numeric, cell, report and status styles), spacing, radius and elevation, and a density specimen with a 32px compact row and a 40px comfortable row.
- `Components` holds Penpot components named after their code components, in sections that match the code folders: Icons, Atoms, Molecules, Organisms and Layout.
  - Variant property names are lowercase and match the CVA keys (`variant`, `size`, `state`, `kind`, `density`, `status`), so a Penpot property maps one-to-one onto a CVA variant in code.
  - **Atoms:** `Button` (variant × size × state; sizes `xs`, `sm`, `default`, `lg` and the code's `icon-xs`, `icon-sm`, `icon`, `icon-lg` for ghost and outline; state `hover`, `focus-visible` and `disabled` for default, secondary, outline, ghost and destructive), `Badge` (neutral metadata only, `radius.sm`), `Input` (state × size; both `default` and `compact` have the states default, filled, focus-visible, invalid and disabled), `Textarea` (state: default, filled, focus-visible, invalid, disabled), `Label`, `Skeleton`, `Spinner` (LoaderCircle 16px; for buttons and inline status only), `StatusBadge` (Status × Size), `Amount` (State × Size), `ProposerMark` (Kind: rule, transfer, model, approved), `Kbd`, `KbdGroup`, `Checkbox` (state: unchecked, checked, indeterminate, focus-visible, invalid, disabled), and `Icon / *` (now including `Minus`, `ArrowUp`, `ArrowDown`, `ArrowLeft` and `ArrowUpDown`; `ArrowDown` and `ArrowLeft` are built like `ArrowUp`, with Lucide's own geometry) (Lucide glyphs; instance them and resize, never swap one icon for another, because Penpot's swap does not rescale).
  - **Molecules:** `TableCell` (Density × Kind: select, text, numeric, status, margin), `TableRow` (density × state: default, hover, selected, focused, selected-focused; the focus ring is drawn inset), `TableHeader` (Density, sticky; each sortable `TableHead` holds a `DataTableColumnHeader`), `DataTableColumnHeader` (density × sort: none, ascending, descending × state: default, hover, focus-visible, 18 variants; the ghost-Button sort trigger that fills the `TableHead` cell; ascending shows ArrowUp, descending ArrowDown), `Table` (an example composition: `TableHeader` + `TableBody`), `TruncatedId` (state: default, copied, copy-failed; a 24px `CopyButton`), `Tooltip` (Kind: value, shortcut), `OpenItemsSummary` (State: open, clear), `AlertDialog` (Kind: default, destructive, with a consequence slot that states the effect in numbers), `Card`, `Tabs` (`Tabs` > `TabsList` > `TabsTrigger` instances, showing active, default and focus-visible), `TabsTrigger` (state: default, hover, active, focus-visible, disabled), `Avatar` (size: sm, default, lg; `AvatarFallback`), `Logo` (type: horizontal, symbol, stacked; see Logo below), `Dialog` (root is `DialogContent`), `NavItem` (state: default, hover, active, focus-visible × sidebar: expanded, icon).
  - **Organisms:** `Field` (`FieldLabel`, `FieldContent`, `FieldDescription` / `FieldError`; it also covers `FormField`, `FormInput` and `FormTextarea`, which add form wiring but no visuals), `FormCard` (state: default, invalid, submitting), `ActionButton` (state: default, pending, where the Spinner replaces the label at the same width), `ClientSwitcher` (state: closed, open, empty), `BulkActionBar` (state: selected, undo, no-permission), `ShortcutMap`, `DataGrid`.
  - **Layout:** `AppShell` (Sidebar: expanded, icon; ContextBar over a 220px or 48px sidebar and main), `SidebarTrigger` (state: default, hover, focus-visible; Button ghost `icon-sm` anatomy with PanelLeft), `ContextBar` (firm, client, period, as-of, `?`, Avatar; 48px), `SplitPane` (primary fills, secondary 480px), `PageTitle` (in-app title, OpenItemsSummary and actions), `PageTemplate` (alignment: left, center; the back link uses `Icon / ArrowLeft`), `RouteError` (kind: error, not-found) and the site `PageHeader` (unchanged; used by `Setup` before the firm exists).
  - `Dialog`, `Table*`, `Tooltip`, `TruncatedId`, `OpenItemsSummary`, `StatusBadge`, `Amount`, `ProposerMark`, `Kbd` and every layout and organism addition are not in code yet. Each component's annotation says where to add it and how it behaves.
- `Logo` holds the logo kit: masters, colour, construction, clear space and minimum size, app and web icons, and misuse (see Logo below).
- **Members (S2.1, #69, 2026-11-21):** the `Organization` page has a second row (y 1100) for the firm members page at `/organization/members`. `Organization / Home / Empty + Members link` adds an outline ButtonLink "View members" under the description. It replaces Home / Empty and Setup / Create firm / Done once S2.1 ships. `Organization / Members / Default`, `/ One member`, `/ Loading` and `/ Error` use `AppShell` with Firm active and a back link to Firm. The `PageTitle` reads "Members", with a mono count below it ("6 members", "1 member"). The table has comfortable 40px rows and three columns. Member shows an `Avatar` sm with initials only, never a photo, plus the name in `type.label` and an outline `Badge` "You" on the caller's row. Email is muted `body-sm`. Role is a secondary `Badge` that looks the same for Owner, Analyst and Reviewer. Rows are ordered by name, then email. The `PageTitle` actions slot (S2.2 invite) and a trailing row-actions column (S2.3) are reserved for Owners and not drawn. The 375 boards (`… · 375`, below each desktop board) fold Email under the name in 54px stacked rows. Those rows break the 32/40 density rule and need a decision. They also use a composed `ContextBar · mobile` board that is not a library component. Flows: "Firm members" and "Members error → retry".
- **Amount:** right-aligned Geist Mono, with the unit always shown and per-asset precision; the full value is a hover tooltip and the copy value in code. Each state looks different: value "1.2500 ETH", negative "−0.0412 BTC" (sign only, never colour), zero "0.00 ETH", unknown "Unknown" (muted, sans), not applicable "—", missing basis "No basis" + TriangleAlert in `status-blocking`, and provisional with a Clock icon (italic in code).
- **Open question:** the code's `layout/PageHeader` is the site header, while the Ledger proposal uses "PageHeader" for the in-app title block. Penpot calls that block `PageTitle` until the code renames its header (for example to `SiteHeader`).
- **Export artefact:** Penpot's PNG export draws the dashed pencil outline offset by a few pixels on nested copies (for example a StatusBadge inside TableRow). The shape data is correct (an inner 1px dashed rectangle at the badge bounds), so check it on the canvas, not in exports.
- There is one page per feature (`Setup`, `Organization`), with boards named `<Feature> / <Screen> / <State>`. `Setup` carries the **Create firm** prototype flow: Default → (click Create firm) Invalid → (click) Submitting → (1.5 s) Done. Every Setup state composes `PageHeader` and a `FormCard` instance; Submitting shows the SubmitButton pending in place rather than a skeleton, because submitting is a mutation, not a page load. `Organization` has four boards in one row, in this order: `Organization / Home / Empty` (what the code renders today: `PageTitle` with the firm name and the muted line "Your firm is ready. Client portfolios and transactions will appear here."; no primary action, because adding a client does not exist in code yet), `Organization / Home / Default` (labelled **Future** under the board: the clients-feature target, a compact clients table of `TableCell` instances with synthetic clients, not built yet), `Organization / Home / Loading` (the route `pendingComponent`: `AppShell` chrome with `Skeleton` atoms shaped like the title and the description, no table skeleton) and `Organization / Home / Error` (`AppShell` with `RouteError`: "We couldn't load your firm", "Check your connection and try again. If it keeps happening, sign out and back in.", Retry). All four use `AppShell` with Firm active. Prototype: on `Setup`, Create firm ends on `Setup / Create firm / Done`, which is a rebuilt copy of `Organization / Home / Empty` (Penpot interactions cannot target another page; a note under the board says to keep the two identical). On `Organization`, the Firm NavItem on every board and Retry on the Error board navigate to Home / Empty (flows "Organization home" and "Organization error → retry").

### Logo (2026-11-20)

The `Logo` page holds the logo kit. The mark is the **Folio fold**: one sheet folded once. The left leaf is solid ink and the right leaf is an outline, like pencil. It repeats the product rule: machine proposals are pencil, human approvals are ink. Every slanted edge is exactly 15°.

- **Boards:** `Logo / Masters` (symbol, small-size cut, horizontal, stacked, wordmark), `Logo / Colour`, `Logo / Construction`, `Logo / Clear space & minimum size`, `Logo / App & web icons` (with a browser-tab mock and a sidebar-header mock) and `Logo / Misuse` (six crossed don'ts). The concept boards A, B and C are deleted.
- **Colour tokens:** the ink leaf and the wordmark use `primary`. The pencil leaf uses `status-machine`. One-colour versions use one token for every part: `primary`, or `foreground` for black-only use. Reversed versions use `primary-foreground` (white) on a `primary` or `foreground` tile. Annotations use `status-assigned`, misuse crosses use `status-blocking`, and clear-space outlines use `border` (dashed).
- **Construction:** leaves are parallelograms 82 wide with 142-high sides on the 256 grid. The spine gap is 12/256 and the outline weight is 20/256. The optical centre sits 2px above the geometric centre (the mark spans y 44–208). The small cut widens the spine gap to 24/256 and the outline to 26/256.
- **Clear space:** x = one quarter of the symbol height, on all sides, measured from the artwork.
- **Minimum sizes:** symbol 16px; use the small cut from 16 to 32px and the master from 48px. Horizontal lockup 96px wide. Stacked lockup 64px wide.
- **App icon:** the white small cut on a `primary` tile. Its corner radius is 22.5% of the side, which is a raw value, not a radius token. The favicon is the full-colour small cut, enlarged to fill the square.
- **`Logo` component:** same name and id, now a variant group with `type`: `horizontal` (default, 109×30, the same 30px height as the old 56×30 text logotype), `symbol` (small cut, 32×32) and `stacked` (96 wide). Every copy grew from 56 to 109 wide: the `PageHeader` and `ContextBar` mains, both `AppShell` variants, the three `Setup` PageHeaders, `Setup / Create firm / Done` and the four `Organization` boards. Nothing spilled: the ContextBar spacer absorbs the extra width.
- **Known gaps:** the `Logo / Misuse` gradient example is a raw fill on purpose. The PNG exports were not checked; the boards were verified structurally.
- **Handoff:** the SVG masters (symbol, small-size cut, horizontal, stacked, wordmark) are in `apps/web/brand/`, and the one-colour, app-icon and favicon variants are in `apps/web/brand/variants/`. The web icons (favicon.ico, favicon.svg, PNGs, site.webmanifest) are in `apps/web/public/` and linked from the root route's `head()`. `src/components/molecules/Logo.tsx` imports the horizontal, small-size and stacked masters through `vite-plugin-svgr` (`?react`), so the masters are the single source of the mark. Their paths carry `class="ink"` or `class="pencil"`, which `Logo` recolours with `fill-primary` and `fill-muted-foreground`; keep those classes when you redraw a master.

### shadcn alignment (2026-11-19)

Seven Ledger components now follow the layer anatomy of their shadcn base-nova sources, so `/implement` can build each one on the shadcn component without a redesign. Layer names are the shadcn sub-component names. Colour, type and density stay on Ledger tokens.

| Component         | shadcn base                                                  | Sub-components (layer names)                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Deliberate Ledger deviations                                                                                                                                                                                                                                                                                                                                   |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Kbd`, `KbdGroup` | `kbd`                                                        | `Kbd` (h-5, min-w-5 = `size.5`, px-1, `radius.sm`, 12/500); `KbdGroup` (gap-1). ShortcutMap rows use `KbdGroup`                                                                                                                                                                                                                                                                                                                                                                                    | Hairline `border` stroke and `foreground` text (shadcn: no border, muted-foreground). Penpot ignores min-width on auto-sized boards, so a one-letter Kbd draws 17px wide on the canvas; code uses `min-w-5` (20px)                                                                                                                                             |
| `StatusBadge`     | `badge` (CVA variants; `Status` maps to a variant)           | `data-icon=inline-start / <Glyph>` + `label`. Compact = shadcn exactly: h-5, pl-1.5 pr-2, gap-1, 12px icon                                                                                                                                                                                                                                                                                                                                                                                         | `radius.sm`, not the pill; a 24px comfortable size; proposed-* use the dashed pencil outline (`status-machine-border`, italic in code), not an outline variant                                                                                                                                                                                                 |
| `SplitPane`       | `resizable`                                                  | `ResizablePanelGroup` (root) > `ResizablePanel · primary`, `ResizableHandle` (1px `border`) with `ResizableHandleGrip` (`size.1` × `size.6`, `radius.lg`, `withHandle`), `ResizablePanel · secondary`                                                                                                                                                                                                                                                                                              | Secondary pane 480px (min 400, max 640); becomes a Sheet below 1024. Focus ring (ring-1 ring) is left to code                                                                                                                                                                                                                                                  |
| `AppShell`        | `sidebar` (`collapsible="icon"`, sidebar-07 block)           | root = `SidebarProvider` column: `ContextBar`, then `Sidebar` (`size.sidebar` / `size.sidebar-icon`, right `sidebar-border` stroke) > `SidebarContent` > `SidebarGroup` (p-2) > `SidebarMenu` > `NavItem`, then `SidebarGroup · firm` (p-2) > `SidebarMenu` > the Firm `NavItem`; `SidebarFooter` > `SidebarTrigger` (PanelLeft, Ctrl+B); `SidebarInset`                                                                                                                                           | `ClientSwitcher` lives in the full-width `ContextBar`, not in a `SidebarHeader` team-switcher (accepted). No `SidebarRail`. `SidebarTrigger` is its own component (Button ghost `icon-sm` anatomy, PanelLeft), because Penpot cannot swap the Button's example icon safely. Four NavItems per shell are detached copies (their icons cannot be swapped safely) |
| `NavItem`         | `SidebarMenuItem` > `SidebarMenuButton` + `SidebarMenuBadge` | `icon / *`, `label`, `SidebarMenuBadge`. h-8, p-2, gap-2, `radius.md`. Default and hover labels use `type.body-sm`; active uses `type.label` (500), as shadcn's `data-active:font-medium`                                                                                                                                                                                                                                                                                                          | Badge is the mono open-item count. Hover and active share the `sidebar-accent` fill, as in shadcn                                                                                                                                                                                                                                                              |
| `ShortcutMap`     | `dialog`                                                     | `DialogContent` (root, p-4, gap-4, `radius.xl`) > `DialogHeader` (`DialogTitle` 16/500, `DialogDescription`), `DialogBody` > `ShortcutGroup` (`ShortcutGroupLabel`, `ShortcutRow` > `KbdGroup`), `DialogClose`                                                                                                                                                                                                                                                                                     | **Dialog, not CommandDialog:** it is a read-only reference. Command's search, selection and Enter would do nothing, and 13 shortcuts need no filtering. 640px wide (shadcn sm:max-w-sm) with two columns; a `border` stroke instead of `ring-foreground/10`                                                                                                    |
| `ClientSwitcher`  | `popover` + `command` (combobox)                             | State closed = the trigger; open/empty = `PopoverTrigger` + `PopoverContent` (`size.72`, `radius.lg`, `shadow.md`, `border`) > `Command` (p-1) > `CommandInput` (h-8, `muted`, Search), `CommandList` > `CommandGroup` (`CommandGroupHeading`, `CommandItem` px-2 py-1.5 `radius.sm`, `data-selected` on `muted`, Check on the current client) / `CommandEmpty` (py-6)                                                                                                                             | Outline trigger shows a "Client" eyebrow and uses ChevronDown, not ChevronsUpDown, to match the other ContextBar menus. `bg-input/30` becomes `muted`                                                                                                                                                                                                          |
| `DataGrid`        | `table` + `data-table` (TanStack Table)                      | `DataGridToolbar` (filter `Input` compact + `DataTableViewOptions` "Columns"), `TableHeader` > `TableHead · select` (Checkbox, indeterminate here), `TableHead · aria-sort=ascending` > `DataTableColumnHeader` (ArrowUp, `foreground` label), `TableHead · sortable` > `DataTableColumnHeader` (ArrowUpDown); `TableBody` > `TableRow` (first cell `TableCell` Kind=select, `pr-0`; checked when State=selected); `DataGridFooter` (selected count + `DataTablePagination`: page, Previous, Next) | Compact 32px rows and a trail-margin column after the select column. Rows are virtualised, so pagination sets the page window, not the row height. `BulkActionBar` floats in the bottom padding while rows are selected                                                                                                                                        |

### Five-layer audit (2026-11-19)

The file was audited against the five design layers in `.claude/skills/app-design/SKILL.md` (repo conventions, impeccable, shadcn, modern-web-guidance). Penpot-only differences from the code, for `/implement` to decide:

- Button `xs` is 28px in Penpot (`size.control-xs`, the Ledger decision) and 24px (`h-6`) in `Button.variants.ts`.
- Code copy to change: ActionButton's confirmation is "Are you sure?" / "Yes" (use the consequence and a verb + object), and RouteError's "Something went wrong" / "An unexpected error occurred" (Penpot: "This page could not load" + reload; on `Organization / Home / Error`: "We couldn't load your firm" + Retry).
- Change `--input` to #868C96 / #666E7A in the theme so the code meets the same 3:1.
- `AlertDialog` is 448 wide with a 20px title, wider than shadcn's `max-w-2xs` and 18px, because the consequence slot needs the room. `Tooltip` has no `TooltipArrow`.
- `ShortcutMap` moves rows with ↑/↓, not J/K. Single-letter shortcuts fire only while the grid has focus.
- **IMP-03 fixed (2026-11-19):** the Firm NavItem now sits in its own `SidebarGroup · firm` (p-2, `spacing.2`) > `SidebarMenu`, after the `SidebarGroup` that holds Review, Transactions, Reconciliation and Sources, in both `AppShell` variants (expanded and icon). Every `AppShell` copy inherits it, including the `Organization` boards and `Setup / Create firm / Done`. The other audit items above are still open.
- **Focus and state gaps fixed (2026-11-19):** `DataTableColumnHeader` (new molecule, now 18 variants with `sort=descending`) is the sort trigger inside each sortable `TableHead` of `TableHeader` and `DataGrid`, with a focus-visible state. `SidebarTrigger` (new, state: default, hover, focus-visible) replaces the raw board in both `AppShell` variants. `Input` `compact` now has default, filled, focus-visible, invalid and disabled, like `default`. `TabsTrigger` (new, state: default, hover, active, focus-visible, disabled) is instanced in `Tabs`. The "Clients" title on `Organization / Home / Default` uses `type.title`. Every new focus-visible state uses the Button ring (1px `ring` border plus a 3px `ring` stroke at 50%), and the Button and Checkbox focus-visible strokes are now bound to the `ring` token.
- **Typography tokens fixed (2026-11-20):** on `Organization / Home / Default` the clients-table header labels use `type.label-compact` (12/500, the same as the compact `TableHeader` and `DataTableColumnHeader`), and the count and date columns are `TableCell` Kind=numeric with `type.numeric-compact` (Geist Mono 13), right-aligned with right-aligned headers. The `RouteError` main component now binds `type.headline` to its heading and `type.body` to its description, so every copy inherits them, including `Organization / Home / Error`. The heading is 30px in Penpot and `text-2xl` (24px) in `RouteError.tsx`: change the code to `text-3xl`, the Headline step for page titles. (The `Logo` text logotype noted here was replaced by the Folio fold mark on 2026-11-20; see Logo.)
- **Compact header token fixed (2026-11-20):** `type.label-compact` (with the `type/label-compact` library typography) replaces `type.status-compact` on every compact table-header label: the 5 labels of `TableHeader` compact, the 9 compact `DataTableColumnHeader` variants and the 5 header labels on `Organization / Home / Default`. Its values match the old token, so these labels look exactly as before (12/500). StatusBadge keeps `type.status-compact`.

### Known deviations from the CSS

- Penpot rejects negative shadow spread, so `shadow.sm` to `shadow.xl` use spread 0 on the second layer.
- These values have no token and are raw fills or strokes: `bg-destructive/10` (the destructive Button: the `destructive` library colour at 10%), `text-foreground/60` (inactive tab), `ring-foreground/10` (Dialog edge) and `bg-muted/50` (Dialog footer).
- The Tabs list padding is a raw 3px, because the code uses the off-scale `p-[3px]`.
- These are not expressible as tokens: tabular-nums (the mono font sidesteps it), decimal alignment (right-align with a fixed fraction width), dash style, em letter spacing, outline-offset and italic.
