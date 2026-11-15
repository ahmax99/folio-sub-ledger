import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { testUser } from '@/test/fixtures'
import { renderWithProviders } from '@/test/render'

import { fetchPresignedUrl, updateUser } from '../../account.functions'
import { AccountForm } from '../AccountForm'

vi.mock('../../account.functions', () => ({
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  fetchPresignedUrl: vi.fn()
}))
vi.mock('@/features/auth/auth.functions', () => ({ logout: vi.fn() }))

const avatar = new File(['png'], 'avatar.png', { type: 'image/png' })

const stubS3Upload = (status: number) => {
  vi.mocked(fetchPresignedUrl).mockResolvedValue({
    presignedUrl: 'https://s3.test/upload',
    publicUrl: 'https://cdn.test/avatar.png',
    key: 'users/u1/avatar.png'
  })
  const s3Upload = vi.fn().mockResolvedValue(new Response(null, { status }))
  vi.stubGlobal('fetch', s3Upload)
  return s3Upload
}

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
    expect(fetchPresignedUrl).not.toHaveBeenCalled()
  })

  it('uploads a new profile picture and saves its key', async () => {
    const s3Upload = stubS3Upload(200)
    vi.mocked(updateUser).mockResolvedValue(undefined)
    const { user: actor } = await renderForm()

    await actor.upload(screen.getByLabelText('Profile Picture'), avatar)
    await actor.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() =>
      expect(updateUser).toHaveBeenCalledWith({
        data: { name: 'Jane', imagePath: 'users/u1/avatar.png' }
      })
    )
    expect(fetchPresignedUrl).toHaveBeenCalledWith({
      data: { filename: 'avatar.png', contentType: 'image/png' }
    })
    expect(s3Upload).toHaveBeenCalledWith('https://s3.test/upload', {
      method: 'PUT',
      body: avatar,
      headers: { 'Content-Type': 'image/png' }
    })
  })

  it('does not save the profile when the upload fails', async () => {
    const s3Upload = stubS3Upload(403)
    const { user: actor, router } = await renderForm()

    await actor.upload(screen.getByLabelText('Profile Picture'), avatar)
    await actor.click(screen.getByRole('button', { name: /update profile/i }))

    await waitFor(() => expect(s3Upload).toHaveBeenCalled())
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
