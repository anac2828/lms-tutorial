'use client'
import * as z from 'zod'

import { ImageIcon, Pencil, PlusCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'
import Image from 'next/image'

import { Course } from '@/lib/generated/prisma/client'
import { updateCourse } from '@/lib/actions/course'

import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/file-upload'

interface ImageFormProps {
  initialData: Course
  courseId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  imageUrl: z.string().min(1, { message: 'Course image is required' }),
  courseId: z.string(),
})

// * COMPONENT FOR COURSE TITLE FORM
export function ImageForm({ initialData, courseId }: ImageFormProps) {
  // EDIT MODE
  const [isEditing, setIsEditing] = useState(false)
  // FORM

  // HANDLERS
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updateCourse(null, values)

    toast.success('Course image updated')
    onToggleEdit()
  }

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course image
        {/* BUTTON TO UPLOAD IMAGE */}
        <Button onClick={onToggleEdit} variant='ghost'>
          {!isEditing && !initialData.imageUrl ? (
            // No image uploaded
            <>
              <PlusCircle className='w-4 h-4 mr-2' /> Add an image
            </>
          ) : isEditing ? (
            'Cancel'
          ) : (
            // Image already uploaded
            <>
              <Pencil className='w-4 h-4 mr-2' /> Edit image
            </>
          )}
        </Button>
      </div>

      {/* UPLOAD IMAGE  */}
      {!isEditing && !initialData.imageUrl ? (
        // No image uploaded
        <div className='flex items-center justify-center rounded-md h-60 bg-slate-200'>
          <ImageIcon className='w-10 h-10 text-slate-500' />
        </div>
      ) : isEditing ? (
        // Show form to upload image
        //See app/api/uploadthing/core.ts for endpoint name
        <div>
          {/* Custom component that returns the uploadzode compnent */}
          <FileUpload
            endpoint='courseImageUploader'
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url, courseId })
              }
            }}
          />
          <div className='mt-4 text-xs text-muted-foreground'>
            16:9 aspect ratio recommended. Max file size: 4MB.
          </div>
        </div>
      ) : (
        // Show uploaded image
        <div className='relative mt-2 aspect-video'>
          <Image
            alt='Upload'
            fill
            className='object-cover rounded-md'
            src={initialData.imageUrl || ''}
          />
        </div>
      )}
    </div>
  )
}
