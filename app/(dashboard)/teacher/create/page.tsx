'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useActionState, useEffect } from 'react'
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
function CrateCoursePage() {
  // formAction is the function that will be called when the form is submitted, it is returned by the useActionState hook (createCouase)
  // state is the state returned by the action (createCourse) and is used to show success or error messages
  const [state, formAction, isPending] = useActionState(createCourse, null)
  // react hook form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '' },
  })
  const { isValid, errors } = form.formState
  const router = useRouter()

  // SIDE EFFECT to show toast notification on success or error
  useEffect(() => {
    if (state?.success) {
      toast.success('Course created')
      router.push(`/teacher/courses/${state.courseId}`)
    }

    if (state?.error) {
      toast.error('Something went wrong, please try again.')
    }
  }, [state, router])

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
            // onSubmit={form.handleSubmit(onSubmitForm)}
            action={formAction}
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
                      disabled={isPending}
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
              <Button type='submit' disabled={!isValid || isPending}>
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CrateCoursePage
