'use client'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { cn } from '@/lib/utils'
import { Course } from '@/lib/generated/prisma/client'
import { updateCourse } from '@/lib/actions/course'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PriceFormProps {
  initialData: Course

  courseId: string
}

const formSchema = z.object({
  price: z.coerce.number<number>().min(0, 'Price must be 0 or greater'),
})

// * COMPONENT FOR COURSE TITLE FORM
export function PriceForm({ initialData, courseId }: PriceFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: initialData?.price || 0,
    },
  })

  // HANDLERS
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)
  const onSubmitForm = async (formData: z.infer<typeof formSchema>) => {
    try {
      const response = await updateCourse(formData, courseId)

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
      console.error('UPDATE FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const displayPrice = initialData.price
    ? `$${Number(initialData.price).toFixed(2)}`
    : 'No price set'
  // FORM STATE
  const { isValid, errors, isSubmitting } = form.formState

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course Price
        <Button onClick={onToggleEdit} variant='ghost'>
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <Pencil className='w-4 h-4 mr-2' /> Edit price
            </>
          )}
        </Button>
      </div>
      {!isEditing ? (
        <p
          className={cn(
            'mt-2 text-sm',
            !initialData.price && 'text-slate-500 italic',
          )}
        >
          {displayPrice}
        </p>
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmitForm)}
          className='mt-4 space-y-4'
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name='price'
              render={({ field }) => (
                <Field>
                  <Input
                    type='number'
                    step='0.001'
                    disabled={isSubmitting}
                    placeholder='Set a price for your course'
                    {...field}
                  />
                  {errors.price && (
                    <FieldError errors={[{ message: errors.price.message }]} />
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
