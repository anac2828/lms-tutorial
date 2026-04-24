import { ArrowLeft, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { IconBadge } from '@/components/icon-badge'
import { ChaperTitleForm } from './components/ChapterTitleForm'
import { ChapterDescriptionForm } from './components/ChapterDescriptionForm'

async function ChapterIdPage({
  params,
}: {
  params: { courseId: string; chapterId: string }
}) {
  const { courseId, chapterId } = await params
  const { userId } = await auth()

  if (!userId) return redirect('/')

  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId, courseId: courseId },
    include: { muxData: true },
  })

  if (!chapter) return redirect('/')

  const requiredFields = [chapter.title, chapter.description, chapter.videoUrl]

  const totalFields = requiredFields.length
  // requiredFields.filter(Boolean) returns array of fields that not null
  const completedFields = requiredFields.filter(Boolean).length
  const completitionText = `(${completedFields}/${totalFields})`

  return (
    <div className='p-6'>
      <div className='flex items-center justify-between'>
        <div className='w-full'>
          {/* BACK TO COURSE */}
          <Link
            href={`/teacher/courses/${courseId}`}
            className='flex items-center mb-6 text-sm transition hover:opacity-75'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            Back to course setup
          </Link>
          {/* COMPLETED FIELDS */}
          <div className='flex items-center justify-between w-full'>
            <div className='flex flex-col gap-y-2'>
              <h1 className='text-2xl font-medium'>Chapter Creation</h1>
              <span className='text-sm text-slate-700'>
                Complete all fields {completitionText}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* CHAPTER DETAILS */}
      <div className='grid grid-cols-1 gap-6 mt-16 md:grid-cols-2'>
        <div className='space-y-4'>
          <div>
            <div className='flex items-center gap-x-2'>
              <IconBadge icon={LayoutDashboard} />
              <h2 className='text-xl'>Customize your chapter</h2>
            </div>
            <ChaperTitleForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
            <ChapterDescriptionForm
              initialData={chapter}
              courseId={courseId}
              chapterId={chapterId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChapterIdPage
