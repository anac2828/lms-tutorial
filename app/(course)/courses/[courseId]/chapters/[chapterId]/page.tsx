import { Banner } from '@/components/banner'
import { getChapter } from '@/lib/actions/chapter'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { VideoPlayer } from './components/VideoPlayer'
import { CourseEnrollButton } from './components/CourseEnrollButton'
import { Separator } from '@/components/ui/separator'

import { ChapterEditorPreview } from './components/ChapterEditorPreview'
import { File } from 'lucide-react'

async function ChapterIdPage({
  params,
}: {
  params: { courseId: string; chapterId: string }
}) {
  const { courseId, chapterId } = await params
  const { userId } = await auth()

  if (!userId) return redirect('/')

  const result = await getChapter({ userId, courseId, chapterId })
  if (!result) return redirect('/')

  const {
    chapter,
    course,
    muxData,
    attachments,
    nextChapter,
    userProgress,
    purchase,
  } = result

  if (!chapter || !course) return redirect('/')

  const isLocked = !chapter.isFree && !purchase
  const completeOnEnd = !!purchase && !userProgress?.isCompleted

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner variant='success' label='You already completed this chapter.' />
      )}
      {isLocked && (
        <Banner
          variant='warning'
          label='You need to purchase this course to watch this chapter.'
        />
      )}
      <div className='flex flex-col max-w-4xl pt-4 pb-20 mx-auto'>
        <VideoPlayer
          chapterId={chapterId}
          title={chapter.title}
          courseId={courseId}
          nextChapterId={nextChapter?.id}
          playbackId={muxData?.playbackId}
          isLocked={isLocked}
          completeOnEnd={completeOnEnd}
        />
      </div>
      <div>
        <div className='flex flex-col items-center justify-between p-4 md:flex-row'>
          <h2 className='mb-2 text-2xl font-semibold'>{chapter.title}</h2>
          {purchase ? (
            <div>{/* TODO: Add courseprogressbutton */}</div>
          ) : (
            <CourseEnrollButton courseId={courseId} price={course.price!} />
          )}
        </div>
        <Separator />
        <div className='p-3'>
          <ChapterEditorPreview value={chapter.description} />
        </div>
        {!!attachments.length && (
          <>
            <Separator />
            <div className='p-4'>
              {attachments.map((attachment) => (
                <a
                  href={attachment.url}
                  target='_blank'
                  key={attachment.id}
                  className='flex items-center w-full p-3 border rounded-md bg-sky-200 text-sky-700 hover:underline'
                >
                  <File />
                  <p className='line-clamp-1'>{attachment.name}</p>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChapterIdPage
