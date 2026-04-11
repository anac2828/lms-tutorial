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
import { ComboboxBasic } from '@/components/categoriesComboBox'
import { updateCourse } from '@/lib/actions/course'

interface CategoryFormProps {
  initialData: Course

  courseId: string
  options: { label: string; value: string }[]
}

const formSchema = z.object({
  categoryId: z.string().min(1),
})

// * COMPONENT FOR COURSE TITLE FORM
export function CategoryForm({
  initialData,
  courseId,
  options,
}: CategoryFormProps) {
  const [state, formAction] = useActionState(updateCourse, null)
  const [isEditing, setIsEditing] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData.categoryId || '',
    },
  })

  // HANDLERS
  const onToggleEdit = useCallback(() => {
    setIsEditing((isEditing) => !isEditing)
    // Restores form values to initial data when input is left empty and user toggles out of edit mode
    form.reset({
      categoryId: initialData.description || '',
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

  // option.value is the category id
  const selectedOption = options.find(
    (option) => option.value === initialData.categoryId,
  )

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course Category
        <Button onClick={onToggleEdit} variant='ghost'>
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <Pencil className='w-4 h-4 mr-2' /> Edit category
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <p
          className={cn(
            'mt-2 text-sm',
            !initialData.categoryId && 'text-slate-500 italic',
          )}
        >
          {selectedOption?.label || 'No category'}
        </p>
      ) : (
        <form action={formAction} className='mt-4 space-y-4'>
          <input type='hidden' name='courseId' value={courseId} />
          <FieldGroup>
            <Controller
              control={form.control}
              name='categoryId'
              render={({ field }) => (
                <Field>
                  <ComboboxBasic options={options} {...field} />
                  {errors.categoryId && (
                    <FieldError
                      errors={[{ message: errors.categoryId.message }]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <div className='flex items-center gap-x-2'>
            <Button disabled={isSubmitting} type='submit'>
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
