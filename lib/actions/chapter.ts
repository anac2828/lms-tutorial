'use server'
import * as z from 'zod'
import { revalidatePath } from 'next/cache'
import Mux from '@mux/mux-node'

import { prisma } from '../db'
import { getUserId } from '../auth'
import { handleActionError } from '../errorHandler'

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN,
  tokenSecret: process.env.MUX_SECRET_KEY,
})

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
  isFree: z.boolean().optional(),
  videoUrl: z.string().optional(),
  isPublished: z.boolean().optional(),
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

    // ERROR HANDLER
    if (!courseOwner) throw new Error('UNAUTHORIZED')

    // 3 Update chapter
    await prisma.chapter.update({
      where: { id: chapterId, courseId },
      data: values,
    })

    // ** Video update
    if (values.videoUrl) {
      const existingMuxData = await prisma.muxData.findFirst({
        where: { chapterId },
      })

      //Delete existing video before uploading new one
      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId)
        await prisma.muxData.delete({
          where: { id: existingMuxData.id },
        })
      }

      //5 Upload new video to mux and save link to database
      const asset = await mux.video.assets.create({
        inputs: [{ url: values.videoUrl }],
        playback_policies: ['public'],
        test: false,
      })

      await prisma.muxData.create({
        data: {
          chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id || '',
        },
      })
    }

    revalidatePath(`/teacher/courses/${courseId}/chapters/${chapterId}`)
    return { success: true }
  } catch (error) {
    console.error('UPDATE_CHAPTER_ACTION', error)
    return handleActionError(error, 'Failed to updated course.')
  }
}

// *** DELETE CHAPTER ***
export async function deleteChapter(
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

    // ERROR HANDLER
    if (!courseOwner) throw new Error('UNAUTHORIZED')

    // 3 Find chapter to update

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId, courseId },
    })

    // ERROR HANDLER
    if (!chapter) throw new Error('NOT FOUND')

    //4 Remove Mux data
    if (chapter.videoUrl) {
      const existingMuxData = await prisma.muxData.findFirst({
        where: { chapterId },
      })

      if (existingMuxData) {
        await mux.video.assets.delete(existingMuxData.assetId)
        await prisma.muxData.delete({ where: { id: existingMuxData.id } })
      }
    }

    // 5 Delete chapter
    await prisma.chapter.delete({
      where: { id: chapterId, courseId },
    })

    // 6 Check if there are any published chapters
    const publishedChaptersInCourse = await prisma.chapter.findMany({
      where: { courseId, isPublished: true },
    })

    //7 Delete course if there a no published chapters

    if (!publishedChaptersInCourse.length) {
      await prisma.course.update({
        where: { id: courseId },
        data: { isPublished: false },
      })
    }

    return { success: true }
  } catch (error) {
    console.error('DELETE_CHAPTER_ACTION', error)
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

// ** PUBLISH CHAPTER ** //
export async function publishChapter(
  courseId: string,
  chapterId: string,
): Promise<ActionState> {
  try {
    console.log('PUBLISHED')
    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Check if user is owner of course
    const courseOwner = await prisma.course.findUnique({
      where: { id: courseId, userId },
    })

    // ERROR HANDLER
    if (!courseOwner) throw new Error('UNAUTHORIZED')

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId, courseId },
    })

    const muxData = await prisma.muxData.findUnique({ where: { chapterId } })

    if (
      !chapter ||
      !muxData ||
      !chapter.title ||
      !chapter.description ||
      !chapter.videoUrl
    ) {
      throw new Error('Missing required fields.')
    }

    await prisma.chapter.update({
      where: { id: chapterId, courseId },
      data: { isPublished: true },
    })

    revalidatePath(`/teacher/courses/${courseId}/chapters/${chapterId}`)
    return { success: true }
  } catch (error) {
    console.log('PUBLISH_CHAPTER', error)
    return handleActionError(error, 'Failed to publish chapter.')
  }
}

// ** UNPUBLISH CHAPTER ** //
export async function unpublishChapter(
  courseId: string,
  chapterId: string,
): Promise<ActionState> {
  try {
    console.log('UNPUBLISHED')
    // 1 Check if user is signed in
    const userId = await getUserId()

    // 2 Check if user is owner of course
    const courseOwner = await prisma.course.findUnique({
      where: { id: courseId, userId },
    })

    // ERROR HANDLER
    if (!courseOwner) throw new Error('UNAUTHORIZED')

    // Unpublish chapter
    const chapter = await prisma.chapter.update({
      where: { id: chapterId, courseId },
      data: { isPublished: false },
    })

    // Find any published chapters in the course
    const publishedChaptersInCourse = await prisma.chapter.findMany({
      where: { courseId, isPublished: true },
    })

    // Unpublish course if it has no published chapters
    if (!publishedChaptersInCourse.length) {
      await prisma.course.update({
        where: {
          id: courseId,
        },
        data: { isPublished: false },
      })
    }
    console.log(chapter)
    revalidatePath(`/teacher/courses/${courseId}/chapters/${chapterId}`)
    return { success: true }
  } catch (error) {
    console.log('PUBLISH_CHAPTER', error)
    return handleActionError(error, 'Failed to publish chapter.')
  }
}
