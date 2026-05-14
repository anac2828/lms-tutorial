import Image from 'next/image'
import Link from 'next/link'
import { IconBadge } from './icon-badge'
import { BookOpen } from 'lucide-react'
import { formatPrice } from '@/lib/format'

interface CourseCardProps {
  id: string
  title: string
  imageUrl: string
  chaptersLength: number
  price: number
  progress: number | null
  category: string
}

export function CourseCard({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
}: CourseCardProps) {
  return (
    <Link
      href={`/courses/${id}`}
      className='block h-full transition-opacity group-hover:opacity-80'
    >
      <div className='h-full p-3 overflow-hidden transition border rounded-lg group hover:shadow-sm'>
        <div className='relative overflow-hidden rounded-md w-fulll aspect-video'>
          <Image fill className='object-cover' alt={title} src={imageUrl} />
        </div>
        <div className='flex flex-col pt-2'>
          <div className='text-lg font-medium transition md:text-base group-hover:text-sky-700 line-clamp-2'>
            {title}
          </div>
          <p className='text-xs text-muted-foreground'>{category}</p>
          <div className='flex items-center my-3 text-sm gap-x-2 md:text-xs'>
            <div className='flex items-center gap-x-1 text-slate-500'>
              <IconBadge size='sm' icon={BookOpen} />
              <span>
                {chaptersLength} {chaptersLength === 1 ? 'Chapter' : 'Chapters'}
              </span>
            </div>
          </div>
          {progress !== null ? (
            <div>TODO: Progress component</div>
          ) : (
            <p className='font-medium text-md md:text-sm text-slate-700'>
              {formatPrice(price)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
