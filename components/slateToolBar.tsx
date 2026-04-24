import { cn } from '@/lib/utils'
import React, { PropsWithChildren, ReactNode, Ref } from 'react'
import ReactDOM from 'react-dom'

interface BaseProps {
  className: string
  [key: string]: unknown
}

type ButtonProps = PropsWithChildren<
  {
    active: boolean
    reversed: boolean
  } & BaseProps
>

type BasePropsWithChildren = PropsWithChildren<BaseProps>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ active, reversed, ...props }, ref) {
    return (
      <button
        {...props}
        ref={ref}
        className={cn(
          `border-0 p-0 cursor-pointer bg-transparent`,
          reversed
            ? active
              ? 'text-white'
              : 'text-gray-400'
            : active
              ? 'text-black'
              : 'text-gray-300',
        )}
      />
    )
  },
)

Button.displayName = 'Button'

export const Icon = React.forwardRef<HTMLSpanElement, BasePropsWithChildren>(
  function Icon({ children, ...props }: { children?: ReactNode }, ref) {
    return (
      <span
        {...props}
        ref={ref}
        className={cn('material-icons', 'text-[18px] align-text-bottom')}
      >
        {children}
      </span>
    )
  },
)

export const Instruction = React.forwardRef<
  HTMLDivElement,
  BasePropsWithChildren
>(function Instruction({ ...props }, ref) {
  return (
    <div
      {...props}
      ref={ref}
      className='-mx-5 white-space-pre-wrap mb-2.5 py-2.5 px-5 text-sm bg-[#f8f8e8]'
    />
  )
})

export const Menu = React.forwardRef<HTMLDivElement, BasePropsWithChildren>(
  function Menu({ ...props }, ref) {
    return (
      <div
        {...props}
        data-test-id='menu'
        ref={ref}
        className='*:inline-block [&>*+*]:ml-3.75'
      />
    )
  },
)

export const Portal = ({ children }: { children?: ReactNode }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}

export const Toolbar = React.forwardRef<HTMLDivElement, BasePropsWithChildren>(
  function Toolbar({ ...props }, ref) {
    return (
      <Menu
        {...props}
        ref={ref}
        className='relative px-4.5 pt-px pb-4.25 -mx-5 border-b-2 border-[#eee] mb-5'
      />
    )
  },
)

Toolbar.displayName = 'Toolbar'
