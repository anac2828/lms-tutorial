'use server'
import * as z from 'zod'
import { prisma } from '../db'

import { revalidatePath } from 'next/cache'
import { getUserId } from '../auth'

import { handleActionError } from '../errorHandler'

// State
type ActionState = {
  success?: boolean
  error?: string
  courseId?: string
  chapter?: object
  chapterId?: string
} | null

// Data schema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createChapterFormSchema = z.object({ title: z.string() })

// ** CREATE CHAPTER *****
export async function createChapter(
  values: z.infer<typeof createChapterFormSchema>,
  courseId: string,
): Promise<ActionState> {
  try {
    const { title } = values

    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Check if user is owner of course
    const courseOwner = await prisma.course.findUnique({
      where: { id: courseId, userId },
    })

    // ERROR HANDLER
    if (!courseOwner) throw new Error('UNAUTHORIZED')

    // 3 Get last chapter uploaded
    const lastChapter = await prisma.chapter.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' },
    })

    const newPosition = lastChapter ? lastChapter.position + 1 : 1

    // 4 Create chapter
    const chapter = await prisma.chapter.create({
      data: { title, courseId, position: newPosition },
    })

    revalidatePath(`/teacher/courses/${courseId}`)

    return { success: true, chapter }
  } catch (error) {
    console.error('CREATE_CHAPTER_ACTION', error)
    return handleActionError(error, 'Failed to updated course.')
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
})
// *** UPDATE CHAPTER ***
export async function updateChapter(
  values: z.infer<typeof formSchema>,
  courseId: string,
  chapterId: string,
): Promise<ActionState> {
  try {
    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Check if user is owner of course
    const courseOwner = await prisma.course.findUnique({
      where: { id: courseId, userId },
    })

    //! TODO check if isPublished === true
    // ERROR HANDLER
    if (!courseOwner) throw new Error('UNAUTHORIZED')
    console.log('ACTION', values)
    // 3 Update chapter
    const chapter = await prisma.chapter.update({
      where: { id: chapterId, courseId },
      data: values,
    })

    revalidatePath(`/teacher/courses/${courseId}/chapters/${chapterId}`)
    return { success: true, chapter }
  } catch (error) {
    console.error('UPDATE_COURSE_ACTION', error)
    return handleActionError(error, 'Failed to updated course.')
  }
}

// ** UPDATE CHAPTER ORDER ***
export async function updateChapterOrder(
  orderList: {
    id: string
    position: number
  }[],
  courseId: string,
) {
  try {
    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Check if user is owner of course
    const courseOwner = await prisma.course.findUnique({
      where: { id: courseId, userId },
    })

    // ERROR HANDLER
    if (!courseOwner) throw new Error('UNAUTHORIZED')

    //3 Update order
    for (const item of orderList) {
      await prisma.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    }
    revalidatePath(`/teacher/courses/${courseId}`)

    return { success: true }
  } catch (error) {
    console.error('UPDATE_CHAPTER_ORDER_ACTION', error)
    return handleActionError(error, 'Failed to updated course.')
  }
}

// ** DELETE ATTACHMENT ****

export async function deleteAttachment(courseId: string, id: string) {
  try {
    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Check if user is owner of course
    const courseOwner = await prisma.course.findUnique({
      where: { id: courseId, userId },
    })

    if (!courseOwner) throw new Error('UNAUTHORIZED')

    // 3 Delete attachment
    await prisma.attachment.delete({ where: { courseId, id } })

    revalidatePath(`/teacher/courses/${courseId}`)
    return { success: true }
  } catch (error: unknown) {
    console.log('ATTACHMENT_ID', error)
    return handleActionError(error, 'Failed to updated course.')
  }
}
