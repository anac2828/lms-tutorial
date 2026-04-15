'use client'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Course } from '@/lib/generated/prisma/client'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'

import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/categoriesComboBox'
import { updateCourse } from '@/lib/actions/course'

interface CategoryFormProps {
  initialData: Course

  courseId: string
  options: { label: string; value: string }[]
}

const formSchema = z.object({
  categoryId: z.string().min(1, { message: 'Please select a category.' }),
})

// * COMPONENT FOR COURSE TITLE FORM
export function CategoryForm({
  initialData,
  courseId,
  options,
}: CategoryFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || '',
    },
  })

  // HANDLERS
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)

  const onSubmitForm = async (formData: z.infer<typeof formSchema>) => {
    const response = await updateCourse(formData, courseId)

    if (response?.success) {
      toast.success('Course category updated.')
      onToggleEdit()
    }
    if (response?.error) {
      toast.error('Something went wrong, please try again.')
    }
  }

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
        <form
          onSubmit={form.handleSubmit(onSubmitForm)}
          className='mt-4 space-y-4'
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name='categoryId'
              render={({ field }) => {
                return (
                  <Field>
                    <Combobox options={options} {...field} />
                    {errors.categoryId && (
                      <FieldError
                        errors={[{ message: errors.categoryId.message }]}
                      />
                    )}
                  </Field>
                )
              }}
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
