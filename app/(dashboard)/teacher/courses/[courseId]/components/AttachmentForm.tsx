'use client'
import * as z from 'zod'

import { File, Pencil } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { Attachment, Course } from '@/lib/generated/prisma/client'
import { createAttachment } from '@/lib/actions/attachment'

import { Button } from '@/components/ui/button'
import { FileUpload } from '@/components/file-upload'

interface AttachmentFormProps {
  initialData: Course & { attachments: Attachment[] }
  courseId: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formSchema = z.object({
  url: z.string().min(1),
})

// * COMPONENT FOR COURSE TITLE FORM
export function AttachmentForm({ initialData, courseId }: AttachmentFormProps) {
  // EDIT MODE
  const [isEditing, setIsEditing] = useState(false)
  // FORM

  // HANDLERS
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)
  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    const response = await createAttachment(formData, courseId)

    if (response?.success) {
      toast.success('Course image updated.')
      onToggleEdit()
    }
    if (response?.error) {
      toast.error('Something went wrong, please try again.')
    }
  }

  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Course attachments
        {/* BUTTON TO UPLOAD IMAGE */}
        <Button onClick={onToggleEdit} variant='ghost'>
          {isEditing ? (
            'Cancel'
          ) : (
            // Image already uploaded
            <>
              <Pencil className='w-4 h-4 mr-2' /> Add a file
            </>
          )}
        </Button>
      </div>

      {/* UPLOAD FILE  */}
      {!isEditing ? (
        <>
          {initialData.attachments.length === 0 ? (
            <p className='mt-2 text-sm italic text-slate-500'>No attachments</p>
          ) : (
            <div className='space-y-2'>
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className='flex items-center w-full p-3 border rounded-md bg-sky-100 border-sky-200 text-sky-700'
                >
                  <File className='w-4 h-4 mr-2 shrink-0' />
                  <p className='text-xs line-clamp-1'>{attachment.name}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          {/* Custom component that returns the uploadzode component */}
          <FileUpload
            endpoint='courseAttachmentUploader'
            onChange={(url) => {
              if (url) {
                onSubmit({ url })
              }
            }}
          />
          <div className='mt-4 text-xs text-muted-foreground'>
            Add anything your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  )
}
