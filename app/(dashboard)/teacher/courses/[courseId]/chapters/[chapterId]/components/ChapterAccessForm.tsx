'use client'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldDescription,
} from '@/components/ui/field'

import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { useState } from 'react'

import { toast } from 'sonner'
import { updateChapter } from '@/lib/actions/chapter'
import { Chapter } from '@/lib/generated/prisma/client'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface ChapterAccessFormProps {
  initialData: Chapter
  courseId: string
  chapterId: string
}

const formSchema = z.object({
  isFree: z.boolean(),
})

// * COMPONENT
export function ChaperAccessForm({
  initialData,
  courseId,
  chapterId,
}: ChapterAccessFormProps) {
  const [isEditing, setIsEditing] = useState(false)

  // FORM SETUP
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { isFree: !!initialData.isFree },
  })

  // HANDLERSk
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)
  const onSubmitForm = async (formData: z.infer<typeof formSchema>) => {
    try {
      const response = await updateChapter(formData, courseId, chapterId)

      if (response?.success) {
        toast.success('Chapter access updated.')
        onToggleEdit()
      } else {
        toast.error(response?.error || 'Something went wrong.')
      }
    } catch (error) {
      console.error('UPDATE CHAPER ACCESS SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  // FORM STATE
  const { isValid, errors, isSubmitting } = form.formState

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Chapter Access
        <Button onClick={onToggleEdit} variant='ghost'>
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <Pencil className='w-4 h-4 mr-2' /> Edit access
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <div
          className={cn(
            'text-sm mt-2',
            !initialData.isFree && 'text-slate-500 italic',
          )}
        >
          {initialData.isFree
            ? 'This chapter is free for preview.'
            : 'This chapter is not free.'}
        </div>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmitForm)}
          className='mt-4 space-y-4'
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name='isFree'
              render={({ field }) => (
                <Field
                  className='flex items-start p-4 space-y-0 border rounded-md'
                  orientation='horizontal'
                >
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className='bg-zinc-50'
                  />
                  {errors.isFree && (
                    <FieldError errors={[{ message: errors.isFree.message }]} />
                  )}

                  <FieldDescription className='leading-none'>
                    Check this box if you want to make this chapter free for
                    preview.
                  </FieldDescription>
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
