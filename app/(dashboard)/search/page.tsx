import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { getCoursesWithProgress } from '@/lib/actions/course'
import { Categories } from './components/Categories'
import { SearchInput } from '@/components/SearchInput'
import { CoursesList } from '@/components/CoursesList'

interface SearchPageProps {
  searchParams: { title: string; category: string }
}

// ** COMPONENT
async function SearchPage({ searchParams }: SearchPageProps) {
  const { userId } = await auth()

  if (!userId) return redirect('/')

  // Get categories from database
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })
  const params = await searchParams
  // Get courses with progress from database
  console.log('SEARCH PARAMS', params)
  const courses = await getCoursesWithProgress({ userId, ...params })

  return (
    <>
      <div className='block px-6 pt-6 md:hidden md:mb-0'>
        <SearchInput />
      </div>
      <div className='p-6 space-y-4'>
        {/* Category buttons */}
        <Categories items={categories} />
        <CoursesList items={courses} />
      </div>
    </>
  )
}

export default SearchPage
