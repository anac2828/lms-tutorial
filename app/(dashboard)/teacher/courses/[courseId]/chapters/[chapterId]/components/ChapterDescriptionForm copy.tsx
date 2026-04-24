'use client'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Chapter } from '@/lib/generated/prisma/client'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'

import { Button } from '@/components/ui/button'

import { updateChapter } from '@/lib/actions/chapter'
import EditorSlate from '@/components/editor'

interface ChapterDescriptionFormProps {
  initialData: Chapter

  courseId: string
  chapterId: string
}

const formSchema = z.object({
  description: z.string().min(1, { message: 'Course description is required' }),
})

// * COMPONENT FOR COURSE TITLE FORM
export function ChapterDescriptionForm({
  initialData,
  courseId,
  chapterId,
}: ChapterDescriptionFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || '',
    },
  })

  // HANDLERS
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)
  const onSubmitForm = async (formData: z.infer<typeof formSchema>) => {
    try {
      const response = await updateChapter(formData, courseId, chapterId)

      if (response?.success) {
        toast.success('Course description updated.')
        onToggleEdit()
      } else {
        toast.error(
          response?.error || 'Something went wrong, please try again.',
        )
      }
    } catch (error) {
      // Other error from the try block
      console.error('UPDATE CHAPTER FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  // FORM STATE
  const { isValid, errors, isSubmitting } = form.formState

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Chapter Description
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
        <form
          onSubmit={form.handleSubmit(onSubmitForm)}
          className='mt-4 space-y-4'
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name='description'
              render={({ field }) => (
                <Field>
                  <EditorSlate />
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
