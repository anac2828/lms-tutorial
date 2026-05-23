import { Descendant } from 'slate'

// export function deserializeText(value: string | null | undefined) {
//   if (!value) {
//     return [{ type: 'paragraph', children: [{ text: '' }] }]
//   }
//   try {
//     const parsed = JSON.parse(value)
//     if (Array.isArray(parsed) && parsed.length > 0) return parsed
//     console.log('PARSE', parsed[0].children[0].text)
//   } catch {
//     // not JSON — fall through to plain-text wrapping
//   }
//   console.log('********VALUE***********', value)
//   // Plain text: split on newlines so paragraphs are preserved
//   return value.split('\n').map((line) => ({
//     type: 'paragraph',
//     children: [{ text: line }],
//   }))
// }

export function deserializeText(value: string | null | undefined) {
  if (!value) {
    return [{ type: 'paragraph', children: [{ text: '' }] }]
  }

  const parsed = JSON.parse(value)

  return parsed[0].children[0].text
}
