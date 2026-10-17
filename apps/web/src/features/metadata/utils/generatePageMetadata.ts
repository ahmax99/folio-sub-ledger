import { SITE_DESCRIPTION, SITE_TITLE } from '../constants'

interface GeneratePageMetadataProps {
  title?: string
  description?: string
}

// Returns a route `head()` value; child routes' tags override the root's by name/property.
export const generatePageMetadata = ({
  title,
  description = SITE_DESCRIPTION
}: GeneratePageMetadataProps = {}) => {
  const pageTitle = title ? `${title} | ${SITE_TITLE}` : SITE_TITLE

  return {
    meta: [
      { title: pageTitle },
      { name: 'description', content: description },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: description },
      { property: 'og:site_name', content: SITE_TITLE },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: description }
    ]
  }
}
