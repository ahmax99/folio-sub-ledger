'use client'

import type { User } from '@shared/config'

import { useAppForm } from '@/lib/form'

import {
  type CreatePostSchema,
  PostFormModel
} from '../../schemas/postForm.schema'
import { useCreatePost } from '../hooks/usePostMutations'

const defaultValues: CreatePostSchema = { title: '', content: '', image: null }

export const PostForm = ({ user }: Readonly<{ user: User }>) => {
  const createPost = useCreatePost()
  const form = useAppForm({
    defaultValues,
    validators: { onChange: PostFormModel.createPost },
    onSubmit: async ({ value, formApi }) => {
      await createPost.mutateAsync({ ...value, authorId: user.id })
      formApi.reset()
    }
  })

  return (
    <form.AppForm>
      <form.FormCard
        description="Share your thoughts with the big world"
        title="Create Post"
      >
        <form.AppField name="title">
          {(field) => (
            <field.Input label="Title" placeholder="Enter your post title" />
          )}
        </form.AppField>
        <form.AppField name="content">
          {(field) => (
            <field.Textarea
              label="Content"
              placeholder="Enter your post content"
            />
          )}
        </form.AppField>
        <form.AppField name="image">
          {(field) => <field.FileInput accept="image/*" label="Image" />}
        </form.AppField>
        <form.SubmitButton>Create Post</form.SubmitButton>
      </form.FormCard>
    </form.AppForm>
  )
}
