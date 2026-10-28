import type { Component } from 'vue'
import type { BoardObjectKind } from './board-object'
import BoldEditor from '~/components/editors/BoldEditor.vue'
import BorderEditor from '~/components/editors/BorderEditor.vue'
import ColorEditor from '~/components/editors/ColorEditor.vue'
import FontSizeEditor from '~/components/editors/FontSizeEditor.vue'

export type Attribute = 'color' | 'fontSize' | 'bold' | 'border'

// Which attributes each kind of object has, in toolbar order.
export const KIND_ATTRIBUTES: Record<BoardObjectKind, Attribute[]> = {
  note: ['color', 'fontSize', 'bold'],
  text: ['fontSize', 'bold'],
  circle: ['border', 'color'],
}

// Which editor edits which attribute.
export const ATTRIBUTE_EDITORS: Record<Attribute, Component> = {
  color: ColorEditor,
  fontSize: FontSizeEditor,
  bold: BoldEditor,
  border: BorderEditor,
}
