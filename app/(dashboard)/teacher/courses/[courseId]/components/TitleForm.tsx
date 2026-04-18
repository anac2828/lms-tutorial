'use client'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
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
  const [isEditing, setIsEditing] = useState(false)

  // FORM SETUP
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  // HANDLERS
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)
  const onSubmitForm = async (formData: z.infer<typeof formSchema>) => {
    try {
      const response = await updateCourse(formData, courseId)

      if (response?.success) {
        toast.success('Course title updated.')
        onToggleEdit()
      } else {
        toast.error(response?.error || 'Something went wrong.')
      }
    } catch (error) {
      console.error('UPDATE FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

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
        <form
          onSubmit={form.handleSubmit(onSubmitForm)}
          className='mt-4 space-y-4'
        >
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
