'use server'
import * as z from 'zod'
import { prisma } from '../db'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

const formSchema = z.object({
  title: z.string().min(1, { message: 'Course title is required' }),
  description: z
    .string()
    .min(1, { message: 'Course description is required' })
    .optional(),
})

//* HELPERS
async function getUserId() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('You must be signed in to create a course')
  }
  return userId
}

type ActionState = {
  success?: boolean
  error?: string
  courseId?: string
} | null

// ******* ACTION FUNCTION TO CREATE A COURSE *******
export async function createCourse(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // 1 Check if user is signed in
  const userId = await getUserId()

  // 2 Validate form data
  const validatedFields = formSchema.safeParse({
    title: formData.get('title'),
  })

  if (!validatedFields.success) {
    console.log(validatedFields.error)
    throw new Error(validatedFields.error.message)
  }
  // 2 Create course
  const course = await prisma.course.create({
    data: {
      title: validatedFields.data.title,
      userId,
    },
  })

  if (!course) {
    throw new Error(
      'Something went wrong creating the course, please try again.',
    )
  }

  // 3 Revalidate the courses page to show the new course in the list without needing to refresh the page
  revalidatePath('/teacher/courses')
  // Action state will be returned to the client and can be used to show success or error messages
  return { success: true, courseId: course.id }
}

// ******* ACTION FUNCTION TO UPDATE A COURSE *******
export async function updateCourse(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const courseId = formData.get('courseId') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string

  const data = title ? { title } : { description }

  // // 1 VALIDATE FORM DATA
  // const validatedFields = formSchema.safeParse({
  //   title,
  //   description: description || undefined,
  // })

  // if (!validatedFields.success) {
  //   return {
  //     success: false,
  //     error: validatedFields.error.message,
  //   }
  // }

  try {
    // 2 Check if user is signed in
    const userId = await getUserId()

    if (!userId) {
      return {
        success: false,
        error: 'Unauthenticated',
      }
    }

    // 3 Update course
    const course = await prisma.course.update({
      where: { id: courseId, userId },
      data,
    })

    revalidatePath(`/teacher/courses/${course.id}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating course:', error)
    return {
      success: false,
      error: 'Failed to update course. Please try again.',
    }
  }
}
