'use server'
import * as z from 'zod'
import { prisma } from '../db'
import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

//* HELPERS
async function getUserId() {
  const { userId } = await auth()
  if (!userId) {
    throw new Error('You must be signed in to create an attachment')
  }
  return userId
}

// State
type ActionState = {
  success?: boolean
  error?: string
  courseId?: string
} | null

// Data schema
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const attachmentFormSchema = z.object({ url: z.string() })

// ** CREATER ATTACHMENT *****
export async function createAttachment(
  values: z.infer<typeof attachmentFormSchema>,
  courseId: string,
): Promise<ActionState> {
  try {
    const { url } = values
    const name = url.split('/').pop() || ''
    // 1 Check if user is signed in
    const userId = await getUserId()

    if (!userId) {
      return {
        success: false,
        error: 'Unauthenticated',
      }
    }

    // 2 Check is user is owner of course
    const courseOwner = await prisma.course.findUnique({
      where: { id: courseId, userId },
    })

    if (!courseOwner) {
      return {
        success: false,
        error: 'Unauthorized',
      }
    }

    // 3 Update course
    await prisma.attachment.create({
      data: { url, name, courseId },
    })

    revalidatePath(`/teacher/courses/${courseId}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating attachment:', error)
    return {
      success: false,
      error: 'Failed to update attachment. Please try again.',
    }
  }
}
