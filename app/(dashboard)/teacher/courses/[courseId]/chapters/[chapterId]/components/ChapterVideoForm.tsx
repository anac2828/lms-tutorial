'use client'
import * as z from 'zod'
import { Loader2, Pencil, PlusCircle, Video } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import MuxPlayer from '@mux/mux-player-react'
import { Chapter, MuxData } from '@/lib/generated/prisma/client'
import { updateChapter } from '@/lib/actions/chapter'
import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/file-upload'

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null }
  courseId: string
  chapterId: string
}

const formSchema = z.object({
  videoUrl: z.string().min(1),
})

export function ChapterVideoForm({
  initialData,
  courseId,
  chapterId,
}: ChapterVideoFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(true)

  const onToggleEdit = () => setIsEditing((prev) => !prev)

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    try {
      const response = await updateChapter(formData, courseId, chapterId)
      if (response?.success) {
        toast.success('Video updated successfully.')
        onToggleEdit()
        setIsVideoLoading(true) // Reset for new video
      }
      if (response?.error) {
        toast.error('Something went wrong, please try again.')
      }
    } catch (error) {
      console.error('UPDATE FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const isVideoReady = !!initialData.muxData?.playbackId

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course video
        <Button onClick={onToggleEdit} variant='ghost'>
          {!isEditing && !initialData.videoUrl ? (
            <>
              <PlusCircle className='w-4 h-4 mr-2' /> Add a video
            </>
          ) : isEditing ? (
            'Cancel'
          ) : (
            <>
              <Pencil className='w-4 h-4 mr-2' /> Edit video
            </>
          )}
        </Button>
      </div>

      {/* No video placeholder */}
      {!isEditing && !initialData.videoUrl && (
        <div className='flex items-center justify-center rounded-md h-60 bg-slate-200'>
          <Video className='w-10 h-10 text-slate-500' />
        </div>
      )}

      {/* Upload mode */}
      {isEditing && (
        <div>
          <FileUpload
            endpoint='chapterVideoUploader'
            onChange={(url) => {
              if (url) onSubmit({ videoUrl: url })
            }}
          />
          <div className='mt-4 text-xs text-muted-foreground'>
            Upload this chapter&apos;s video
          </div>
        </div>
      )}

      {/* Video Player Section */}
      {initialData.videoUrl && !isEditing && (
        <div className='relative mt-2 overflow-hidden bg-black rounded-md aspect-video'>
          {/* Still Processing on Mux */}
          {!initialData.muxData?.playbackId ? (
            <div className='absolute inset-0 z-20 flex flex-col items-center justify-center text-white bg-slate-950'>
              <Loader2 className='w-10 h-10 mb-3 animate-spin' />
              <p className='text-lg font-medium'>Video is being processed</p>
              <p className='max-w-xs mt-1 text-sm text-center text-slate-400'>
                This usually takes 1–3 minutes.
                <br />
                Please refresh the page shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Video is ready - show player with loading overlay */}
              {isVideoLoading && (
                <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/70'>
                  <div className='flex flex-col items-center gap-3'>
                    <Loader2 className='w-10 h-10 text-white animate-spin' />
                    <p className='text-sm text-white'>Loading video...</p>
                  </div>
                </div>
              )}

              <MuxPlayer
                playbackId={initialData.muxData.playbackId}
                onLoadedData={() => setIsVideoLoading(false)}
                onError={(err) => {
                  console.error('Mux Player Error:', err)
                  // You can optionally set an error state here
                }}
                preload='metadata'
                className='w-full h-full'
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
