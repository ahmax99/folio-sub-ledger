import { describe, expect, it } from 'vitest'

import { SITE_DESCRIPTION, SITE_TITLE } from '../../constants'
import { generatePageMetadata } from '../generatePageMetadata'

const contentOf = (
  meta: ReturnType<typeof generatePageMetadata>['meta'],
  key: string
) =>
  meta.find((tag) => Object.values(tag).includes(key)) as
    | Record<string, string>
    | undefined

describe('generatePageMetadata', () => {
  it('uses the site title and description by default', () => {
    const { meta } = generatePageMetadata()

    expect(meta[0]).toEqual({ title: SITE_TITLE })
    expect(contentOf(meta, 'description')?.content).toBe(SITE_DESCRIPTION)
  })

  it('prefixes the page title and uses the page description', () => {
    const { meta } = generatePageMetadata({
      title: 'Account',
      description: 'Your account'
    })

    expect(meta[0]).toEqual({ title: `Account | ${SITE_TITLE}` })
    expect(contentOf(meta, 'og:description')?.content).toBe('Your account')
  })
})
