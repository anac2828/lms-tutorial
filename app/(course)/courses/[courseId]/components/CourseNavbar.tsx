import { NavbarRoutes } from '@/components/navbar-routes'
import { Chapter, Course, UserProgress } from '@/lib/generated/prisma/client'
import { CourseMobileSidebar } from './CourseMobileSidebar'

interface CourseNavbarProps {
  course: Course & {
    chapters: (Chapter & { userProgress: UserProgress[] | null })[]
  }
  progressCount: number
}

export function CourseNavbar({ course, progressCount }: CourseNavbarProps) {
  return (
    <div className='flex items-center h-full p-4 bg-white border-b shadow-sm'>
      <CourseMobileSidebar course={course} progressCount={progressCount} />
      <NavbarRoutes />
    </div>
  )
}
