'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'

import Link from 'next/link'
import { toast } from 'sonner'
import {
  FieldDescription,
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from '@/components/ui/field'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createCourse } from '@/lib/actions/course'
import { useRouter } from 'next/navigation'

// FORM SCHEMA
const formSchema = z.object({
  title: z.string().min(1, { message: 'Course title is required' }),
})

// ** COMPONENT
function CreateCoursePage() {
  // react hook form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '' },
  })

  const router = useRouter()
  const { isValid, errors, isSubmitting } = form.formState

  // HANDLER
  const onSubmitForm = async (formData: z.infer<typeof formSchema>) => {
    try {
      const response = await createCourse(formData)

      if (response?.success) {
        toast.success('Course created successfully!')
        router.push(`/teacher/courses/${response.courseId}`)
      } else {
        // Error from action function
        toast.error(response?.error || 'Something went wrong.')
      }
    } catch (error) {
      // Other error from the try block
      console.error('CREATE FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className='flex h-full max-w-5xl p-6 mx-auto md:items-center md:justify-center'>
      <Card className='w-full sm:max-w-md'>
        <CardHeader>
          <CardTitle>
            <h1 className='text-2xl'>Name your course</h1>
          </CardTitle>
          <CardDescription>
            <p>
              What would you like to name your course? Don&apos;t worry, you can
              change this later.
            </p>
          </CardDescription>
        </CardHeader>
        {/* FORM */}
        <CardContent>
          <form
            onSubmit={form.handleSubmit(onSubmitForm)}
            className='mt-8 space-y-8'
          >
            <FieldGroup>
              <Controller
                name='title'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel>Course Title</FieldLabel>
                    <Input
                      disabled={isSubmitting}
                      placeholder='e.g. "Advanced web developement'
                      {...field}
                    />
                    {errors.title && (
                      <FieldError
                        errors={[{ message: errors.title.message }]}
                      />
                    )}

                    <FieldDescription>
                      What will you teach in this course?
                    </FieldDescription>
                  </Field>
                )}
              />
            </FieldGroup>
            {/* BUTTONS */}
            <div className='flex items-center gap-x-2'>
              <Link href='/'>
                <Button type='button' variant='ghost'>
                  Cancel
                </Button>
              </Link>
              <Button type='submit' disabled={!isValid || isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateCoursePage
