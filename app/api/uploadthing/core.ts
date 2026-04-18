import { auth } from '@clerk/nextjs/server'
import { createUploadthing, type FileRouter } from 'uploadthing/next'

const f = createUploadthing()
const handleAuth = async () => {
  const { userId } = await auth()

  if (!userId) throw new Error('Unauthorized')
  return { userId }
}

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // endpoint name is the key, you will use this in the frontend
  courseImageUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  }) // Set permissions and file types for this FileRoute
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  courseAttachmentUploader: f(['text', 'image', 'video', 'audio', 'pdf'])
    .middleware(() => handleAuth())
    .onUploadComplete((data) => {
      console.log(data)
    }),
  chapterVideoUploader: f({ video: { maxFileCount: 1, maxFileSize: '512GB' } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
