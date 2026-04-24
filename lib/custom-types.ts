// @/lib/custom-types.ts
import { BaseElement, Descendant } from 'slate'

export type CustomElementType =
  | 'paragraph'
  | 'heading-one'
  | 'heading-two'
  | 'block-quote'
  | 'bulleted-list'
  | 'numbered-list'
  | 'list-item'

// Alignment
export type AlignType = 'left' | 'center' | 'right' | 'justify'

// ─────────────────────────────────────────────────────────────
// Base interface that includes align for ALL normal elements
// ─────────────────────────────────────────────────────────────
export interface BaseCustomElement extends BaseElement {
  type: CustomElementType
  children: Descendant[]
  align?: AlignType // ← This is the key fix
}

// ─────────────────────────────────────────────────────────────
// If you have special elements (like checklist), define them separately
// ─────────────────────────────────────────────────────────────
export interface CheckListItemElement extends BaseElement {
  type: 'check-list-item'
  checked: boolean
  children: Descendant[]
  align?: AlignType // ← Also add align here
}

// ─────────────────────────────────────────────────────────────
// Main union type
// ─────────────────────────────────────────────────────────────
export type CustomElement = BaseCustomElement | CheckListItemElement

// Helper for type narrowing
export type CustomElementWithAlign = Extract<
  CustomElement,
  { align?: AlignType }
>

// Slate module augmentation (highly recommended)
declare module 'slate' {
  interface CustomTypes {
    Element: CustomElement
    Text: {
      text: string
      bold?: boolean
      italic?: boolean
      underline?: boolean
      code?: boolean
    }
  }
}
