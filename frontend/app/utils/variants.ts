import type { Component } from 'vue'
import { Circle, Heading, StickyNote, Type } from '@lucide/vue'
import { BoardObject, type BoardObjectKind } from './board-object'
import { snapToGrid } from './grid'

export interface Point {
  x: number
  y: number
}

export interface Variant {
  label: string
  icon: Component
  iconClass: string
  create: (center: Point) => BoardObject
}

interface Shape {
  kind: BoardObjectKind
  width: number
  height: number
  color: string
  fontSize: string
  bold: boolean
  border: boolean
  text: string
}

// Builds a variant whose objects appear centered on the given point, snapped to the grid.
function variant(label: string, icon: Component, iconClass: string, shape: Shape): Variant {
  return {
    label,
    icon,
    iconClass,
    create: (center) =>
      new BoardObject({
        ...shape,
        x: snapToGrid(center.x - shape.width / 2),
        y: snapToGrid(center.y - shape.height / 2),
      }),
  }
}

const plain = { fontSize: 'text-lg', bold: false, border: false, text: '' }
const note = (color: string) => ({ ...plain, kind: 'note' as const, width: 192, height: 192, color })
const circle = (color: string) => ({ ...plain, kind: 'circle' as const, width: 144, height: 144, color })

export const VARIANT_GROUPS: Variant[][] = [
  [
    variant('Post-it Gelb', StickyNote, 'fill-yellow-200', note('bg-yellow-200')),
    variant('Post-it Rosa', StickyNote, 'fill-pink-200', note('bg-pink-200')),
    variant('Post-it Blau', StickyNote, 'fill-sky-200', note('bg-sky-200')),
    variant('Post-it Grün', StickyNote, 'fill-green-200', note('bg-green-200')),
  ],
  [
    variant('Überschrift', Heading, '', { ...plain, kind: 'text', width: 288, height: 72, color: '', fontSize: 'text-3xl', bold: true, text: 'Überschrift' }),
    variant('Text', Type, '', { ...plain, kind: 'text', width: 240, height: 72, color: '', text: 'Text' }),
  ],
  [
    variant('Kreis Rot', Circle, 'fill-red-300', circle('bg-red-300')),
    variant('Kreis Orange', Circle, 'fill-orange-300', circle('bg-orange-300')),
    variant('Kreis Violett', Circle, 'fill-violet-300', circle('bg-violet-300')),
    variant('Kreis Türkis', Circle, 'fill-teal-300', circle('bg-teal-300')),
  ],
]

// All variants in toolbar order; keys 1–9 and 0 add them.
export const VARIANTS = VARIANT_GROUPS.flat()

export function variantKey(variant: Variant) {
  return String((VARIANTS.indexOf(variant) + 1) % 10)
}
