import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { testUser } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { updateUser } from '../../account.functions'
import { uploadProfileImage } from '../../lib/uploadProfileImage'
import { AccountForm } from '../AccountForm'

vi.mock('../../account.functions', () => ({
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  fetchPresignedUrl: vi.fn()
}))
vi.mock('../../lib/uploadProfileImage', () => ({ uploadProfileImage: vi.fn() }))
vi.mock('@/features/auth/auth.functions', () => ({ logout: vi.fn() }))

const avatar = new File(['png'], 'avatar.png', { type: 'image/png' })

const renderForm = () =>
  renderWithProviders(<AccountForm user={testUser} />, {
    path: '/account/edit'
  })

describe('AccountForm', () => {
  it('updates the name and returns to the account page', async () => {
    vi.mocked(updateUser).mockResolvedValue(undefined)
    const { user: actor, router } = await renderForm()

    await actor.clear(screen.getByLabelText('Name'))
    await actor.type(screen.getByLabelText('Name'), 'Janet')
    await actor.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/account'))
    expect(updateUser).toHaveBeenCalledWith({
      data: { name: 'Janet', imagePath: undefined }
    })
    expect(uploadProfileImage).not.toHaveBeenCalled()
  })

  it('uploads a new profile picture and saves its key', async () => {
    vi.mocked(uploadProfileImage).mockResolvedValue({
      uploadResponse: new Response(null, { status: 200 }),
      publicUrl: 'https://cdn.test/avatar.png',
      key: 'users/u1/avatar.png'
    })
    vi.mocked(updateUser).mockResolvedValue(undefined)
    const { user: actor } = await renderForm()

    await actor.upload(screen.getByLabelText('Profile Picture'), avatar)
    await actor.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({
        data: { name: 'Jane', imagePath: 'users/u1/avatar.png' }
      })
    )
    expect(uploadProfileImage).toHaveBeenCalledWith(avatar)
  })

  it('does not save the profile when the upload fails', async () => {
    vi.mocked(uploadProfileImage).mockResolvedValue({
      uploadResponse: new Response(null, { status: 403 }),
      publicUrl: '',
      key: ''
    })
    const { user: actor, router } = await renderForm()

    await actor.upload(screen.getByLabelText('Profile Picture'), avatar)
    await actor.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() => expect(uploadProfileImage).toHaveBeenCalled())
    expect(updateUser).not.toHaveBeenCalled()
    expect(router.state.location.pathname).toBe('/account/edit')
  })

  it('requires a name', async () => {
    const { user: actor } = await renderForm()

    await actor.clear(screen.getByLabelText('Name'))

    expect((await screen.findByRole('alert')).textContent).toBe(
      'Name is required'
    )
  })
})
