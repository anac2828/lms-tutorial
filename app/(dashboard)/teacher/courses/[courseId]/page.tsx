import { IconBadge } from '@/components/icon-badge'
import { prisma } from '@/lib/db'
import { LayoutDashboard } from 'lucide-react'
import { redirect } from 'next/navigation'
import { TitleForm } from './components/TitleForm'
import { DescriptionForm } from './components/DescriptionForm'
import { ImageForm } from './components/ImageForm'
import { CategoryForm } from './components/CategoryForm'

async function coursePage({ params }: { params: { courseId: string } }) {
  // 1. Get course id from params
  const { courseId } = await params

  if (!courseId) {
    return redirect('/')
  }

  // 2. Get course from database
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  })

  if (!course) {
    return redirect('/')
  }

  // 3. Check how many fields need to be filled out to complete the course creation process
  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.price,
    course.categoryId,
  ]

  const totalNumFields = requiredFields.length
  // Returned only the number of fields that are not empty or null
  const completedFields = requiredFields.filter(Boolean).length
  const completionText = `(${completedFields}/${totalNumFields})`

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-y-2'>
          <h1 className='text-2xl font-medium'>Course setup</h1>
          <span>Complete all fields {completionText}</span>
        </div>
      </div>
      <div className='grid grid-cols-1 gap-6 mt-16 md:grid-cols-2'>
        <div>
          <div className='flex items-center gap-x-2'>
            <IconBadge icon={LayoutDashboard} />
            <h2 className='text-xl'>Customize your course</h2>
          </div>
          <TitleForm initialData={course} courseId={course.id} />
          <DescriptionForm initialData={course} courseId={course.id} />
          <ImageForm initialData={course} courseId={course.id} />
          <CategoryForm
            initialData={course}
            courseId={course.id}
            options={categories.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
          />
        </div>
      </div>
    </div>
  )
}

export default coursePage
