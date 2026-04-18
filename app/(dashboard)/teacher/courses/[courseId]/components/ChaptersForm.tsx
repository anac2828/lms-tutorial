'use client'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import { PlusCircle } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Course, Chapter } from '@/lib/generated/prisma/client'

import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { updateCourse } from '@/lib/actions/course'
import { Input } from '@/components/ui/input'

interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] }

  courseId: string
}

const formSchema = z.object({
  title: z.string().min(1, { message: 'Chapter title is required' }),
})

// * COMPONENT FOR COURSE TITLE FORM
export function ChaptersForm({ initialData, courseId }: ChaptersFormProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  })

  // HANDLERS
  const toggleCreating = () => setIsCreating((isCreating) => !isCreating)
  const onSubmitForm = async (formData: z.infer<typeof formSchema>) => {
    try {
      const response = await updateCourse(formData, courseId)

      if (response?.success) {
        toast.success('Chapter created')
        toggleCreating()
      } else {
        toast.error(
          response?.error || 'Something went wrong, please try again.',
        )
      }
    } catch (error) {
      // Other error from the try block
      console.error('UPDATE FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  // FORM STATE
  const { isValid, errors, isSubmitting } = form.formState

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course chapters
        <Button onClick={toggleCreating} variant='ghost'>
          {isCreating ? (
            'Cancel'
          ) : (
            <>
              <PlusCircle className='w-4 h-4 mr-2' /> Add a chapter
            </>
          )}
        </Button>
      </div>
      {isCreating && (
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
                    placeholder="e.g. 'Introduction to the course'"
                    {...field}
                    className='bg-zinc-50 p-x-4'
                  />
                  {errors.title && (
                    <FieldError errors={[{ message: errors.title.message }]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button disabled={!isValid || isSubmitting} type='submit'>
            Create
          </Button>
        </form>
      )}
      {!isCreating && (
        <div
          className={cn(
            'text-sm mt-2',
            !initialData.chapters.length && 'text-slate-500 italic',
          )}
        >
          {!initialData.chapters.length && 'No chapters'}
          {/* TODO: Add chapters a list of chapters*/}
        </div>
      )}
      {!isCreating && (
        <p className='mt-4 text-xs text-muted-foreground'>
          Drag and drop to reorder the chapters
        </p>
      )}
    </div>
  )
}
