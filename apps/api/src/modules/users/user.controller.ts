import { subject } from '@casl/ability'
import { fromTypes, openapi } from '@elysiajs/openapi'
import { UserModel } from '@shared/config'
import { Elysia } from 'elysia'

import { errorHandler } from '@/error/lib/errorHandler.js'
import { handleApiError } from '@/error/utils/handleApiError.js'
import { organizationPlugin } from '@/modules/organizations/organization.plugin.js'
import { userPlugin } from '@/modules/users/user.plugin.js'

export const userController = new Elysia({ prefix: '/users' })
  .use(organizationPlugin)
  .use(userPlugin)
  .use(errorHandler)
  .use(openapi({ references: fromTypes() }))
  .get(
    '/',
    async ({ db, ability, userService }) =>
      handleApiError(userService.getAll(db, ability)),
    {
      organization: true,
      detail: {
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
        tags: ['Users']
      }
    }
  )
  .get(
    '/:id',
    async ({ params, db, ability, userService }) =>
      handleApiError(userService.getById(params.id, db, ability)),
    {
      params: UserModel.userIdParams,
      organization: true,
      detail: {
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their unique identifier',
        tags: ['Users']
      }
    }
  )
  .get(
    '/me',
    async ({ user, db, userService }) =>
      handleApiError(userService.getMe(user.cognitoSub, db)),
    {
      organization: true,
      detail: {
        summary: 'Get current user',
        description: 'Retrieve the authenticated user profile',
        tags: ['Users']
      }
    }
  )
  .get(
    '/presigned-url',
    async ({ request, query, user, db, ability, userService, uploadService }) =>
      handleApiError(
        userService
          .getMe(user.cognitoSub, db)
          .andThen((self) =>
            uploadService.getPresignedUrl(
              'account',
              request,
              query.filename,
              query.contentType,
              ability.can('update', subject('User', self))
            )
          )
      ),
    {
      query: UserModel.uploadImageQuery,
      organization: true,
      detail: {
        summary: 'Get presigned URL for profile image upload',
        description:
          'Generate a presigned S3 URL for uploading user profile images',
        tags: ['Users']
      }
    }
  )
  .put(
    '/:id',
    async ({ params, body, db, ability, userService }) =>
      handleApiError(userService.update(params.id, body, db, ability)),
    {
      params: UserModel.userIdParams,
      body: UserModel.updateUserBody,
      organization: true,
      detail: {
        summary: 'Update a user',
        description: 'Update an existing user by ID',
        tags: ['Users']
      }
    }
  )
  .delete(
    '/:id',
    async ({ params, db, ability, userService }) =>
      handleApiError(userService.delete(params.id, db, ability)),
    {
      params: UserModel.userIdParams,
      organization: true,
      detail: {
        summary: 'Delete a user',
        description: 'Permanently delete a user by ID',
        tags: ['Users']
      }
    }
  )
