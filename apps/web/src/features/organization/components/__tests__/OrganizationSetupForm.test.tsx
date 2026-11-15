import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '@/features/error/lib/AppError'
import { renderWithProviders } from '@/test/render'

import { setupOrganization } from '../../organization.functions'
import { OrganizationSetupForm } from '../OrganizationSetupForm'

vi.mock('../../organization.functions', () => ({ setupOrganization: vi.fn() }))

describe('OrganizationSetupForm', () => {
  it('creates the firm and goes to the firm home', async () => {
    vi.mocked(setupOrganization).mockResolvedValue({ id: 'o1', name: 'Acme' })
    const { user, router } = await renderWithProviders(
      <OrganizationSetupForm />
    )

    await user.type(screen.getByLabelText('Firm name'), 'Acme')
    await user.click(screen.getByRole('button', { name: /create firm/i }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/organization')
    )
    expect(setupOrganization).toHaveBeenCalledWith({ data: { name: 'Acme' } })
  })

  it('shows the validation error and does not submit an empty name', async () => {
    const { user } = await renderWithProviders(<OrganizationSetupForm />)

    await user.click(screen.getByRole('button', { name: /create firm/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Firm name is required'
    )
    expect(setupOrganization).not.toHaveBeenCalled()
  })

  it('shows field errors returned by the server', async () => {
    vi.mocked(setupOrganization).mockRejectedValue(
      new AppError('BAD_REQUEST', 'Invalid', { name: 'Name is taken' })
    )
    const { user } = await renderWithProviders(<OrganizationSetupForm />)

    await user.type(screen.getByLabelText('Firm name'), 'Acme')
    await user.click(screen.getByRole('button', { name: /create firm/i }))

    expect((await screen.findByRole('alert')).textContent).toBe('Name is taken')
    expect(
      screen.getByLabelText('Firm name').getAttribute('aria-invalid')
    ).toBe('true')
  })
})
