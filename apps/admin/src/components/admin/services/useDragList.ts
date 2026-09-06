'use client'

import { useState, type DragEvent } from 'react'

/**
 * Перетаскивание строк одного уровня (корень «Главной» либо дети одного
 * родителя). HTML5-драг без зависимостей: список короткий и живёт в админке.
 *
 * ``onReorder`` зовётся один раз в момент drop — уже с новым порядком слагов
 * целиком, как его ждёт POST /admin/services/reorder.
 */
export function useDragList(
    order: string[],
    onReorder: (next: string[]) => void,
    enabled = true,
) {
    const [dragging, setDragging] = useState<string | null>(null)
    const [over, setOver] = useState<string | null>(null)

    const reset = () => {
        setDragging(null)
        setOver(null)
    }

    const drop = (target: string) => {
        if (!dragging || dragging === target) return reset()
        const next = order.filter((slug) => slug !== dragging)
        const at = next.indexOf(target)
        if (at < 0) return reset()
        // Тащим вниз — встаём после цели, вверх — перед ней: так строка
        // оказывается ровно там, куда её отпустили.
        const from = order.indexOf(dragging)
        const to = order.indexOf(target)
        next.splice(from < to ? at + 1 : at, 0, dragging)
        reset()
        onReorder(next)
    }

    /** Тащит только ручка — иначе свитч и кнопки строки конфликтуют с драгом;
     *  принимает вся строка, чтобы попасть было легко. */
    const itemProps = (slug: string) =>
        enabled
            ? {
                  handle: {
                      draggable: true,
                      onDragStart: (e: DragEvent) => {
                          e.dataTransfer.effectAllowed = 'move'
                          // Firefox не начинает драг без данных в буфере.
                          e.dataTransfer.setData('text/plain', slug)
                          setDragging(slug)
                      },
                      onDragEnd: reset,
                  },
                  row: {
                      onDragOver: (e: DragEvent) => {
                          e.preventDefault()
                          e.dataTransfer.dropEffect = 'move'
                          if (over !== slug) setOver(slug)
                      },
                      onDragLeave: () => setOver((c) => (c === slug ? null : c)),
                      onDrop: (e: DragEvent) => {
                          e.preventDefault()
                          drop(slug)
                      },
                  },
              }
            : { handle: {}, row: {} }

    return { dragging, over, itemProps }
}
