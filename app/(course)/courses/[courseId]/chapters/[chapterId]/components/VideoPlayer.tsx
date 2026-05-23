'use client'
import MuxPlayer from '@mux/mux-player-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useConfettiStore } from '@/hooks/use-confetti-store'

interface VideoPlayerProps {
  playbackId?: string
  courseId: string
  chapterId: string
  nextChapterId?: string
  isLocked: boolean
  completeOnEnd: boolean
  title: string
}

export function VideoPlayer({
  playbackId,
  courseId,
  chapterId,
  isLocked,
  completeOnEnd,
  title,
}: VideoPlayerProps) {
  const [isReady, setIsReady] = useState(false)
  return (
    <div className='relative aspect-video'>
      {!isReady && !isLocked && (
        <div className='absolute inset-0 flex items-center justify-center bg-slate-800'>
          <Loader2 className='w-8 h-8 animate-spin text-secondary' />
        </div>
      )}

      {isLocked && (
        <div className='absolute inset-0 flex flex-col items-center justify-center bg-slate-800 gap-y-2 text-secondary'>
          <Lock className='w-8 h-8' />
          <p className='text-sm'>This chapter is locked</p>
        </div>
      )}
      {!isLocked && (
        <MuxPlayer
          title={title}
          onCanPlay={() => setIsReady(true)}
          onEnded={() => {}}
          className={cn(!isReady && 'hidden')}
          playbackId={playbackId}
        />
      )}
    </div>
  )
}
