import {
  CustomEditor,
  CustomElement,
  CustomElementType,
  CustomElementWithAlign,
} from '@/lib/custom-types'
import { useSlate } from 'slate-react'
import { Button } from './SlateToolBar'
import { Editor } from 'slate'

const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'] as const

type AlignType = (typeof TEXT_ALIGN_TYPES)[number]
type ListType = (typeof LIST_TYPES)[number]
type CustomElementFormat = CustomElementType | AlignType | ListType

interface BlockButtonProps {
  format: CustomElementFormat
  icon: string
}

const isAlignElement = (
  element: CustomElement,
): element is CustomElementWithAlign => {
  return 'align' in element
}

const isBlockActive = (
  editor: CustomEditor,
  format: CustomElementFormat,
  blockType: 'type' | 'align' = 'type',
) => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        if (Node.isElement(n)) {
          if (blockType === 'align' && isAlignElement(n)) {
            return n.align === format
          }
          return n.type === format
        }
        return false
      },
    }),
  )

  return !!match
}

export const BlockButton = ({ format, icon }: BlockButtonProps) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        isAlignType(format) ? 'align' : 'type',
      )}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
      onClick={() => toggleBlock(editor, format)}
      data-test-id={`block-button-${format}`}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}
