import { setResponseHeader } from '@tanstack/react-start/server'

import { describe, expect, it, vi } from 'vitest'

import { captureError } from '@/features/error/utils/captureError'
import { catchAsyncError } from '@/features/error/utils/catchError'
import { lastRequest, respondWith } from '@/test/http'

import { listMembers, setupOrganization } from '../organization.server'

vi.mock('@/lib/serverApiClient.server', async () => {
  const { testClient } = await import('@/test/http')
  return { serverAuthApiClient: testClient }
})

vi.mock('@tanstack/react-start/server', () => ({
  setResponseHeader: vi.fn()
}))

vi.mock('@/features/error/utils/captureError', () => ({
  captureError: vi.fn()
}))

const members = [
  {
    id: '0193a000-0000-7000-8000-000000000001',
    name: 'Jane Doe',
    email: 'jane@acme.test',
    role: 'OWNER'
  }
]

describe('setupOrganization', () => {
  it('posts the firm name and returns the organization', async () => {
    respondWith({ id: 'o1', name: 'Acme' })

    expect(await setupOrganization({ name: 'Acme' })).toEqual({
      id: 'o1',
      name: 'Acme'
    })
    expect(lastRequest().method).toBe('POST')
    expect(lastRequest().url).toBe('http://api.test/organizations')
    expect(await lastRequest().json()).toEqual({ name: 'Acme' })
  })
})

describe('listMembers', () => {
  it('GETs users and returns the member list', async () => {
    respondWith(members)

    expect(await listMembers()).toEqual(members)
    expect(lastRequest().method).toBe('GET')
    expect(lastRequest().url).toBe('http://api.test/users')
  })

  it('marks the response Cache-Control: private, no-store', async () => {
    respondWith(members)

    await listMembers()

    expect(setResponseHeader).toHaveBeenCalledWith(
      'Cache-Control',
      'private, no-store'
    )
  })

  it('maps a failed list to an AppError that carries no member name or email', async () => {
    respondWith({ error: { message: 'Down' } }, 500)

    const result = await catchAsyncError(listMembers())

    expect(result.isErr()).toBe(true)
    const [captured] = vi.mocked(captureError).mock.lastCall ?? []
    const { message, fields } = captured as {
      message: string
      fields?: unknown
    }
    const serialized = JSON.stringify({ message, fields })
    expect(serialized).not.toContain('@')
    expect(serialized).not.toContain('Jane Doe')
  })
})
