'use client'

import { cn } from '@/lib/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IconType } from 'react-icons/lib'
import qs from 'query-string'

interface CategoryItemProps {
  label: string
  value?: string // categoryId
  icon?: IconType
}

export function CategoryItem({ label, value, icon: Icon }: CategoryItemProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategoryId = searchParams.get('categoryId')
  const currentTitle = searchParams.get('title')

  const isSelected = currentCategoryId === value

  const onClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname, // '/search'
        query: { title: currentTitle, categoryId: isSelected ? null : value }, //"/search?categoryId=62aea8e3-5ec2-4a0c-b089-4525756a6355"
      },
      { skipNull: true, skipEmptyString: true },
    )
    router.push(url)
  }

  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        'py-2 px-3 text-sm border border-slate-200 rounded-full flex items-center gap-x-1 hover:border-sky-700 transition',
        isSelected && 'border-sky-700 bg-sky-200/20 text-sky-800',
      )}
    >
      {Icon && <Icon size={20} />}
      <div className='truncate'>{label}</div>
    </button>
  )
}
