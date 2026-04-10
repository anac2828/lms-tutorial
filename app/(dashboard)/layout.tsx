import { Navbar } from './components/navbar'
import { Sidebar } from './components/sidebar'

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='h-full'>
      <div className='fixed inset-y-0 z-50 w-full h-20 md:pl-56'>
        <Navbar />
      </div>
      <div className='fixed inset-y-0 z-50 flex-col hidden w-56 h-full md:flex bg-amber-200'>
        <Sidebar />
      </div>
      <main className='h-full pt-20 md:pl-56'>{children}</main>
    </div>
  )
}

export default DashboardLayout
