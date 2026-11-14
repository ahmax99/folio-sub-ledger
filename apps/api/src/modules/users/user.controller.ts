import { subject } from '@casl/ability'
import { fromTypes, openapi } from '@elysiajs/openapi'
import { UserModel } from '@shared/config'
import { Elysia } from 'elysia'

import { errorHandler } from '@/error/lib/errorHandler.js'
import { handleApiError } from '@/error/utils/handleApiError.js'
import { authPlugin } from '@/modules/auth/auth.plugin.js'
import { userPlugin } from '@/modules/users/user.plugin.js'

export const userController = new Elysia({ prefix: '/users' })
  .use(userPlugin)
  .use(authPlugin)
  .use(errorHandler)
  .use(openapi({ references: fromTypes() }))
  .get(
    '/',
    async ({ member, ability, userService }) =>
      handleApiError(userService.getAll(member, ability)),
    {
      auth: true,
      detail: {
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
        tags: ['Users']
      }
    }
  )
  .get(
    '/:id',
    async ({ params, member, ability, userService }) =>
      handleApiError(userService.getById(params.id, member, ability)),
    {
      params: UserModel.userIdParams,
      auth: true,
      detail: {
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their unique identifier',
        tags: ['Users']
      }
    }
  )
  .get(
    '/me',
    async ({ member, userService }) =>
      handleApiError(userService.getMe(member)),
    {
      auth: true,
      detail: {
        summary: 'Get current user',
        description: 'Retrieve the authenticated user profile',
        tags: ['Users']
      }
    }
  )
  .get(
    '/presigned-url',
    async ({ request, query, member, ability, userService, uploadService }) =>
      handleApiError(
        userService
          .requireMember(member)
          .andThen(({ id }) =>
            userService.findUser(id, member, ability, 'read')
          )
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
      auth: true,
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
    async ({ params, body, member, ability, userService }) =>
      handleApiError(userService.update(params.id, body, member, ability)),
    {
      params: UserModel.userIdParams,
      body: UserModel.updateUserBody,
      auth: true,
      detail: {
        summary: 'Update a user',
        description: 'Update an existing user by ID',
        tags: ['Users']
      }
    }
  )
  .delete(
    '/:id',
    async ({ params, member, ability, userService }) =>
      handleApiError(userService.delete(params.id, member, ability)),
    {
      params: UserModel.userIdParams,
      auth: true,
      detail: {
        summary: 'Delete a user',
        description: 'Permanently delete a user by ID',
        tags: ['Users']
      }
    }
  )
