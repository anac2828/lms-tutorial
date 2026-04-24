/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { forwardRef, useMemo, useCallback, useEffect } from 'react'
import {
  Slate,
  Editable,
  useSlate,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react'
import { Descendant, Editor, Transforms, Element as SlateElement } from 'slate'
import {
  Bold,
  Italic,
  Underline,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignRight,
  AlignCenter,
  AlignJustify,
  Quote,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomElement, CustomElementWithAlign } from '@/lib/custom-types'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EMPTY_VALUE: Descendant[] = [
  { type: 'paragraph' as const, children: [{ text: '' }] },
]

type MarkFormat = 'bold' | 'italic' | 'underline' | 'code'
type BlockFormat =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'block-quote'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'
const LIST_TYPES: BlockFormat[] = ['bulleted-list', 'numbered-list']
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const

type AlignType = (typeof TEXT_ALIGN_TYPES)[number]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function toSlateValue(
  value: Descendant[] | string | null | undefined,
): Descendant[] {
  if (!value) return EMPTY_VALUE

  if (Array.isArray(value)) return value.length > 0 ? value : EMPTY_VALUE

  try {
    const parsed = JSON.parse(value as string)
    if (Array.isArray(parsed) && parsed.length > 0)
      return parsed as Descendant[]
  } catch {
    /* not JSON */
  }
  return (value as string)
    .trim()
    .split('\n')
    .map((line) => ({
      type: 'paragraph' as const,
      children: [{ text: line }] as Descendant[],
    }))
}

// function isAlignType(format: BlockFormat[]): format is AlignType {
//   return TEXT_ALIGN_TYPES.includes(format as AlignType)
// }

export const isAlignElement = (
  element: CustomElement,
): element is CustomElementWithAlign => {
  return 'align' in element && element.align !== undefined
}

// const isAlignType = (format: CustomElementFormat): format is AlignType => {
//   return TEXT_ALIGN_TYPES.includes(format as AlignType)
// }

// Mark helpers (bold, italic, etc.)
function isMarkActive(editor: Editor, format: MarkFormat) {
  const marks = Editor.marks(editor) as Record<string, boolean> | null
  return marks ? marks[format] === true : false
}
function toggleMark(editor: Editor, format: MarkFormat) {
  if (isMarkActive(editor, format)) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

// Block helpers (headings, lists, etc.)
function isBlockActive(editor: Editor, format: BlockFormat) {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      (n as CustomElement).type === format,
  })
  return !!match
}

const isAlignActive = (editor: Editor, align: AlignType): boolean => {
  const [match] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      isAlignElement(n) &&
      n.align === align,
    mode: 'highest',
  })
  return !!match
}

function toggleBlock(editor: Editor, format: BlockFormat | AlignType) {
  const isList = LIST_TYPES.includes(format as BlockFormat)
  const isAlignment = TEXT_ALIGN_TYPES.includes(format as AlignType)

  if (isAlignment) {
    const align = format as AlignType

    Transforms.setNodes(
      editor,
      { align },
      {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          !LIST_TYPES.includes((n as CustomElement).type as any),
        mode: 'highest',
      },
    )
    return
  }

  // Handle structural blocks (headings, lists, quote)
  const isActive = isBlockActive(editor, format as BlockFormat)

  // Unwrap any existing list wrappers first
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes((n as CustomElement).type as any),
    split: true,
  })

  // Set new type
  Transforms.setNodes(editor, {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  } as Partial<SlateElement>)

  // Wrap lists
  if (!isActive && isList) {
    Transforms.wrapNodes(editor, {
      type: format,
      children: [],
    } as any)
  }
}

