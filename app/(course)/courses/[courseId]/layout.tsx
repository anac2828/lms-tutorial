import { getProgress } from '@/lib/actions/get-progress'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'
import { CourseSideBar } from './components/CourseSidebar'
import { CourseNavbar } from './components/CourseNavbar'

async function CourseLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { courseId: string }
}) {
  const { userId } = await auth()
  if (!userId) return redirect('/')

  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        where: { isPublished: true },
        include: { userProgress: { where: { userId } } },
        orderBy: { position: 'asc' },
      },
    },
  })

  if (!course) return redirect('/')

  const progressCount = await getProgress(userId, courseId)

  return (
    <div className='h-full'>
      {/* MOBILE NAVBAR */}
      <div className='fixed inset-y-0 z-50 w-full h-20 md:pl-80'>
        <CourseNavbar course={course} progressCount={progressCount} />
      </div>
      <div className='fixed inset-y-0 z-50 flex-col hidden h-full md:flex w-80'>
        <CourseSideBar course={course} progressCount={progressCount} />
      </div>
      <main className='h-full pt-20 md:pl-80'>{children}</main>
    </div>
  )
}

export default CourseLayout
