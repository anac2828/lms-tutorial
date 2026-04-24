'use client'
import * as z from 'zod'

import { File, Loader2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

import { Attachment, Course } from '@/lib/generated/prisma/client'
import { createAttachment, deleteAttachment } from '@/lib/actions/attachment'

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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  // FORM

  // HANDLERS
  // Edit state
  const onToggleEdit = () => setIsEditing((isEditing) => !isEditing)
  // Submit form
  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    if (!formData) return
    try {
      const response = await createAttachment(formData, courseId)

      if (response?.success) {
        toast.success('Course image updated.')
        onToggleEdit()
      } else {
        toast.error(
          response?.error || 'Something went wrong, please try again.',
        )
      }
    } catch (error) {
      // Other error from the try block
      console.error('UPDATE FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }
  // Delete attachment
  const onDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await deleteAttachment(courseId, id)
      toast.success('Attachment deleted')
    } catch (error) {
      console.error('DELETE ATTACHMENT ERRO', error)
      toast.error('Something went wrong')
    } finally {
      setDeletingId(null)
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
            // List of attachments
            <div className='space-y-2'>
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className='flex items-center w-full p-3 border rounded-md bg-sky-100 border-sky-200 text-sky-700 gap-0.5'
                >
                  {/* File icon*/}
                  <File className='w-4 h-4 mr-2 shrink-0' />
                  {/* File name */}
                  <p className='text-xs line-clamp-1'>{attachment.name}</p>
                  {/* Delete attachement */}
                  {deletingId !== attachment.id && (
                    <button
                      className='ml-auto transition hover:opacity-75'
                      onClick={() => onDelete(attachment.id)}
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                  {deletingId === attachment.id && (
                    <div>
                      <Loader2 className='w-4 h-4 animate-spin' />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // Upload window
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
