import { openapi } from '@elysiajs/openapi'
import { Elysia } from 'elysia'

import { imageController } from '@/modules/images/image.controller.js'
import { organizationController } from '@/modules/organizations/organization.controller.js'
import { userController } from '@/modules/users/user.controller.js'

export const routes = new Elysia({ prefix: '/api/v1' })
  .use(
    openapi({
      documentation: {
        info: {
          title: 'Folio API',
          version: '1.0.0',
          description: 'REST API for Folio'
        },
        tags: [
          { name: 'Users', description: 'User management endpoints' },
          {
            name: 'Organizations',
            description: 'Firm setup endpoints'
          },
          { name: 'Images', description: 'Image proxy endpoints' }
        ]
      }
    })
  )
  .use(imageController)
  .use(organizationController)
  .use(userController)
