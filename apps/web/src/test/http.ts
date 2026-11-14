import ky from 'ky'
import { vi } from 'vitest'

export const fetchMock = vi.fn<typeof fetch>()

const requests: Request[] = []

export const testClient = ky.create({
  prefix: 'http://api.test/',
  retry: 0,
  fetch: (input, init) => {
    const request = new Request(input, init)
    requests.push(request.clone())
    return fetchMock(request)
  }
})

export const respondWith = (body: unknown, status = 200) =>
  fetchMock.mockResolvedValueOnce(Response.json(body, { status }))

export const lastRequest = () => requests.at(-1) as Request
