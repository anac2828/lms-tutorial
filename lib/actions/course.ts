'use server'
import * as z from 'zod'
import { prisma } from '../db'

import { revalidatePath } from 'next/cache'
import { getUserId } from '../auth'
import { handleActionError } from '../errorHandler'
import Mux from '@mux/mux-node'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN,
  tokenSecret: process.env.MUX_SECRET_KEY,
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  values: z.infer<typeof createCourseformSchema>,
): Promise<ActionState> {
  try {
    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Create course
    const course = await prisma.course.create({
      data: {
        title: values.title,
        userId,
      },
    })

    // 3 Revalidate the courses page to show the new course in the list without needing to refresh the page
    revalidatePath('/teacher/courses')
    // Action state will be returned to the client and can be used to show success or error messages
    return { success: true, courseId: course.id }
  } catch (error) {
    console.error('CREATE_COURSE_ACTION', error)
    return handleActionError(
      error,
      'Something went wrong! Course not created, please try again.',
    )
  }
}

// ******* ACTION FUNCTION TO UPDATE A COURSE *******

// SCHEMA FOR VALIDATING COURSE DATA
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateFormSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  imageUrl: z.string().optional(),
  courseId: z.string().optional(),
  categoryId: z.string().optional(),
  price: z.coerce.number().optional(),
})

export async function updateCourse(
  values: z.infer<typeof updateFormSchema>,
  courseId: string,
): Promise<ActionState> {
  try {
    // 2 Check if user is signed in
    await getUserId()

    // 3 Update course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: values,
    })

    revalidatePath(`/teacher/courses/${course.id}`)
    return { success: true }
  } catch (error) {
    console.error('UPDATE_COURSE_ACTION', error)
    return handleActionError(error, 'Failed to updated course.')
  }
}

export async function publishCourse(courseId: string): Promise<ActionState> {
  try {
    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Check if user is owner of course
    const course = await prisma.course.findUnique({
      where: { id: courseId, userId },
      include: { chapters: { include: { muxData: true } } },
    })

    // ERROR HANDLER
    if (!course) throw new Error('NOT FOUND')

    if (
      !course.title ||
      !course.description ||
      !course.imageUrl ||
      !course.price ||
      !course.categoryId ||
      !course.chapters.some((chapter) => chapter.isPublished)
    ) {
      throw new Error('Missing required fields.')
    }

    await prisma.course.update({
      where: { id: courseId, userId },
      data: { isPublished: true },
    })

    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    console.log('PUBLISH_CHAPTER', error)
    return handleActionError(error, 'Failed to publish chapter.')
  }
}

// ** UNPUBLISH CHAPTER ** //
export async function unpublishCourse(courseId: string): Promise<ActionState> {
  try {
    // 1 Check if user is signed in
    const userId = await getUserId()

    // Unpublish course if it has no published chapters

    await prisma.course.update({
      where: {
        id: courseId,
        userId,
      },
      data: { isPublished: false },
    })

    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (error) {
    console.log('UNPUBLISH_CHAPTER', error)
    return handleActionError(error, 'Failed to unpublish chapter.')
  }
}

// *** DELETE COURSE ***
export async function deleteCourse(courseId: string): Promise<ActionState> {
  try {
    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Find chapter to update
    const course = await prisma.course.findUnique({
      where: { id: courseId, userId },
      include: { chapters: { include: { muxData: true } } },
    })

    // ERROR HANDLER
    if (!course) throw new Error('NOT FOUND')

    //3 Remove Mux data
    for (const chapter of course.chapters) {
      if (chapter.muxData?.assetId) {
        await mux.video.assets.delete(chapter.muxData.assetId)
      }
    }

    // 5 Delete chapter
    await prisma.course.delete({
      where: { id: courseId },
    })

    return { success: true }
  } catch (error) {
    console.error('DELETE_CHAPTER_ACTION', error)
    return handleActionError(error, 'Failed to delete course.')
  }
}
