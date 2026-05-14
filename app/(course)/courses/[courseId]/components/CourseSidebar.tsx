import { prisma } from '@/lib/db'
import { Chapter, Course, UserProgress } from '@/lib/generated/prisma/client'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { CourseSidebarItem } from './CourseSidebarItem'

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & { userProgress: UserProgress[] | null })[]
  }
  progressCount: number
}

export async function CourseSideBar({
  course,
  progressCount,
}: CourseSidebarProps) {
  const { userId } = await auth()
  if (!userId) return redirect('/')

  const purchase = await prisma.purchase.findUnique({
    where: { userId_courseId: { userId, courseId: course.id } },
  })
  return (
    <div className='flex flex-col h-full overflow-y-auto border-r shadow-sm'>
      <div className='flex flex-col p-8 border-b'>
        <h1 className='font-semibold'>{course.title}</h1>
      </div>
      <div className='flex flex-col w-full'>
        {course.chapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  )
}
