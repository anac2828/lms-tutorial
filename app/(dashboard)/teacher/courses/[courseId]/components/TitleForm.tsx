'use client'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useState, useActionState, useCallback, useEffect } from 'react'
import { updateCourse } from '@/lib/actions/course'
import { toast } from 'sonner'

interface TitleFormProps {
  initialData: {
    title: string
  }
  courseId: string
}

const formSchema = z.object({
  title: z.string().min(1, { message: 'Course title is required' }),
})

// * COMPONENT FOR COURSE TITLE FORM
export function TitleForm({ initialData, courseId }: TitleFormProps) {
  const [state, formAction] = useActionState(updateCourse, null)
  const [isEditing, setIsEditing] = useState(false)

  // FORM SETUP
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  // HANDLERS
  const onToggleEdit = useCallback(() => {
    setIsEditing((isEditing) => !isEditing)
    // Restores form values to initial data when input is left empty and user toggles out of edit mode
    form.reset(initialData)
  }, [form, initialData])

  useEffect(() => {
    if (state?.success) {
      toast.success('Course title updated successfully')
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditing(false)
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state, setIsEditing])

  // FORM STATE
  const { isValid, errors, isSubmitting } = form.formState

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course Title
        <Button onClick={onToggleEdit} variant='ghost'>
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <Pencil className='w-4 h-4 mr-2' /> Edit title
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <p className='mt-2 text-sm'>{initialData.title}</p>
      ) : (
        <form action={formAction} className='mt-4 space-y-4'>
          <input type='hidden' name='courseId' value={courseId} />
          <FieldGroup>
            <Controller
              control={form.control}
              name='title'
              render={({ field }) => (
                <Field>
                  <Input
                    disabled={isSubmitting}
                    placeholder="e.g. 'Advanced web development'"
                    {...field}
                    className='bg-zinc-50'
                  />
                  {errors.title && (
                    <FieldError errors={[{ message: errors.title.message }]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <div className='flex items-center gap-x-2'>
            <Button disabled={!isValid || isSubmitting} type='submit'>
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
