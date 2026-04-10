import { NavbarRoutes } from '@/components/navbar-routes'
import { MobileSidebar } from './mobile-sidebar'

export function Navbar() {
  return (
    <div className='flex items-center h-full p-4 bg-white border-b shadow-sm'>
      <MobileSidebar />
      {/* User logo */}
      <NavbarRoutes />
    </div>
  )
}
