import { prisma } from '@/lib/db'

import { redirect } from 'next/navigation'

async function CourseIdPage({ params }: { params: { courseId: string } }) {
  const { courseId } = await params

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: { where: { isPublished: true }, orderBy: { position: 'asc' } },
    },
  })
  if (!course) return redirect('/')
  // Redirect to the first chapter of the course
  return redirect(`/courses/${course.id}/chapters/${course.chapters[0].id}`)
}

export default CourseIdPage
