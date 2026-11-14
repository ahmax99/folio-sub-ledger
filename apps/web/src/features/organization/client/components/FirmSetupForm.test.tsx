import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AppError } from '@/features/error/lib/AppError'
import { renderWithProviders } from '@/test/render'

import { setupFirm } from '../api'

import { FirmSetupForm } from './FirmSetupForm'

vi.mock('../api', () => ({ setupFirm: vi.fn() }))

describe('FirmSetupForm', () => {
  it('creates the firm and goes to the firm home', async () => {
    vi.mocked(setupFirm).mockResolvedValue({ id: 'o1', name: 'Acme' })
    const { user, router } = await renderWithProviders(<FirmSetupForm />)

    await user.type(screen.getByLabelText('Firm name'), 'Acme')
    await user.click(screen.getByRole('button', { name: /create firm/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/firm'))
    expect(setupFirm).toHaveBeenCalledWith(
      { firmName: 'Acme' },
      expect.anything()
    )
  })

  it('shows the validation error and does not submit an empty name', async () => {
    const { user } = await renderWithProviders(<FirmSetupForm />)

    await user.click(screen.getByRole('button', { name: /create firm/i }))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Firm name is required'
    )
    expect(setupFirm).not.toHaveBeenCalled()
  })

  it('shows field errors returned by the server', async () => {
    vi.mocked(setupFirm).mockRejectedValue(
      new AppError('BAD_REQUEST', 'Invalid', { firmName: 'Name is taken' })
    )
    const { user } = await renderWithProviders(<FirmSetupForm />)

    await user.type(screen.getByLabelText('Firm name'), 'Acme')
    await user.click(screen.getByRole('button', { name: /create firm/i }))

    expect((await screen.findByRole('alert')).textContent).toBe('Name is taken')
    expect(
      screen.getByLabelText('Firm name').getAttribute('aria-invalid')
    ).toBe('true')
  })
})
