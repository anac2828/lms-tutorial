'use client'

import { ConfirmModal } from '@/components/confirm-modal'
import { Button } from '@/components/ui/button'
import { deleteChapter, updateChapter } from '@/lib/actions/chapter'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface ChapterActionsProps {
  disabled: boolean
  courseId: string
  chapterId: string
  isPublished: boolean
}

export function ChapterActions({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ChapterActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const onPublish = async () => {
    try {
      setIsLoading(true)
      const response = await updateChapter(
        { isPublished: !isPublished },
        courseId,
        chapterId,
      )

      if (response?.success) {
        // isPublished default is false when chapter is submitted it will be true
        toast.success(`Chapter ${isPublished ? 'unpublished' : 'published'}`)
      }
    } catch (error) {
      console.error('ON_PUBLISH_CHAPTER', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setIsLoading(true)

      const response = await deleteChapter(courseId, chapterId)

      if (response?.success) {
        toast.success('Chapter deleted')
      }

      // Redirect user
      router.push(`/teacher/courses/${courseId}`)
    } catch (error) {
      console.error('ONDELETE ERROR', error)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className='flex items-center gap-x-2'>
      <Button
        onClick={onPublish}
        disabled={!disabled || isLoading}
        variant='outline'
        size='sm'
      >
        {isPublished ? 'Unpublished' : 'Publish'}
      </Button>
      <ConfirmModal
        onConfirm={onDelete}
        message='Are you sure you want to delete this capter?'
      >
        <Button size='sm' disabled={isLoading}>
          <Trash className='w-4 h-4' />
        </Button>
      </ConfirmModal>
    </div>
  )
}
