import { Category, Course } from '@/lib/generated/prisma/client'
import { CourseCard } from './CourseCard'

type CourseWithProgressWithCategory = Course & {
  category: Category | null
  chapters: { id: string }[]
  progress: number | null
}

interface CourseListProps {
  items: CourseWithProgressWithCategory[]
}
export function CoursesList({ items }: CourseListProps) {
  return (
    <div>
      <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4'>
        {items.map((item) => (
          <CourseCard
            key={item.id}
            id={item.id}
            title={item.title}
            imageUrl={item.imageUrl!}
            chaptersLength={item.chapters.length}
            price={item.price!}
            progress={item.progress}
            category={item?.category?.name || 'Uncategorized'}
          />
        ))}
      </div>
      {items.length === 0 && (
        <div className='mt-10 text-sm text-center text-muted-foreground'>
          No courses found
        </div>
      )}
    </div>
  )
}
