import { renderToString } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { useAppForm } from '@/lib/form'

const TestForm = ({ action }: { action?: string }) => {
  const form = useAppForm({ defaultValues: { name: '' } })

  return (
    <form.AppForm>
      <form.Form action={action}>
        <form.AppField name="name">
          {(field) => <field.Input label="Firm name" />}
        </form.AppField>
        <form.SubmitButton>Create firm</form.SubmitButton>
      </form.Form>
    </form.AppForm>
  )
}

// Server-rendered markup is what the browser runs before hydration.
const ssr = (action?: string) => {
  document.body.innerHTML = renderToString(<TestForm action={action} />)
  return {
    form: document.querySelector('form') as HTMLFormElement,
    button: document.querySelector('button[type=submit]') as HTMLButtonElement
  }
}

describe('Form before hydration', () => {
  it('blocks a native submit of a JavaScript-only form', () => {
    const { form, button } = ssr()

    expect(button.matches(':disabled')).toBe(true)
    expect(form.querySelector('input')?.matches(':disabled')).toBe(true)
  })

  it('keeps a form with an action submittable without JavaScript', () => {
    const { form, button } = ssr('/api/contact')

    expect(button.matches(':disabled')).toBe(false)
    expect(form.method).toBe('post')
  })
})

describe('Form layout', () => {
  it('spaces the fields and the button inside the contents fieldset', () => {
    const { form } = ssr()
    const classes = form.className.split(' ')

    expect(form.querySelector('fieldset')?.className).toBe('contents')
    expect(classes).toEqual(
      expect.arrayContaining(['flex', 'flex-col', 'gap-4'])
    )
    expect(classes).not.toContain('space-y-4')
  })
})
