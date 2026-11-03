'use client'

import type { Post } from '@shared/config'

import { useAppForm } from '@/lib/form'

import {
  CommentFormModel,
  type CreateCommentSchema
} from '../../schemas/commentForm.schema'
import { useCreateComment } from '../hooks/useCommentMutations'

export const CommentForm = ({ postId }: Readonly<{ postId: Post['id'] }>) => {
  const createComment = useCreateComment()
  const defaultValues: CreateCommentSchema = { content: '', postId }
  const form = useAppForm({
    defaultValues,
    validators: { onChange: CommentFormModel.createComment },
    onSubmit: async ({ value, formApi }) => {
      await createComment.mutateAsync(value)
      formApi.reset()
    }
  })

  return (
    <form.AppForm>
      <form.Form>
        <form.AppField name="content">
          {(field) => (
            <field.Textarea label="Comment" placeholder="Share your thoughts" />
          )}
        </form.AppField>
        <form.SubmitButton>Post Comment</form.SubmitButton>
      </form.Form>
    </form.AppForm>
  )
}
