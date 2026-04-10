'use client'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { useActionState, useCallback, useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Course } from '@/lib/generated/prisma/client'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { updateCourse } from '@/lib/actions/course'

interface DescriptionFormProps {
  initialData: Course

  courseId: string
}

const formSchema = z.object({
  description: z.string().min(1, { message: 'Course description is required' }),
})

// * COMPONENT FOR COURSE TITLE FORM
export function DescriptionForm({
  initialData,
  courseId,
}: DescriptionFormProps) {
  const [state, formAction] = useActionState(updateCourse, null)
  const [isEditing, setIsEditing] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || '',
    },
  })

  // HANDLERS
  const onToggleEdit = useCallback(() => {
    setIsEditing((isEditing) => !isEditing)
    // Restores form values to initial data when input is left empty and user toggles out of edit mode
    form.reset({
      description: initialData.description || '',
    })
  }, [form, initialData])

  useEffect(() => {
    if (state?.success) {
      toast.success('Course description updated successfully')
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
        Course Description
        <Button onClick={onToggleEdit} variant='ghost'>
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <Pencil className='w-4 h-4 mr-2' /> Edit description
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <p
          className={cn(
            'mt-2 text-sm',
            !initialData.description && 'text-slate-500 italic',
          )}
        >
          {initialData.description || 'No description'}
        </p>
      ) : (
        <form action={formAction} className='mt-4 space-y-4'>
          <input type='hidden' name='courseId' value={courseId} />
          <FieldGroup>
            <Controller
              control={form.control}
              name='description'
              render={({ field }) => (
                <Field>
                  <Textarea
                    disabled={isSubmitting}
                    placeholder="e.g. 'Advanced web development'"
                    {...field}
                    className='bg-zinc-50 p-x-4'
                  />
                  {errors.description && (
                    <FieldError
                      errors={[{ message: errors.description.message }]}
                    />
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
