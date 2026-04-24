// ---------------------------------------------------------------------------
// Preview Component (Read-only)

import { AlignType, CustomElement } from '@/lib/custom-types'
import { useMemo } from 'react'
import { Descendant, Text } from 'slate'
import { isAlignElement, toSlateValue } from './editor'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
interface EditorPreviewProps {
  value: Descendant[] | string
  className?: string
}

export function EditorPreview({ value, className = '' }: EditorPreviewProps) {
  const content = useMemo(() => toSlateValue(value), [value])

  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      {content.map((node, index) => (
        <SlateNode key={index} element={node as CustomElement} isPreview />
      ))}
    </div>
  )
}

// Recursive renderer for preview
function SlateNode({
  element,
}: {
  element: CustomElement
  isPreview?: boolean
}) {
  const style: React.CSSProperties = {}

  if (isAlignElement(element)) {
    style.textAlign = element.align as AlignType
  }

  const children = element.children.map((child, i) => {
    if (Text.isText(child)) {
      // ← This is now correct
      return <SlateLeaf key={i} leaf={child} />
    }
    return <SlateNode key={i} element={child as CustomElement} />
  })

  switch (element.type) {
    case 'heading-one':
      return (
        <h1
          style={style}
          className='mt-3 mb-1 text-2xl font-bold leading-tight'
        >
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2
          style={style}
          className='mt-2 mb-1 text-lg font-semibold leading-snug'
        >
          {children}
        </h2>
      )
    case 'block-quote':
      return (
        <blockquote
          style={style}
          className='pl-3 my-1 italic border-l-4 border-slate-300 text-slate-500'
        >
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul style={style} className='list-disc pl-5 my-1 space-y-0.5'>
          {children}
        </ul>
      )
    case 'numbered-list':
      return (
        <ol style={style} className='list-decimal pl-5 my-1 space-y-0.5'>
          {children}
        </ol>
      )
    case 'list-item':
      return <li style={style}>{children}</li>
    default:
      return (
        <p style={style} className='text-sm leading-relaxed'>
          {children}
        </p>
      )
  }
}

function SlateLeaf({ leaf }: { leaf: Text }) {
  let text = <span>{leaf.text}</span>

  if (leaf.bold) text = <strong className='font-semibold'>{text}</strong>
  if (leaf.italic) text = <em>{text}</em>
  if (leaf.underline) text = <u>{text}</u>
  if (leaf.code)
    text = (
      <code className='font-mono text-[0.85em] bg-slate-100 text-slate-700 px-1 py-0.5 rounded'>
        {text}
      </code>
    )

  return text
}
