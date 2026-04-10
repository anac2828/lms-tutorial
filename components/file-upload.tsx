'use client'

import { toast } from 'sonner'
import { UploadDropzone } from '@/lib/uploadthing'
import { OurFileRouter } from '@/app/api/uploadthing/core'

interface FileUploadProps {
  onChange: (url?: string) => void
  endpoint: keyof OurFileRouter
}

export const FileUpload = ({ onChange, endpoint }: FileUploadProps) => {
  return (
    //   Uploadthing component
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        //   URL from uploadthing response to save in database
        onChange(res?.[0].ufsUrl)
      }}
      onUploadError={(error: Error) => {
        toast.error(`${error?.message}`)
      }}
      className='p-2 ut-label:text-lg ut-upload-icon:h-10 ut-upload-icon:w-10 ut-upload-icon:text-slate-500 ut-button:bg-slate-300 ut-button:w-50 ut-button:text-slate-500'
      content={{ label: 'Click or drag files to upload' }}
    />
  )
}
