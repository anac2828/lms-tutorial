'use client'

import { EditorPreview } from '@/components/EditorPreview'

import { Descendant } from 'slate'

function deserialize(value: string | null): Descendant[] {
  if (!value) {
    return [{ type: 'paragraph', children: [{ text: '' }] }]
  }
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.length > 0) return parsed
  } catch {
    // not JSON — fall through to plain-text wrapping
  }
  // Plain text: split on newlines so paragraphs are preserved
  return value.split('\n').map((line) => ({
    type: 'paragraph',
    children: [{ text: line }],
  }))
}

type Props = {
  value: string | null
}
export function ChapterEditorPreview({ value }: Props) {
  return (
    <div>
      <EditorPreview value={deserialize(value)} />
    </div>
  )
}