// ---------------------------------------------------------------------------
// Toolbar button
// ---------------------------------------------------------------------------
function ToolbarButton({
  active,
  onMouseDown,
  children,
  title,
}: {
  active: boolean
  onMouseDown: (e: React.MouseEvent) => void
  children: React.ReactNode
  title: string
}) {
  return (
    <button
      type='button'
      title={title}
      onMouseDown={onMouseDown}
      className={cn(
        'p-1.5 rounded transition-colors duration-100',
        'hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
        active
          ? 'text-slate-900 bg-slate-100'
          : 'text-slate-400 hover:text-slate-700',
      )}
    >
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Toolbar (must be inside <Slate> context to use useSlate)
// ---------------------------------------------------------------------------
function Toolbar() {
  const editor = useSlate()

  const markButton = (
    format: MarkFormat,
    Icon: React.ElementType,
    title: string,
  ) => (
    <ToolbarButton
      title={title}
      active={isMarkActive(editor, format)}
      onMouseDown={(e) => {
        e.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon className='w-4 h-4' />
    </ToolbarButton>
  )

  const blockButton = (
    format: BlockFormat | AlignType,
    Icon: React.ElementType,
    title: string,
    isActiveCheck: () => boolean = () =>
      isBlockActive(editor, format as BlockFormat),
  ) => (
    <ToolbarButton
      title={title}
      active={isActiveCheck()}
      onMouseDown={(e) => {
        e.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon className='w-4 h-4' />
    </ToolbarButton>
  )

  return (
    <div className='flex items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 bg-slate-50 rounded-t-md flex-wrap'>
      {/* Marks */}
      {markButton('bold', Bold, 'Bold (⌘B)')}
      {markButton('italic', Italic, 'Italic (⌘I)')}
      {markButton('underline', Underline, 'Underline (⌘U)')}
      {markButton('code', Code, 'Inline code')}

      {/* Divider */}
      <span className='w-px h-5 mx-1 bg-slate-200' />

      {/* Blocks */}
      {blockButton('heading-one', Heading1, 'Heading 1')}
      {blockButton('heading-two', Heading2, 'Heading 2')}
      {blockButton('block-quote', Quote, 'Block quote')}

      {/* Divider */}
      <span className='w-px h-5 mx-1 bg-slate-200' />

      {/* Lists */}
      {blockButton('bulleted-list', List, 'Bulleted list')}
      {blockButton('numbered-list', ListOrdered, 'Numbered list')}

      {/* Divider */}
      <span className='w-px h-5 mx-1 bg-slate-200' />
      {/* Alignment */}
      {blockButton('left', AlignLeft, 'Align left', () =>
        isAlignActive(editor, 'left'),
      )}
      {blockButton('center', AlignCenter, 'Align center', () =>
        isAlignActive(editor, 'center'),
      )}
      {blockButton('right', AlignRight, 'Align right', () =>
        isAlignActive(editor, 'right'),
      )}
      {blockButton('justify', AlignJustify, 'Align justify', () =>
        isAlignActive(editor, 'justify'),
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Renderers
// ---------------------------------------------------------------------------
function renderElement({ attributes, children, element }: RenderElementProps) {
  const style: React.CSSProperties = {}

  if (isAlignElement(element)) {
    style.textAlign = element.align as AlignType
  }

  switch ((element as CustomElement).type) {
    case 'heading-one':
      return (
        <h1
          {...attributes}
          style={style}
          className='mt-3 mb-1 text-2xl font-bold leading-tight'
        >
          {children}
        </h1>
      )

    case 'heading-two':
      return (
        <h2
          {...attributes}
          style={style}
          className='mt-2 mb-1 text-lg font-semibold leading-snug'
        >
          {children}
        </h2>
      )

    case 'block-quote':
      return (
        <blockquote
          {...attributes}
          style={style}
          className='pl-3 my-1 italic border-l-4 border-slate-300 text-slate-500'
        >
          {children}
        </blockquote>
      )

    case 'bulleted-list':
      return (
        <ul {...attributes} className='list-disc pl-5 my-1 space-y-0.5'>
          {children}
        </ul>
      )

    case 'numbered-list':
      return (
        <ol {...attributes} className='list-decimal pl-5 my-1 space-y-0.5'>
          {children}
        </ol>
      )

    case 'list-item':
      // Important: Do NOT wrap list-item children in <p>
      return (
        <li {...attributes} className='text-sm'>
          {children}
        </li>
      )

    default:
      // Paragraph (default)
      return (
        <p {...attributes} style={style} className='text-sm leading-relaxed'>
          {children}
        </p>
      )
  }
}

function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  if ((leaf as any).bold)
    children = <strong className='font-semibold'>{children}</strong>
  if ((leaf as any).italic) children = <em>{children}</em>
  if ((leaf as any).underline) children = <u>{children}</u>
  if ((leaf as any).code)
    children = (
      <code className='font-mono text-[0.85em] bg-slate-100 text-slate-700 px-1 py-0.5 rounded'>
        {children}
      </code>
    )
  return <span {...attributes}>{children}</span>
}

// ---------------------------------------------------------------------------
// Props & component
// ---------------------------------------------------------------------------
interface EditorSlateProps {
  editor: Editor
  value: Descendant[] | string
  onChange: (value: Descendant[]) => void
  name?: string
  placeholder?: string
}

const EditorSlate = forwardRef<HTMLDivElement, EditorSlateProps>(
  (
    { editor, value, onChange, name, placeholder = 'Enter a description…' },
    ref,
  ) => {
    const initialValue = useMemo(() => toSlateValue(value), [value])

    // Sync external resets (e.g. cancel) back into the editor
    // Sync external value changes (e.g. form reset)
    // Sync external value changes (e.g. form reset, cancel, new value from parent)
    useEffect(() => {
      const incoming = toSlateValue(value)
      const current = editor.children

      // Simple comparison
      if (JSON.stringify(incoming) !== JSON.stringify(current)) {
        // Proper way to update Slate editor value
        Transforms.removeNodes(editor, {
          at: [0], // remove everything
        })

        Transforms.insertNodes(editor, incoming, {
          at: [0],
        })

        // Optional: move cursor to start
        Transforms.select(editor, Editor.start(editor, []))
      }
    }, [value, editor])

    // const incomingKey = Array.isArray(value)
    //   ? JSON.stringify(value)
    //   : (value ?? '')
    // const editorKey = JSON.stringify(editor.children)
    // if (incomingKey !== editorKey && incomingKey !== '') {
    //   editor.children = toSlateValue(value)
    //   editor.onChange()
    // }

    // Keyboard shortcuts
    const onKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        const mod = e.metaKey || e.ctrlKey

        if (!mod) return

        if (e.key === 'b') {
          e.preventDefault()
          toggleMark(editor, 'bold')
        }
        if (e.key === 'i') {
          e.preventDefault()
          toggleMark(editor, 'italic')
        }
        if (e.key === 'u') {
          e.preventDefault()
          toggleMark(editor, 'underline')
        }
        if (e.key === '`') {
          e.preventDefault()
          toggleMark(editor, 'code')
        }
      },
      [editor],
    )

    return (
      <Slate editor={editor} initialValue={initialValue} onChange={onChange}>
        <div
          ref={ref}
          className='overflow-hidden bg-white border rounded-md border-slate-200 focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent'
        >
          <Toolbar />
          <Editable
            name={name}
            placeholder={placeholder}
            onKeyDown={onKeyDown}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            className='p-3 text-sm leading-relaxed outline-none min-h-35'
          />
        </div>
      </Slate>
    )
  },
)

EditorSlate.displayName = 'EditorSlate'

export default EditorSlate
