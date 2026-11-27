import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../Table'

describe('Table', () => {
  it('renders a semantic table whose TableHead cells are th with the given scope', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Member</TableHead>
            <TableHead scope="col">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Jane Doe</TableCell>
            <TableCell>Owner</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )

    expect(screen.getByRole('table')).not.toBeNull()
    const headers = screen.getAllByRole('columnheader')
    expect(headers.map((header) => header.tagName)).toEqual(['TH', 'TH'])
    expect(
      headers.every((header) => header.getAttribute('scope') === 'col')
    ).toBe(true)
    expect(screen.getByRole('cell', { name: 'Jane Doe' })).not.toBeNull()
  })
})
