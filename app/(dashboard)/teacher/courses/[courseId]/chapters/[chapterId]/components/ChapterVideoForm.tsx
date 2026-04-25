'use client'
import * as z from 'zod'

import { Pencil, PlusCircle, Video } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { Chapter, MuxData } from '@/lib/generated/prisma/client'
import { updateChapter } from '@/lib/actions/chapter'

import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/file-upload'

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null }
  courseId: string
  chapterId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  videoUrl: z.string().min(1),
})

// * COMPONENT FOR COURSE TITLE FORM
export function ChapterVideoForm({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) {
  // EDIT MODE
  const [isEditing, setIsEditing] = useState(false)
  // FORM

  // HANDLERS
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)
  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      const response = await updateChapter(formData, courseId, chapterId)
      if (response?.success) {
        toast.success('Course image updated.')
        onToggleEdit()
      }
      if (response?.error) {
        toast.error('Something went wrong, please try again.')
      }
    } catch (error) {
      // Other error from the try block
      console.error('UPDATE FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course video
        {/* BUTTON TO UPLOAD IMAGE */}
        <Button onClick={onToggleEdit} variant='ghost'>
          {!isEditing && !initialData.videoUrl ? (
            // No image uploaded
            <>
              <PlusCircle className='w-4 h-4 mr-2' /> Add a video
            </>
          ) : isEditing ? (
            'Cancel'
          ) : (
            // Image already uploaded
            <>
              <Pencil className='w-4 h-4 mr-2' /> Edit video
            </>
          )}
        </Button>
      </div>

      {/* UPLOAD IMAGE  */}
      {!isEditing && !initialData.videoUrl ? (
        <div className='flex items-center justify-center rounded-md h-60 bg-slate-200'>
          <Video className='w-10 h-10 text-slate-500' />
        </div>
      ) : isEditing ? (
        // Show form to upload image
        //See app/api/uploadthing/core.ts for endpoint name
        <div>
          {/* Custom component that returns the uploadzode compnent */}
          <FileUpload
            endpoint='chapterVideoUploader'
            onChange={(url) => {
              if (url) {
                onSubmit({ videoUrl: url })
              }
            }}
          />
          <div className='mt-4 text-xs text-muted-foreground'>
            Upload this chapter&apos;s video
          </div>
        </div>
      ) : (
        // Show uploaded video
        <div className='relative mt-2 aspect-video'>Video uploaded</div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className='text-xs text-muted-foreground mt'>
          Videos can take a few minutes to process. Refresh the page if video
          does not appear.
        </div>
      )}
    </div>
  )
}
