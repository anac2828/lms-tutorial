import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { prisma } from '@/lib/db'

async function CoursesPage() {
  const courses = await prisma.course.findMany()

  return (
    <div className='p-6'>
      <Link href='/teacher/create'>
        <Button>New Course</Button>
      </Link>
      <ul>
        {courses.map((course) => (
          <li key={course.id}>{course.id}</li>
        ))}
      </ul>
    </div>
  )
}

export default CoursesPage
