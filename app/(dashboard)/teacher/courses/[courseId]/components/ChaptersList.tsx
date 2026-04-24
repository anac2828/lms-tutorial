'use client'

import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd'
import { useEffect, useState } from 'react'
import { Grip, Pencil } from 'lucide-react'
import { Chapter } from '@/lib/generated/prisma/client'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ChaptersListProps {
  items: Chapter[]
  onReorder: (updateData: { id: string; position: number }[]) => void
  onEdit: (id: string) => void
  courseId: string
}

export function ChaptersList({ items, onReorder, onEdit }: ChaptersListProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [chapters, setChapters] = useState(items)

  useEffect(() => {
    setIsMounted(true)
  }, [setIsMounted])

  useEffect(() => {
    setChapters(items)
  }, [items])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(chapters)
    //   returns removed item
    const [reorderedItem] = items.splice(result.source.index, 1)
    //   Inserts reorderedItem
    items.splice(result.destination.index, 0, reorderedItem)
    //   Returns the small number
    const startIndex = Math.min(result.source.index, result.destination.index)
    //   Returns the larger number
    const endIndex = Math.max(result.source.index, result.destination.index)
    //Return an array copy of items
    const updatedChapters = items.slice(startIndex, endIndex + 1)

    setChapters(items)

    const bulkUpdateData = updatedChapters.map((chapter) => ({
      id: chapter.id,
      position: items.findIndex((item) => item.id === chapter.id),
    }))

    onReorder(bulkUpdateData)
  }

  // if ChapterList component is not mounted
  if (!isMounted) return null

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='chapters'>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {/* CHAPTER LIST */}
            {chapters.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
                index={index}
              >
                {(provided) => (
                  <div
                    className={cn(
                      'flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm',
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    {/* DRAG ICON */}
                    <div
                      className={cn(
                        'px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition',
                        chapter.isPublished &&
                          'border-r-sky-200 hover:bg-sky-200',
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className='w-5 h-5' />
                    </div>
                    {/* TITLE */}
                    {chapter.title}
                    {/* ICONS */}
                    <div className='flex items-center pr-2 ml-auto gap-x-2'>
                      {chapter.isFree && <Badge>Free</Badge>}
                      <Badge
                        className={cn(
                          'bg-slate-500',
                          chapter.isPublished && 'bg-sky-700',
                        )}
                      >
                        {chapter.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(chapter.id)}
                        className='w-4 h-4 transition cursor-pointer hover:opacity-75'
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
