'use client'

import { UserButton } from '@clerk/nextjs'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'
import Link from 'next/link'

export function NavbarRoutes() {
  const pathname = usePathname()

  const isTeacherPage = pathname?.startsWith('/teacher')
  const isPlayerPage = pathname?.includes('/chapter')
  return (
    <div className='flex ml-auto gap-x-2'>
      {isTeacherPage || isPlayerPage ? (
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
  )
}
