'use client'

import { UserButton } from '@clerk/nextjs'
import { usePathname } from 'next/navigation'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { SearchInput } from './SearchInput'

export function NavbarRoutes() {
  const pathname = usePathname()

  const isTeacherPage = pathname?.startsWith('/teacher')
  const isCoursePage = pathname?.includes('/courses')
  const isSearchPage = pathname === '/search'

  return (
    <>
      {isSearchPage && (
        <div className='hidden md:block'>
          <SearchInput />
        </div>
      )}
      <div className='flex ml-auto gap-x-2'>
        {isTeacherPage || isCoursePage ? (
          <Link href='/'>
            <Button size='sm' variant='ghost'>
              <LogOut />
              Exit
            </Button>
          </Link>
        ) : (
          <Link href='/teacher/courses'>
            <Button size='sm' variant='ghost'>
              Teacher mode
            </Button>
          </Link>
        )}
        <UserButton afterSwitchSessionUrl='/' />
      </div>
    </>
  )
}
