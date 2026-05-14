import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Chapter, Course, UserProgress } from '@/lib/generated/prisma/client'
import { Menu } from 'lucide-react'
import { CourseSideBar } from './CourseSidebar'

interface CourseMobileSidebarProps {
  course: Course & {
    chapters: (Chapter & { userProgress: UserProgress[] | null })[]
  }
  progressCount: number
}

export function CourseMobileSidebar({
  course,
  progressCount,
}: CourseMobileSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger className='pr-4 transition md:hidden hover:opacity-75'>
        <Menu />
      </SheetTrigger>
      <SheetContent side='left' className='p-0 bg-white w-72'>
        <CourseSideBar course={course} progressCount={progressCount} />
      </SheetContent>
    </Sheet>
  )
}
