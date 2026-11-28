import type { MemberList as Members, Role } from '@shared/config'
import { act, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { MemberList } from '../MemberList'
import { MemberListSkeleton } from '../MemberListSkeleton'

const member = (
  index: number,
  overrides: Partial<Members[number]> = {}
): Members[number] => ({
  id: `0193a000-0000-7000-8000-00000000000${index}`,
  name: `Member ${index}`,
  email: `member${index}@acme.test`,
  role: 'ANALYST',
  ...overrides
})

const owner = member(1, {
  name: 'Jane Doe',
  email: 'jane@acme.test',
  role: 'OWNER'
})

// The count's number and word are separate spans, so match the paragraph's whole text.
const countText = (text: string) =>
  screen.getByText(
    (_, element) => element?.tagName === 'P' && element.textContent === text
  )

const rows = () => screen.getAllByRole('row').slice(1)

const rowAt = (index: number) => {
  const row = rows()[index]
  if (!row) throw new Error(`No body row ${index}`)
  return row
}

describe('MemberList', () => {
  it('shows the Members heading and a plural-aware count', async () => {
    const { unmount } = await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[owner]} />
    )
    expect(screen.getByRole('heading', { name: 'Members' })).toBeDefined()
    expect(countText('1 member')).toBeDefined()
    unmount()

    await renderWithProviders(
      <MemberList
        currentUserId={owner.id}
        members={[owner, ...[2, 3, 4, 5, 6].map((index) => member(index))]}
      />
    )
    expect(countText('6 members')).toBeDefined()
  })

  it('renders a table with column headers Member, Email and Role as th scope=col', async () => {
    await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[owner]} />
    )

    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((header) => header.textContent)).toEqual([
      'Member',
      'Email',
      'Role'
    ])
    for (const header of headers) {
      expect(header.tagName).toBe('TH')
      expect(header.getAttribute('scope')).toBe('col')
    }
  })

  it("marks exactly one row, the caller's, with You, and its text reads '<name> You'", async () => {
    await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[owner, member(2)]} />
    )

    expect(screen.getAllByText('You')).toHaveLength(1)
    expect(
      rowAt(0).querySelector('[data-slot="member-name"]')?.textContent
    ).toBe('Jane Doe You')
    expect(within(rowAt(1)).queryByText('You')).toBeNull()
  })

  it('gives every role label the same Badge classes', async () => {
    const roles: Role[] = ['OWNER', 'ANALYST', 'REVIEWER']
    await renderWithProviders(
      <MemberList
        currentUserId="none"
        members={roles.map((role, index) => member(index + 1, { role }))}
      />
    )

    const classes = ['Owner', 'Analyst', 'Reviewer'].map(
      (label) => screen.getByText(label).className
    )
    expect(new Set(classes).size).toBe(1)
  })

  it("shows each member's email to any caller", async () => {
    await renderWithProviders(
      <MemberList currentUserId="reviewer" members={[owner, member(2)]} />
    )

    expect(screen.getAllByText('jane@acme.test').length).toBeGreaterThan(0)
    expect(screen.getAllByText('member2@acme.test').length).toBeGreaterThan(0)
  })

  it('shows initials avatars and no img element', async () => {
    await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[owner]} />
    )

    expect(screen.getByText('JD')).toBeDefined()
    expect(document.querySelector('img')).toBeNull()
  })

  it('has no button, menu or checkbox', async () => {
    await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[owner, member(2)]} />
    )

    for (const role of ['button', 'menu', 'menuitem', 'checkbox'])
      expect(screen.queryAllByRole(role)).toHaveLength(0)
  })

  it('truncates the email and shows the full value in a tooltip on keyboard focus', async () => {
    const long = member(2, {
      email: 'a.very.long.email.address.for.testing@accounting-firm.test'
    })
    await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[long]} />
    )

    const emails = screen.getAllByText(long.email)
    expect(emails).toHaveLength(2)
    for (const email of emails) {
      expect(email.className).toContain('truncate')
      expect(email.tabIndex).toBe(0)
    }

    act(() => emails[1]?.focus())

    const tooltip = await screen.findByText(long.email, {
      selector: '[data-slot="tooltip-content"]'
    })
    expect(tooltip.textContent).toBe(long.email)
    // A long email wraps after the @, not mid-domain.
    expect(tooltip.querySelector('wbr')?.previousSibling?.textContent).toBe(
      'a.very.long.email.address.for.testing@'
    )
  })

  it('draws the table on the card surface', async () => {
    await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[owner]} />
    )

    expect(
      screen.getByRole('table').closest('.rounded-lg')?.className
    ).toContain('bg-card')
  })

  it('pads the stacked member cell below sm only, so phone rows grow to 52px', async () => {
    await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[owner]} />
    )

    const classes = (rowAt(0).querySelector('td')?.className ?? '').split(' ')
    expect(classes).toContain('max-sm:py-2')
    expect(classes).not.toContain('py-2')
  })

  it('keeps the API order', async () => {
    await renderWithProviders(
      <MemberList
        currentUserId="none"
        members={[
          member(1, { name: 'Sam Lee', email: 'a@x.test' }),
          member(2, { name: 'Sam Lee', email: 'b@x.test' })
        ]}
      />
    )

    expect(
      rows().map((row) => within(row).getAllByText(/@x\.test$/)[0]?.textContent)
    ).toEqual(['a@x.test', 'b@x.test'])
  })

  it("a one-member firm shows the header, the Owner's own row with You, '1 member' and no empty-state text", async () => {
    await renderWithProviders(
      <MemberList currentUserId={owner.id} members={[owner]} />
    )

    expect(screen.getAllByRole('columnheader')).toHaveLength(3)
    expect(rows()).toHaveLength(1)
    expect(within(rowAt(0)).getByText('You')).toBeDefined()
    expect(countText('1 member')).toBeDefined()
    expect(screen.queryByText(/no members/i)).toBeNull()
  })
})

describe('MemberListSkeleton', () => {
  it('pads the stacked placeholder cell below sm, like a member row', async () => {
    await renderWithProviders(<MemberListSkeleton />)

    const firstCells = rows().map((row) => row.querySelector('td')?.className)
    expect(firstCells.every((c) => c?.split(' ').includes('max-sm:py-2'))).toBe(
      true
    )
  })

  it('keeps the three column headers and draws four placeholder rows and no heading text', async () => {
    await renderWithProviders(<MemberListSkeleton />)

    expect(
      screen.getAllByRole('columnheader').map((header) => header.textContent)
    ).toEqual(['Member', 'Email', 'Role'])
    expect(rows()).toHaveLength(4)
    expect(screen.queryByRole('heading')).toBeNull()
    expect(
      screen
        .getByRole('region', { name: 'Loading members' })
        .getAttribute('aria-busy')
    ).toBe('true')
    expect(
      document.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(4)
  })
})
