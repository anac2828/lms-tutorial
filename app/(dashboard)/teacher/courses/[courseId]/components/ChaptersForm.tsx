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

import { Input } from '@/components/ui/input'
import { ChaptersList } from './ChaptersList'
import { createChapter, updateChapterOrder } from '@/lib/actions/chapter'
import { useRouter } from 'next/navigation'

interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] }

  courseId: string
}

const formSchema = z.object({
  title: z.string().min(1, { message: 'Chapter title is required' }),
})

// * COMPONENT FOR COURSE TITLE FORM
export function ChaptersForm({ initialData, courseId }: ChaptersFormProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  // const [isUpdating, setIsUpdating] = useState(false)

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
      const response = await createChapter(formData, courseId)

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

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      const response = await updateChapterOrder(updateData, courseId)

      // if (response?.success) {
      //   toast.success('Chapters reordered')
      // } else {
      //   toast.error(
      //     response?.error || 'Something went wrong, please try again.',
      //   )
      // }
      toast.error(response?.error || 'Something went wrong, please try again.')
    } catch (error) {
      // Other error from the try block
      console.error('ONREORDER CHAPTER ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const onEdit = (id: string) => {
    // Show chapter edit form
    router.push(`/teacher/courses/${courseId}/chapters/${id}`)
  }

  // FORM STATE
  const { isValid, errors, isSubmitting } = form.formState

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course chapters
        {/* ADD CHAPTER */}
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
      {/* FORM */}
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
                    defaultValue={undefined}
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
      {/* LIST OF CHAPTERS */}
      {!isCreating && (
        <div
          className={cn(
            'text-sm mt-2',
            !initialData.chapters.length && 'text-slate-500 italic',
          )}
        >
          {!initialData.chapters.length && 'No chapters'}
          <ChaptersList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.chapters || []}
            courseId={courseId}
          />
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
