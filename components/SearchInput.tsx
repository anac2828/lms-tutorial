'use client'
import qs from 'query-string'
import { Search } from 'lucide-react'
import { Input } from './ui/input'
import { useEffect, useState } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { title } from 'process'

export function SearchInput() {
  // value = user input value
  const [value, setValue] = useState('')
  const debounedValue = useDebounce(value)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentCategoryId = searchParams.get('categoryId')

  // adds the title to the pathname after a dealy
  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          categoryId: currentCategoryId,
          title: debounedValue,
        },
      },
      { skipEmptyString: true, skipNull: true },
    )
    router.push(url)
  }, [debounedValue, currentCategoryId, router, pathname])

  return (
    <div className='relative'>
      {/* Icon */}
      <Search className='absolute w-4 h-4 top-2 left-3 text-slate-600' />
      <Input
        onChange={(e) => setValue(e.target.value)}
        value={value}
        placeholder='Search for course'
        className='w-full rounded-full md:w-75 pl-9 bg-slate-100 focus-visible:ring-slate-200'
      />
    </div>
  )
}
