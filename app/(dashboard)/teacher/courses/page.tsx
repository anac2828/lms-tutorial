import { prisma } from '@/lib/db'
import { DataTable } from './components/data-table'
import { columns } from './components/columns'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

async function CoursesPage() {
  const { userId } = await auth()

  if (!userId) redirect('/')

  const courses = await prisma.course.findMany({ where: { userId } })

  return (
    <div className='p-6'>
      <DataTable columns={columns} data={courses} />
    </div>
  )
}

export default CoursesPage
