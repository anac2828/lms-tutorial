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

// SCHEMA FOR VALIDATING COURSE DATA
const formSchema = z.object({
  title: z.string().min(1, { message: 'Course title is required' }).optional(),
  description: z
    .string()
    .min(1, { message: 'Course description is required' })
    .optional(),
  imageUrl: z.string().optional(),
  courseId: z.string().optional(),
})

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
export async function updateCourse(
  prevState: ActionState,
  values: FormData | z.infer<typeof formSchema>,
): Promise<ActionState> {
  try {
    let data: z.infer<typeof formSchema>
    let courseId

    if (values instanceof FormData) {
      const title = values.get('title') as string
      const description = values.get('description') as string
      courseId = values.get('courseId') as string
      data = title ? { title } : { description }
    } else {
      courseId = values.courseId
      data = { imageUrl: values.imageUrl }
    }

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
      data: data,
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
