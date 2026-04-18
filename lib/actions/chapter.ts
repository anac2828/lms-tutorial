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
} | null

// Data schema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const attachmentFormSchema = z.object({ title: z.string() })

// ** CREATE CHAPTER *****
export async function createAttachment(
  values: z.infer<typeof attachmentFormSchema>,
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

    console.log(lastChapter)
    const newPosition = lastChapter ? lastChapter.position + 1 : 1

    // 4 Create chapter
    const chapter = await prisma.chapter.create({
      data: { title, courseId, position: newPosition },
    })

    revalidatePath(`/teacher/courses/${courseId}`)

    return { success: true, chapter }
  } catch (error) {
    console.error('UPLOAD_ATTACHMENT_ACTION', error)
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
