import { prisma } from '../db'

export async function getProgress(
  userId: string,
  courseId: string,
): Promise<number> {
  try {
    const publishedChapters = await prisma.chapter.findMany({
      where: { courseId, isPublished: true },
      select: { id: true },
    })

    //   Array of chapter Ids
    const publishedChapterIds = publishedChapters.map((chapter) => chapter.id)
    // Chapters completed by user
    const validCompletedChapters = await prisma.userProgress.count({
      where: {
        userId,
        chapterId: { in: publishedChapterIds },
        isCompleted: true,
      },
    })

    //User course progress
    const progressPercentage =
      (validCompletedChapters / publishedChapterIds.length) * 100

    return progressPercentage
  } catch (error) {
    console.log('[GET_PROGRESS]', error)
    return 0
  }
}
