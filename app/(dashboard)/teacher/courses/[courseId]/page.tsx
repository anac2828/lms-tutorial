import {
  CircleDollarSign,
  File,
  LayoutDashboard,
  ListChecks,
} from 'lucide-react'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { IconBadge } from '@/components/icon-badge'
import { TitleForm } from './components/TitleForm'
import { DescriptionForm } from './components/DescriptionForm'
import { ImageForm } from './components/ImageForm'
import { CategoryForm } from './components/CategoryForm'
import { PriceForm } from './components/PriceForm'
import { AttachmentForm } from './components/AttachmentForm'
import { ChaptersForm } from './components/ChaptersForm'
import { auth } from '@clerk/nextjs/server'
import { Banner } from '@/components/banner'
import { CourseActions } from './components/CourseActions'

async function coursePage({ params }: { params: { courseId: string } }) {
  // 1. Get course id from params
  const { courseId } = await params
  const { userId } = await auth()

  if (!courseId || !userId) {
    return redirect('/')
  }

  // 2. Get course from database
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      userId,
    },
    include: {
      chapters: {
        orderBy: { position: 'asc' },
      },
      attachments: {
        orderBy: { createdAt: 'desc' },
      },
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
    course.chapters.some((chapter) => chapter.isPublished), //chapter has been published
  ]

  const totalNumFields = requiredFields.length
  // Returned only the number of fields that are not empty or null
  const completedFields = requiredFields.filter(Boolean).length
  const completionText = `(${completedFields}/${totalNumFields})`
  const isCompleted = requiredFields.every(Boolean)

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return (
    <>
      {!course.isPublished && (
        <Banner label='This course is unplublished. It will not be visible to the students.' />
      )}
      <div className='p-6'>
        {/* HEADER  */}
        <div className='flex items-center justify-between'>
          <div className='flex flex-col gap-y-2'>
            <h1 className='text-2xl font-medium'>Course setup</h1>
            <span>Complete all fields {completionText}</span>
            <span className='text-sm text-muted-foreground'>
              {!requiredFields.at(-1) &&
              requiredFields.slice(0, -1).every(Boolean)
                ? 'Plublish a chapter to complete course setup.'
                : ''}
            </span>
          </div>
          <CourseActions
            disabled={isCompleted}
            courseId={courseId}
            isPublished={course.isPublished}
          />
        </div>
        {/* COURSE DETAILS */}
        <div className='grid grid-cols-1 gap-6 mt-16 md:grid-cols-2'>
          {/* LEFT COLUMN */}
          <div>
            {/* Header */}
            <div className='flex items-center gap-x-2'>
              <IconBadge icon={LayoutDashboard} />
              <h2 className='text-xl'>Customize your course</h2>
            </div>
            {/* FORMS */}
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
          {/* RIGHT COLUMN */}
          <div className='space-y-6'>
            {/* CHAPTERS */}
            <div>
              <div className='flex items-center gap-x-2'>
                <IconBadge icon={ListChecks} />
                <h2 className='text-xl'>Course chapters</h2>
              </div>
              <ChaptersForm initialData={course} courseId={course.id} />
            </div>
            {/* PRICE */}
            <div>
              <div className='flex items-center gap-x-2'>
                <IconBadge icon={CircleDollarSign} />
                <h2 className='text-xl'>Sell your course</h2>
              </div>
              <PriceForm initialData={course} courseId={course.id} />
            </div>
            {/* RESOURCES */}
            <div>
              <div className='flex items-center gap-x-2'>
                <IconBadge icon={File} />
                <h2 className='text-xl'>Resources & Attachments</h2>
              </div>
              <AttachmentForm initialData={course} courseId={course.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default coursePage
