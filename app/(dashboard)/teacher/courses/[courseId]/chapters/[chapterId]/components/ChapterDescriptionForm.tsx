'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Controller } from 'react-hook-form'
import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { Chapter } from '@/lib/generated/prisma/client'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import { updateChapter } from '@/lib/actions/chapter'
import EditorSlate from '@/components/editor'

// Slate imports — make sure these are installed:
import { Descendant, createEditor, Editor } from 'slate'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { EditorPreview } from '@/components/EditorPreview'

import { CustomElement } from '@/lib/custom-types'

interface ChapterDescriptionFormProps {
  initialData: Chapter
  courseId: string
  chapterId: string
}

// ---------------------------------------------------------------------------
// Helpers: convert between plain string (stored in DB) and Slate's Descendant[]
// ---------------------------------------------------------------------------

/**
 * Parse a stored value into Slate nodes.
 * - If it's already a valid JSON array of Descendant nodes, use it directly.
 * - Otherwise wrap the raw string as a single paragraph.
 */
function deserialize(value: string | null | undefined): Descendant[] {
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

/**
 * Serialize Slate nodes back to a JSON string for storage.
 * Storing as JSON keeps rich formatting intact; change to plain-text
 * extraction here if your DB column only holds plain strings.
 */
function serialize(nodes: Descendant[]): string {
  return JSON.stringify(nodes)
}

// ---------------------------------------------------------------------------
// Schema — description stored as serialised Slate JSON
// ---------------------------------------------------------------------------
const formSchema = z.object({
  description: z
    .string()
    .min(1, { message: 'Chapter description is required' }),
})

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ChapterDescriptionForm({
  initialData,
  courseId,
  chapterId,
}: ChapterDescriptionFormProps) {
  const [isEditing, setIsEditing] = useState(false)

  // Keep a stable editor instance across renders.
  // useMemo / useRef both work; useCallback with an initialiser is idiomatic.
  const [editor] = useState(() => withHistory(withReact(createEditor())))

  // The Slate value lives in local state so the editor stays controlled.
  // We initialise from the DB value and keep RHF in sync via Controller.
  const [slateValue, setSlateValue] = useState<Descendant[]>(() =>
    deserialize(initialData?.description),
  )

  // Check if no description
  const isEmpty =
    slateValue.length === 0 ||
    (slateValue.length === 1 &&
      Editor.isEmpty(editor, slateValue[0] as CustomElement))

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Store the serialised representation so zod can validate it.
      description: initialData?.description || '',
    },
  })

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const onToggleEdit = () => {
    // Reset Slate state to the saved value when cancelling
    if (isEditing) {
      setSlateValue(deserialize(initialData?.description))
      form.reset({ description: initialData?.description || '' })
    }
    setIsEditing((prev) => !prev)
  }

  const onSubmitForm = async (formData: z.infer<typeof formSchema>) => {
    try {
      if (isEmpty) formData.description = ''

      const response = await updateChapter(formData, courseId, chapterId)
      if (response?.success) {
        toast.success('Chapter description updated.')
        onToggleEdit()
        setSlateValue(deserialize(formData.description))
      } else {
        toast.error(
          response?.error || 'Something went wrong, please try again.',
        )
      }
    } catch (error) {
      console.error('UPDATE CHAPTER FORM SUBMIT ERROR', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const { isValid, errors, isSubmitting } = form.formState

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className='p-4 mt-6 border rounded-md bg-slate-100'>
      <div className='flex items-center justify-between font-medium'>
        Chapter Description
        <Button onClick={onToggleEdit} variant='ghost'>
          {isEditing ? (
            'Cancel'
          ) : (
            <>
              <Pencil className='w-4 h-4 mr-2' />
              Edit description
            </>
          )}
        </Button>
      </div>

      {/* ── Display mode ───────────────────────────────────────────────── */}
      {!isEditing && isEmpty && (
        <p className='mt-2 text-sm italic text-slate-500'>No description</p>
      )}

      {!isEditing && !isEmpty && <EditorPreview value={slateValue} />}

      {/* ── Edit mode ──────────────────────────────────────────────────── */}
      {isEditing && (
        <form
          onSubmit={form.handleSubmit(onSubmitForm)}
          className='mt-4 space-y-4'
        >
          <FieldGroup>
            {/*
             * Controller bridges react-hook-form and the Slate editor:
             *   • field.value  → what RHF holds (serialised string for zod)
             *   • field.onChange → called whenever Slate content changes
             *
             * We pass slateValue / onSlateChange to the editor so it stays
             * a controlled component, and mirror every change into RHF so
             * validation runs correctly.
             */}
            <Controller
              control={form.control}
              name='description'
              render={({ field }) => (
                <Field>
                  <EditorSlate
                    // Slate-specific props
                    editor={editor}
                    value={slateValue}
                    onChange={(newValue: Descendant[]) => {
                      setSlateValue(newValue)
                      // Serialise and push into RHF so zod can validate
                      field.onChange(serialize(newValue))
                    }}
                    // Pass through ref & name so RHF can focus the field on error
                    ref={field.ref}
                    name={field.name}
                  />
                  {errors.description && (
                    <FieldError
                      errors={[{ message: errors.description.message }]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <div className='flex items-center gap-x-2'>
            <Button disabled={!isValid || isSubmitting} type='submit'>
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
