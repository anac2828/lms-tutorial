import Image from 'next/image'

export function Logo() {
  return (
    <div className='flex gap-3'>
      <Image width={130} height={130} alt='logo' src='/logo.svg' />
    </div>
  )
}
