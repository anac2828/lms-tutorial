'use server'
import * as z from 'zod'
import { prisma } from '../db'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

//* HELPERS
async function getUserId() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('You must be signed in to create a course')
  }
  return userId
}

const createCourseformSchema = z.object({
  title: z.string().min(1, { message: 'Course title is required' }),
})

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
  const validatedFields = createCourseformSchema.safeParse({
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

// SCHEMA FOR VALIDATING COURSE DATA
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
  courseId: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.coerce.number().optional(),
})

export async function updateCourse(
  values: z.infer<typeof formSchema>,
  courseId: string,
): Promise<ActionState> {
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
      where: { id: courseId },
      data: values,
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
