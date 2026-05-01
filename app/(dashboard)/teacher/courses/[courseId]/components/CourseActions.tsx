'use client'

import { ConfirmModal } from '@/components/confirm-modal'
import { Button } from '@/components/ui/button'
import { useConfettiStore } from '@/hooks/use-confetti-store'

import {
  deleteCourse,
  publishCourse,
  unpublishCourse,
} from '@/lib/actions/course'
import { Trash } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface CourseActionsProps {
  disabled: boolean
  courseId: string
  isPublished: boolean
}

export function CourseActions({
  disabled,
  courseId,
  isPublished,
}: CourseActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const confetti = useConfettiStore()
  const router = useRouter()

  const onPublish = async () => {
    try {
      setIsLoading(true)

      // Publish chapter
      if (!isPublished) {
        const response = await publishCourse(courseId)

        if (response?.success) {
          toast.success(`Course published`)
          confetti.onOpen()
        }
      }

      // Unpublish chapter
      if (isPublished) {
        const response = await unpublishCourse(courseId)

        if (response?.success) toast.success(`Course unpublished`)
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

      const response = await deleteCourse(courseId)

      if (response?.success) {
        toast.success('Course deleted')
      }

      router.push(`/teacher/courses`)

      // Redirect user
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
        variant={isPublished ? 'destructive' : 'success'}
        size='sm'
      >
        {isPublished ? 'Unpublished' : 'Publish'}
      </Button>
      <ConfirmModal
        onConfirm={onDelete}
        message='Are you sure you want to delete this course?'
      >
        <Button size='sm' disabled={isLoading}>
          <Trash className='w-4 h-4' />
        </Button>
      </ConfirmModal>
    </div>
  )
}
